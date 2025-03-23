import random, json
from threading import Thread, Timer
from time import ctime, time as cu_time, sleep

import requests

graph = [
    [0, 5, 0, 12, 0, 0],
    [5, 0, 4, 5, 8, 0],
    [0, 4, 0, 6, 0, 7],
    [12, 5, 6, 0, 0, 5],
    [0, 8, 0, 0, 0, 3],
    [0, 0, 7, 5, 3, 0]
]

ids = [
    'n1',
    'n2',
    'n3',
    'n4',
    'n5',
    'n6',
]

decisions = ['stay', 'move', 'exit']
# dead_count = 0

# holding = [3, 2, 9, 3, 4, 8]

# crowd = [0, 0, 0, 0, 0, 0]
# people = []

class Node:
    def __init__(self, name, capacity, holding, spawning_point = False, container = False):
        self.name = name
        self.capacity = capacity
        self.holding = holding
        self.spawning_point = spawning_point
        random_range = (5 if container else 1, 10 if container else 5)
        start_range = random.randint(*random_range)
        self.stay_range = (start_range, start_range+10)
        self.crowd_count = 0
    
    def create_connection(self, *nodes):
        self.adjacent_nodes: list[tuple[int, Node]] = list(nodes)

class Person:
    def __init__(self, name):
        self.name = name
        self.propability = [ random.choice(decisions) for i in range(10) ]
        self.logs = []
        self.duration = 0
        self.force_exit = False
        self.birth = None

    def on_arrived(self, destiny: Node):
        if self.birth == None: self.birth = cu_time()
        self.logs.append({
            'event': 'arrived',
            'location': destiny.name,
            'duration': self.duration
        })
        destiny.crowd_count += 1
        self.duration = destiny.holding
        return destiny.holding, self.on_decision, [destiny]
    
    def choose_destiny(self, current_node: Node):
        for i in range(len(current_node.adjacent_nodes)):
            time, destiny = random.choice(current_node.adjacent_nodes)
            if destiny.crowd_count/destiny.capacity < 0.95:
                return time, destiny
        
        if current_node.crowd_count/current_node.capacity < 0.95: return None
        return random.choice(current_node.adjacent_nodes)

    def on_decision(self, current_node: Node):
        decision = 'exit' if self.force_exit else random.choice(self.propability)
        
        if current_node.crowd_count/current_node.capacity >= 0.95: decision = 'exit'

        if decision == 'stay':
            time_spending = random.randint(*current_node.stay_range)
            self.duration += time_spending
            return time_spending, self.on_decision, [current_node]
        
        self.logs.append({
            'event': 'waited',
            'location': current_node.name,
            'duration': self.duration
        })
        
        current_node.crowd_count -= 1

        if cu_time() - self.birth < 30 or decision != 'exit' or not current_node.spawning_point:
            result = self.choose_destiny(current_node)
            if result is None:
                current_node.crowd_count += 1
                time_spending = random.randint(*current_node.stay_range)
                self.duration += time_spending
                return time_spending, self.on_decision, [current_node]

            time, destiny = result
            self.duration = time
            self.logs.append({
                'event': 'moving',
                'location': destiny.name,
                'duration': time
            })
            return time, self.on_arrived, [destiny]

        self.logs.append({
            'event': 'leaving',
            'location': current_node.name,
            'duration': 0
        })

        with open(f'logs/{self.name}.logs.json', 'w') as js_file:
            json.dump(self.logs, js_file, indent=4)
            
class Simulator:
    current_time = 0
    people = []

    def __init__(self, node_names, incoming, gate_closing, system_closing = None, sec_delay = None, logging = True, on_update_callback = None):
        self.node_names = node_names
        self.incoming = incoming
        self.gate_closing = gate_closing
        self.sec_delay = sec_delay
        self.logging = logging
        self.on_update_callback = on_update_callback
        self.current_time = int(cu_time())
        
        if system_closing is not None: self.schedule_task(system_closing, self.shutdown)

        self.nodes = [ Node(node_name, 30, random.randint(1, 9), node_name in "A", node_name in "CF") for node_name in node_names ]
        for i, node in enumerate(self.nodes):
            adjs = list(filter(lambda x: x[0] > 0, [ (graph[i][j], self.nodes[j]) for j in range(len(self.nodes)) ]))
            node.create_connection(*adjs)
        
        for person_id in range(incoming):
            person = Person(f'p{person_id}')
            self.people.append(person)
            
            self.schedule_task(random.randint(0, gate_closing), person.on_arrived, [self.nodes[0]])
            # Timer(random.randint(1, gate_closing), person.on_arrived, [nodes[0]]).start()
    
    pending_tasks = []
    def schedule_task(self, delay: int, callback, args: list = []):
        self.pending_tasks.append({
            'time': self.current_time + delay,
            'callback': callback,
            'args': args
        })

    def shutdown(self):
        for person in self.people:
            person.force_exit = True
    
    def run(self):
        count_logs = []
        while len(self.pending_tasks) > 0:
            counts = [ node.crowd_count for node in self.nodes ]
            log = (ctime(self.current_time), counts)
            count_logs.append(log)
            if self.logging: print(log[0], *log[1], sep='\t')
            if self.on_update_callback: self.on_update_callback(self.nodes)

            executable_tasks = [ pending_task for pending_task in self.pending_tasks if pending_task['time'] <= self.current_time ]
            for task in executable_tasks:
                self.pending_tasks.remove(task)

                rtv = task['callback'](*task['args'])

                if rtv is not None:
                    self.schedule_task(*rtv)
            
            if self.sec_delay is not None: sleep(self.sec_delay)
            self.current_time += 1
        
        with open('logs/count.logs.json', 'w') as js_file:
            json.dump(count_logs, js_file, indent=4)
        
    
node_names = [ x for x in "ABCDEF" ]
# incoming = 20
# gate_closing = 5

def on_update(nodes: list[Node]):
    status = []
    for node in nodes:
        cumulative = sum([node.crowd_count, *[ x[1].crowd_count for x in node.adjacent_nodes ] ])
        s_count = node.crowd_count
        c_percent = cumulative/node.capacity
        s_percent = s_count/node.capacity

        if node.spawning_point and s_percent > 0.75: status.append('Hi Risk')
        elif c_percent < 1: status.append('Safe')
        elif s_percent < 0.5: status.append('Caution')
        elif s_percent < 0.75: status.append('Risk')
        else: status.append('Hi Risk')
    
    print('\t\t\t', *status, sep='\t')

simulator = Simulator(node_names, 180, 75, 180, 1, on_update_callback=on_update)
Thread(target=simulator.run).start()

URL = 'https://localhost:5000'

resp = requests.post(f'{URL}/init')
objs = resp.json()

def thread_target(node: Node, id: str):
    sleep(random.randint(0, 5))
    while True:
        try:
            requests.post(f'{URL}/updateSim/{id}', json={ 'count': node.crowd_count })

        except requests.RequestException as e:
            print(f'Request Failed: {e}')
            break
            
        sleep(10)

for i in range(len(simulator.nodes)):
    Thread(target=thread_target, args=[simulator.nodes[i], objs[i]['_id']]).start()