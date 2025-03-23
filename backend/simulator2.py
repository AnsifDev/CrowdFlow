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
history: list[dict[Node, dict[Node, int]]] = []
people_left: dict[Node, list[str]] = {}
prev: dict[Node, list[str]] = {}
contrib: dict[Node, dict[Node, int]] = {}
total: dict[Node, int] = {}

# def predict_time(nodes: list[Node]):
#     for src in nodes:
#         rate_sum:
#         for dist, dest in src.adjacent_nodes:

            

def fetch_src_node(pid: str) -> Node:
    for node in people_left:
        if pid in people_left[node]: 
            people_left[node].remove(pid)
            return node
    
    return None

def on_update(nodes: list[Node]):
    global total
    cHist: dict[Node, dict[Node, int]] = {}
    for node in nodes:
        incoming_people = list(filter(lambda x: node not in prev or x not in prev[node], node.people_in_view))
        outgoing_people = list(filter(lambda x: x not in node.people_in_view, prev[node] if node in prev else []))
        if node not in people_left: people_left[node] = []
        people_left[node] += outgoing_people
        for pid in incoming_people:
            src_node = fetch_src_node(pid)
            if src_node is None: continue
            if src_node not in cHist: cHist[src_node] = {}
            if node not in cHist[src_node]: cHist[src_node][node] = 0
            cHist[src_node][node] += 1

        prev[node] = [ *node.people_in_view ]
    
    for src in cHist:
        for dest in cHist[src]:
            if src not in contrib: contrib[src] = {}
            if src not in total: total[src] = 0
            if dest not in contrib[src]: contrib[src][dest] = 0
            total[src] += cHist[src][dest]
            contrib[src][dest] += cHist[src][dest]

    history.insert(0, cHist)

    if len(history) >= history_limit:
        trashed = history.pop()

        for src in trashed:
            for dest in trashed[src]:
                total[src] -= trashed[src][dest]
                contrib[src][dest] -= trashed[src][dest]
    
    for src in nodes:
        if src in contrib:
            print(f"From {src.name}")

            total_contrib = total[src]
            destinations = contrib[src]

            if total_contrib > 0:
                for dest in destinations:
                    print(f"\tContrib to {dest.name} is {(destinations[dest]/total_contrib)*100}%")

        inRate = 0.0
        current = len(src.people_in_view)
        for dist, adj in src.adjacent_nodes:
            if adj not in contrib: continue
            if src not in contrib[adj]: continue
            if total[adj] == 0: continue
            contrib_rate = contrib[adj][src]/total[adj]
            adj_current = len(adj.people_in_view)
            inRate += (adj_current*contrib_rate)/dist
        
        if inRate == 0: continue

        outRate = 0.0
        if src in contrib:
            outRate = total[src] / len(history)

        rate = inRate - outRate

        if src not in contrib:
            print(f"From {src.name}")
        
        remaining = max(src.capacity - current, 0)
        time_to_fill = remaining/rate

        if time_to_fill == 0:
            print("\tThis node is overcrowded")
            continue

        if time_to_fill < 0:
            print(f"\tThis node will get empty in {-time_to_fill}")
        else:
            print(f"\tThis node will get overcrowded in {time_to_fill}")

        # if time_to_fill > 10:
        #     if current/src.capacity < 0.25: print("\tState: Safe")
        #     else: print("\tState: Caution")
        # elif time_to_fill > 5:
        #     if current/src.capacity < 0.25: print("\tState: Caution")
        #     else: print("\tState: Risk")
        # elif time_to_fill > 3:
        #     if current/src.capacity < 0.25: print("\tState: Risk")
        #     else: print("\tState: Hi Risk")
        # else: print("\tState: Hi Risk")

simulator = Simulator(node_names, 180, 75, 180, 1, on_update_callback=on_update)
simulator.run()