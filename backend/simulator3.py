import random, json
from threading import Timer
from time import ctime, time as cu_time, sleep

graph = [
    [0, 5, 0, 12, 0, 0],
    [5, 0, 4, 5, 8, 0],
    [0, 4, 0, 6, 0, 7],
    [12, 5, 6, 0, 0, 5],
    [0, 8, 0, 0, 0, 3],
    [0, 0, 7, 5, 3, 0]
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
        self.people_in_view: list[str] = []
    
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
        destiny.people_in_view.append(self.name)
        self.duration = destiny.holding
        return destiny.holding, self.on_decision, [destiny]
    
    def choose_destiny(self, current_node: Node):
        for i in range(len(current_node.adjacent_nodes)):
            time, destiny = random.choice(current_node.adjacent_nodes)
            if len(destiny.people_in_view)/destiny.capacity < 0.95:
                return time, destiny
        
        if len(current_node.people_in_view)/current_node.capacity < 0.95: return None
        return random.choice(current_node.adjacent_nodes)

    def on_decision(self, current_node: Node):
        decision = 'exit' if self.force_exit else random.choice(self.propability)
        
        if len(current_node.people_in_view)/current_node.capacity >= 0.95: decision = 'exit'

        if decision == 'stay':
            time_spending = random.randint(*current_node.stay_range)
            self.duration += time_spending
            return time_spending, self.on_decision, [current_node]
        
        self.logs.append({
            'event': 'waited',
            'location': current_node.name,
            'duration': self.duration
        })
        
        current_node.people_in_view.remove(self.name)

        if cu_time() - self.birth < 30 or decision != 'exit' or not current_node.spawning_point:
            result = self.choose_destiny(current_node)
            if result is None:
                current_node.people_in_view.append(self.name)
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
            counts = [ len(node.people_in_view) for node in self.nodes ]
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

history_limit = 30
history: list[dict[Node, tuple[int, int]]] = []
prev: dict[Node, list[str]] = {}
totalIn: dict[Node, int] = {}
totalOut: dict[Node, int] = {}
in_rate_logs = []
out_rate_logs = []
agg_rate_logs = []

def on_update(nodes: list[Node]):
    global total
    cHist: dict[Node, tuple[int, int]] = {}
    for node in nodes:
        incoming_people = list(filter(lambda x: node not in prev or x not in prev[node], node.people_in_view))
        outgoing_people = list(filter(lambda x: x not in node.people_in_view, prev[node] if node in prev else []))
        cHist[node] = len(incoming_people), len(outgoing_people)

        prev[node] = [ *node.people_in_view ]
    
    for src in cHist:
        if src not in totalIn: totalIn[src] = 0
        if src not in totalOut: totalOut[src] = 0
        cTotalIn, cTotalOut = cHist[src]
        totalIn[src] += cTotalIn
        totalOut[src] += cTotalOut

    history.insert(0, cHist)

    if len(history) >= history_limit:
        trashed = history.pop()

        for src in trashed:
            cTotalIn, cTotalOut = trashed[src]
            totalIn[src] -= cTotalIn
            totalOut[src] -= cTotalOut

    inRate = { node: totalIn[node] / len(history) for node in nodes }

    outRate = { node: totalOut[node] / len(history) for node in nodes }

    aggRate = { node: inRate[node] - outRate[node] for node in nodes }

    print("\t\tIn Rate:", *[f"{inRate[node]:.2f}" for node in nodes], sep="\t")

    print("\t\tOut Rate:", *[f"{outRate[node]:.2f}" for node in nodes], sep="\t")

    print("\t\tAgg Rate:", *[f"{aggRate[node]:.2f}" for node in nodes], sep="\t")
    
    for node in nodes:
        current_count = len(node.people_in_view)
        capacity = node.capacity

        if aggRate[node] > -0.01 and aggRate[node] < 0.01:
            print(f"\tNode {node.name} will be stable with current count {current_count}")
        elif aggRate[node] < 0:
            et = current_count / -aggRate[node]
            print(f"\tNode {node.name} will get empty in {et:.2f} seconds")
        elif current_count >= capacity:
            print(f"\tNode {node.name} is overcrowded")
        else:
            et = (capacity - current_count) / aggRate[node]
            print(f"\tNode {node.name} will get overcrowded in {et:.2f} seconds")

    in_rate_logs.append({ node.name: inRate[node] for node in inRate })
    out_rate_logs.append({ node.name: outRate[node] for node in outRate })
    agg_rate_logs.append({ node.name: aggRate[node] for node in aggRate })
    
    print()

simulator = Simulator(node_names, 180, 60, 90, 0.01, on_update_callback=on_update)
simulator.run()

with open('logs/inRate.json', 'w') as js:
    json.dump(in_rate_logs, js)

with open('logs/outRate.json', 'w') as js:
    json.dump(out_rate_logs, js)

with open('logs/aggRate.json', 'w') as js:
    json.dump(agg_rate_logs, js)