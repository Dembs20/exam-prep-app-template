import itertools, numpy as np
from fractions import Fraction as F

def adj(n, links):
    A = np.zeros((n, n), int)
    for a, b in links: A[a-1, b-1] = A[b-1, a-1] = 1
    return A
def hop(A):
    n = len(A); H = np.full((n, n), 99)
    for s in range(n):
        H[s, s] = 0; q = [s]
        while q:
            u = q.pop(0)
            for w in range(n):
                if A[u, w] and H[s, w] == 99: H[s, w] = H[s, u] + 1; q.append(w)
    return H
def local_c(A):
    d = A.sum(1); out = []
    for v in range(len(A)):
        nb = np.where(A[v])[0]
        y = sum(A[i, j] for i, j in itertools.combinations(nb, 2))
        out.append(F(0) if d[v] < 2 else F(2*y, int(d[v]*(d[v]-1))))
    return out

ex = adj(6, [(1,2),(1,3),(1,6),(2,3),(2,5),(2,6),(3,4),(4,5),(5,6)])
H = hop(ex)
print('running example degrees', ex.sum(1).tolist(), 'sum', ex.sum())
print('H matches text:', H.tolist() == [[0,1,1,2,2,1],[1,0,1,2,1,1],[1,1,0,1,2,2],[2,2,1,0,1,2],[2,1,2,1,0,1],[1,1,2,2,1,0]])
print('E[H] =', F(int(H.sum()), 30), ' farness', H.sum(1).tolist())
S = [0, 1, 5]; rest = [2, 3, 4]
print('cut S={1,2,6}:', int(ex[np.ix_(S, rest)].sum()), ' internal S', int(ex[np.ix_(S, S)].sum()//2), ' internal rest', int(ex[np.ix_(rest, rest)].sum()//2))
# list of neighbours
print('neighbours 1,2,3:', [ (np.where(ex[i])[0]+1).tolist() for i in range(3)])

k4e = adj(4, [(1,2),(1,3),(2,3),(2,4),(3,4)])
c = local_c(k4e); d = k4e.sum(1)
tri = int(np.trace(np.linalg.matrix_power(k4e, 3))) // 6
print('K4-e local c', [str(x) for x in c], 'c_G', sum(c)/4, ' check_c', F(6*tri, int((d*(d-1)).sum())))
Hk = hop(k4e); print('K4-e E[H]', F(int(Hk.sum()), 12), 'rho', Hk.max())

# graphicality
def eg(d):
    d = sorted(d, reverse=True)
    if sum(d) % 2: return False
    return all(sum(d[:k]) <= k*(k-1) + sum(min(x, k) for x in d[k:]) for k in range(1, len(d)+1))
print('EG (4,3,3,2,1,1):', eg([4,3,3,2,1,1]), ' (3,3,1,1):', eg([3,3,1,1]))
print('EG table:', [(sum(sorted([4,3,3,2,1,1],reverse=True)[:k]), k*(k-1)+sum(min(x,k) for x in sorted([4,3,3,2,1,1],reverse=True)[k:])) for k in range(1,7)])

# modularity of two triangles joined by a link
tt = adj(6, [(1,2),(1,3),(2,3),(4,5),(4,6),(5,6),(3,4)])
L = tt.sum()//2; dd = tt.sum(1); m = F(0)
for cl in ([0,1,2],[3,4,5]):
    Lk = tt[np.ix_(cl,cl)].sum()//2; Dk = dd[cl].sum(); m += F(int(Lk), int(L)) - F(int(Dk), int(2*L))**2
print('two triangles: L', L, 'm =', m)

# assortativity of a star and the formula
star = adj(6, [(1,i) for i in range(2,7)]); d = star.sum(1)
N1, N2, N3 = [int(np.ones(6) @ np.linalg.matrix_power(star,k) @ np.ones(6)) for k in (1,2,3)]
print('star rho_D =', F(N1*N3 - N2**2, int(N1*(d**3).sum() - N2**2)))
# rewiring change formula
da,db,dc,dd_ = 5,2,4,1
print('dN3 identity holds:', 2*((da*dc+db*dd_)-(da*db+dc*dd_)) == 2*(da-dd_)*(dc-db))
# Moore bound Petersen
print('Moore bound d=3 rho=2:', 1 + 3*((3-1)**2 - 1)//(3-2))
# friendship paradox on the running example
d = ex.sum(1); lhs = sum(F(int(ex[i] @ d), int(d[i])) for i in range(6))/6; rhs = F(int(d.sum()), 6)
print('friendship paradox example:', lhs, '>=', rhs, lhs >= rhs)
# unlabelled graphs on 4 nodes
import networkx as nx
reps = []
for mask in range(64):
    G = nx.Graph(); G.add_nodes_from(range(4))
    G.add_edges_from([e for k, e in enumerate(itertools.combinations(range(4), 2)) if mask >> k & 1])
    if not any(nx.is_isomorphic(G, R) for R in reps): reps.append(G)
print('unlabelled graphs on 4 nodes:', len(reps))
C5 = nx.cycle_graph(5); print('C5 self-complementary:', nx.is_isomorphic(C5, nx.complement(C5)))
print('claw is a line graph?', any(nx.is_isomorphic(nx.line_graph(G), nx.star_graph(3)) for G in [nx.Graph(list(e)) for r in range(1,5) for e in itertools.combinations(itertools.combinations(range(5),2), r)] if G.number_of_edges()==4))
