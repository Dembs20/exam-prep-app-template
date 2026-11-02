LECTURES.push({id:'l5',num:5,title:'Electrical networks I: resistor networks',short:'Electrical I',
sections:[
{id:'l5s1',title:'Function of a network and linear dynamics',body:R`
<p>The function of a network is usually transport over its graph: a flow (current, water, gas) governed by physical laws, or packets (IP, cars, letters) governed by protocols. In a <dfn>linear process</dfn> the link flow is proportional to a nodal difference (current ∝ voltage, heat flow ∝ temperature, spring displacement ∝ force). Writing the nodal quantities as a potential vector \(v\) and the external injections as \(x\),
\[x=Qv\]
with \(Q\) the (weighted) Laplacian: the Laplacian is the operator of all linear flow processes on a graph.</p>
<p>An electrical circuit maps to a graph: terminals/buses are nodes, lines/branches are links. The problem: find all link currents \(y_{ij}\) and node voltages \(v_i\) from the known injections and resistances.</p><fig id="l5_linear" src="L5 slide 3">Linear dynamics: link flow proportional to the potential difference, x = Qv.</fig>`},
{id:'l5s2',title:'Kirchhoff and Ohm in matrix form',body:R`
<p><strong>Kirchhoff's current law</strong> (conservation): the directed currents at each node sum to zero, or to the injected current \(x_i\): \(\sum_j b_{ij}y_j=x_i\), i.e. \(By=x\). <strong>Ohm's law</strong>: \(v_i-v_j=r_{ij}y_{ij}\); the link potential differences are \(\Delta v=B^Tv\), so \(y=\operatorname{diag}(1/r_l)B^Tv\). Substituting Ohm into Kirchhoff:</p>
<div class="formula">\[x=B\operatorname{diag}\!\left(\tfrac1{r_l}\right)B^Tv=\widetilde Qv,\qquad\text{unit resistances: }x=BB^Tv=Qv.\]</div>
<p>The weighted Laplacian is \(\widetilde Q=\widetilde\Delta-\widetilde A\) with \(\tilde a_{ij}=1/r_{ij}\). <strong>Kirchhoff's voltage law</strong> (potential differences around any cycle sum to zero) is automatic once potentials exist; it holds only in absence of time-varying magnetic fields.</p>
<p>Deductions from \(x=Qv\): (1) without injection \(Qv=0\) gives \(v\propto u\), all potentials equal and no currents; (2) \(\det Q=0\) because \(Qu=0\), so \(v=Q^{-1}x\) is impossible. Two remedies: choose a reference node (\(v_N=0\), delete row and column \(N\) of \(Q\) and solve the \((N-1)\)-dimensional system, e.g. by Cramer or inversion), or use the pseudoinverse (next section). Link currents follow from \(y=B^Tv\); a negative \(y_l\) only means the physical current runs against the chosen reference direction of link \(l\), so the incidence matrix was still "correct". Also \(u^Tx=u^TQv=0\): conservation of injected currents.</p>
<div class="note">Homework 2 D.1: \(Q=\begin{pmatrix}2&-1&-1&0\\-1&2&-1&0\\-1&-1&3&-1\\0&0&-1&1\end{pmatrix}\), \(x=(-2,0,0,2)^T\), ground \(v_1=0\) gives \(v=(0,\tfrac23,\tfrac43,\tfrac{10}3)^T\) and \(y=B^Tv=(-\tfrac23,-\tfrac43,-\tfrac23,-2)^T\).</div><fig id="l5_example" src="L5 slide 13">The worked circuit: R = 1 Ω, I = 2 A injected at node 1 and leaving at node 4.</fig><fig id="hw_circuit" src="Homework 2, Problem D.1">Homework 2 D.1: the 4-node circuit with x = (−2, 0, 0, 2)ᵀ.</fig>`},
{id:'l5s3',title:'Pseudoinverse of the Laplacian',body:R`
<p>With the spectral decomposition \(Q=Z\,\mathrm{diag}(\mu)\,Z^T=\sum_{k=1}^{N-1}\mu_kz_kz_k^T\) (the term \(k=N\) vanishes) of a connected graph, the <dfn>pseudoinverse</dfn> (Moore–Penrose inverse) is
\[Q^\dagger=\sum_{k=1}^{N-1}\frac1{\mu_k}z_kz_k^T,\qquad Q^\dagger Q=QQ^\dagger=I-\frac1NJ,\qquad Q^\dagger u=0.\]
An alternative closed form: \(Q^\dagger=(Q+\alpha J)^{-1}-\frac1{\alpha N}J\) for any \(\alpha\ne0\).</p>
<p>Left-multiplying \(x=Qv\) by \(Q^\dagger\): \(Q^\dagger x=(I-\frac1NJ)v=v-v_{av}u\). Choosing the reference such that the average potential is zero, \(u^Tv=0\), gives the inverse pair
\[x=Qv\quad\Longleftrightarrow\quad v=Q^\dagger x,\qquad u^Tx=0,\ u^Tv=0.\]
Physically only potential differences matter: the pseudoinverse solution is the reference-ground solution shifted by a constant. The zero-mean choice suits algebra and spectral analysis; a fixed ground suits engineering practice.</p>
<div class="note">Homework 2 D.2: verify \(QQ^\dagger=I-\frac14J\); \(v=Q^\dagger x=(-\tfrac43,-\tfrac23,0,2)^T\), shifted by \(-\tfrac43\) relative to the grounded solution.</div>`},
{id:'l5s4',title:'Effective resistance and effective graph resistance',body:R`
<p>Inject a current \(I_c\) at node \(a\) and extract it at \(b\): \(x=I_c(e_a-e_b)\). The <dfn>effective resistance</dfn> \(\omega_{ab}\) is defined by \(v_a-v_b=I_c\,\omega_{ab}\). From \(v=Q^\dagger x\):
\[\omega_{ab}=(e_a-e_b)^TQ^\dagger(e_a-e_b)=Q^\dagger_{aa}+Q^\dagger_{bb}-2Q^\dagger_{ab}\ \ge0.\]
With \(\zeta=(Q^\dagger_{11},\dots,Q^\dagger_{NN})^T\), the effective resistance matrix is \(\Omega=u\zeta^T+\zeta u^T-2Q^\dagger\). Properties: \(\Omega\) is symmetric, has zero diagonal and obeys the triangle inequality \(\omega_{ij}\le\omega_{ik}+\omega_{kj}\): it is a distance matrix. Series and parallel rules are special cases: \(\omega=r_1+r_2\) in series, \(\omega=r_1r_2/(r_1+r_2)\) in parallel. The resistance of any single path from \(a\) to \(b\) is at least \(\omega_{ab}\).</p>
<p>The <dfn>effective graph resistance</dfn> is the sum over all node pairs,
\[R_G=\frac12u^T\Omega u=\sum_{i\lt j}\omega_{ij}=N\operatorname{trace}Q^\dagger=N\sum_{k=1}^{N-1}\frac1{\mu_k},\]
using \(u^TQ^\dagger u=0\). Low \(R_G\) means a well-conducting network. <strong>Foster's theorem</strong> (1949): the sum over all links of the effective resistances (weighted by conductance) is \(\sum_{i\sim j}\omega_{ij}/r_{ij}=N-1\), i.e. \(\frac12u^T(\widetilde A\circ\Omega)u=N-1\). Consequently, for unweighted graphs \(R_G=N-1+\frac12u^T(A^c\circ\Omega)u\ge N-1\), with equality only for the complete graph \(K_N\).</p>
<div class="note">Exam prep Q13–16 and Homework 2 D.2(c)–(e) live here: in \(K_4\setminus(1,4)\), \(\omega_{14}=1\) is the largest effective resistance, \(R_G=4\); in the Homework graph \(\omega_{14}=\tfrac53\), \(R_G=\tfrac{19}3\), and adding the 2 missing links gives \(K_4\) with \(R_G=N-1=3\).</div><fig id="l5_qdag" src="L5 slide 28">Pseudoinverse and effective graph resistance of the worked circuit; Foster check gives N − 1 = 3.</fig><ix id="resistorlab" title="Resistor lab: inject a current and read potentials, currents and ω_ab"></ix>`},
{id:'l5s5',title:'Worked examples: four-node graph, weighted star, weighted path',body:R`
<p><strong>Four-node example (slides).</strong> Links (1,2),(1,4),(2,3),(2,4),(3,4) with unit resistances, so \(K_4\) minus link (1,3); \(I=2\) A injected at node 1 and leaving at node 4: \(x=(2,0,0,-2)^T\). Laplacian eigenvalues \(\{4,4,2,0\}\),
\[Q^\dagger=\frac1{16}\begin{pmatrix}5&-1&-1&-3\\-1&3&-1&-1\\-1&-1&3&-1\\-3&-1&-1&5\end{pmatrix},\qquad R_G=N\operatorname{trace}Q^\dagger=4\cdot\frac{16}{16}=4,\]
Foster check \(\sum_{i\sim j}\omega_{ij}=3=N-1\). Series/parallel for the adjacent pair (1,4): \(\omega_{14}=R_2/\!/\big(R_1+(R_4/\!/(R_3+R_5))\big)=1/\!/\big(1+(1/\!/2)\big)=1/\!/\tfrac53=\tfrac58\). In the exam-prep labelling \(K_4\setminus(1,4)\) (nodes 1 and 4 non-adjacent, the \(Q^\dagger\) above): \(\omega_{14}=2/\!/2=1\) (the two middle nodes sit at equal potential, so link (2,3) carries no current), \(\omega_{23}=1/\!/2/\!/2=\tfrac12\), \(R_G=4\).</p>
<p><strong>Weighted star</strong> with centre \(n\) and leaves \(1,\dots,n-1\), link resistances \(r_{kn}\). Current conservation at the hub gives the voltage divider \(v_n=\dfrac{\sum_k v_k/r_{kn}}{\sum_k1/r_{kn}}\); effective resistances \(\omega_{kj}=r_{kn}+r_{jn}\) (series), \(\omega_{kn}=r_{kn}\); \(R_G=(n-1)\sum_{k=1}^{n-1}r_{kn}\); Foster: \(\sum_{k}\omega_{kn}/r_{kn}=n-1\).</p>
<p><strong>Weighted path</strong> \(1-2-\dots-n\): \(\omega_{ab}=\sum_{i=a}^{b-1}r_{i,i+1}\) (series), \(R_G=\sum_{i=1}^{n-1}i(n-i)r_{i,i+1}\); for unit resistances \(R_G=\binom{n+1}3=\frac{n(n^2-1)}6\). Compare with the ring in lecture 6.</p>
<p>Effective resistance and random walks (not part of the exam): with the stochastic matrix \(P=\Delta^{-1}A\), \(\omega_{ij}=\frac1{2L}(E[T_{ij}]+E[T_{ji}])\), proportional to the commute time.</p><fig id="l5_w14" src="L5 slide 30">Series/parallel computation of ω₁₄ for the worked circuit.</fig><fig id="l5_star" src="L5 slide 32">Weighted star: currents from the voltage divider at the hub.</fig>`}
],
defs:[
{t:'Linear process on a graph',d:R`Nodal injections and potentials related by the Laplacian: \(x=Qv\).`},
{t:'Kirchhoff’s current law',d:R`\(By=x\): directed link currents at each node sum to the injected current; \(u^Tx=0\).`},
{t:'Ohm’s law (matrix)',d:R`\(v_i-v_j=r_{ij}y_{ij}\), i.e. \(y=\operatorname{diag}(1/r_l)B^Tv\); unit resistances \(y=B^Tv\).`},
{t:'Kirchhoff’s voltage law',d:R`Potential differences around any closed cycle sum to zero.`},
{t:'Weighted Laplacian \\(\\widetilde Q\\)',d:R`\(\widetilde Q=B\operatorname{diag}(1/r_l)B^T=\widetilde\Delta-\widetilde A\), \(\tilde a_{ij}=1/r_{ij}\).`},
{t:'Reference (ground) node',d:R`Set \(v_k=0\), delete row and column \(k\) of \(Q\); remaining \((N-1)\)-system is invertible for connected \(G\).`},
{t:'Pseudoinverse \\(Q^\\dagger\\)',d:R`\(\sum_{k=1}^{N-1}z_kz_k^T/\mu_k\); \(Q^\dagger Q=QQ^\dagger=I-J/N\); \(Q^\dagger u=0\); \(v=Q^\dagger x\) with \(u^Tv=0\).`},
{t:'Effective resistance \\(\\omega_{ab}\\)',d:R`\(v_a-v_b=I_c\omega_{ab}\); \(\omega_{ab}=Q^\dagger_{aa}+Q^\dagger_{bb}-2Q^\dagger_{ab}\).`},
{t:'Effective resistance matrix \\(\\Omega\\)',d:R`\(\Omega=u\zeta^T+\zeta u^T-2Q^\dagger\), \(\zeta_i=Q^\dagger_{ii}\); symmetric, zero diagonal, triangle inequality (a distance).`},
{t:'Effective graph resistance \\(R_G\\)',d:R`\(R_G=\frac12u^T\Omega u=N\operatorname{trace}Q^\dagger=N\sum_{k\lt N}1/\mu_k\); \(R_G\ge N-1\), equality for \(K_N\).`},
{t:'Foster’s theorem',d:R`\(\sum_{i\sim j}\omega_{ij}/r_{ij}=N-1\).`},
{t:'Series / parallel',d:R`Series \(\omega=r_1+r_2\); parallel \(\omega=r_1r_2/(r_1+r_2)\); any single path resistance \(\ge\omega_{ab}\).`},
{t:'Commute time',d:R`\(\omega_{ij}=\frac1{2L}(E[T_{ij}]+E[T_{ji}])\) for the random walk with \(P=\Delta^{-1}A\) (not on exam).`}
]});

LECTURES.push({id:'l6',num:6,title:'Electrical networks II: spreaders, power, impedance',short:'Electrical II',
sections:[
{id:'l6s1',title:'Best spreader node and the zeta vector',body:R`
<p>Inject a unit current at node \(i\) and let it leave uniformly from all nodes: \(x=e_i-\frac1Nu\). Then \(v=Q^\dagger x=Q^\dagger e_i\) and \(v_i=Q^\dagger_{ii}=\zeta_i\). Also \(Q^\dagger_{ii}=\frac1N\sum_{j=1}^N(v_i-v_j)\gt0\): the diagonal element is the average potential difference from \(i\) to all others. The <dfn>best spreader</dfn> is the node with minimum \(Q^\dagger_{ii}\): it minimises the average "distance" (height in a water network, energy) to all other nodes and lies in the centre of gravity. The vector \(\zeta\) plays a role comparable to the degree vector \(d\). Off-diagonal elements \(Q^\dagger_{ij}\) can be negative or positive (e.g. the path graph), so \(Q^\dagger\) is not in general a Laplacian.</p><fig id="l6_spreader" src="L6 slide 3">Best spreader: unit current injected at node i and leaving uniformly; v_i = Q†_ii.</fig>`},
{id:'l6s2',title:'Closeness versus the pseudoinverse diagonal',body:R`
<p>Closeness \(C_i=1/\sum_{j\ne i}H_{ij}\) uses only shortest paths (packet networks); \(Q^\dagger_{ii}\) uses all paths (flow networks). Both are global metrics, and \(Q^\dagger_{ii}\) is analytically more tractable. From \(\Omega=u\zeta^T+\zeta u^T-2Q^\dagger\) summed over a row,
\[Q^\dagger_{ii}=\frac1N\sum_{j=1}^N\omega_{ij}-\frac{R_G}{N^2}\le\frac1N\sum_{j=1}^N\omega_{ij}\le\frac1N\sum_{j=1}^NH_{ij}=\frac1{NC_i},\]
because in an unweighted graph \(\omega_{ij}\le H_{ij}\), with equality only for a tree (one path). For a weighted tree \(\sum_jH_{ij}=NQ^\dagger_{ii}+R_G/N\). The row sum \(S_i=\sum_j\omega_{ij}=NQ^\dagger_{ii}+\operatorname{trace}Q^\dagger\) defines an effective-resistance closeness \((N-1)/S_i\) (Homework 2 D.2(f)).</p>`},
{id:'l6s3',title:'Power dissipation',body:R`
<p>The power dissipated in a link is \(\wp=VI\); in the network
\[\wp=x^Tv=v^TQv=x^TQ^\dagger x=\sum_{l\in\mathcal L}\frac{(v_{l^+}-v_{l^-})^2}{r_l},\]
using \(\widetilde Q=B\operatorname{diag}(1/r_l)B^T\). For a single injection \(I\) from \(a\) to \(b\): \(\wp=I^2\omega_{ab}\). A link that carries no current can be removed without changing the dissipated power (Exam prep Q15: link (2,3) in \(K_4\setminus(1,4)\) with current from 1 to 4). Which non-constant vector minimises \(v^TQv\) under \(v^Tv=1\)? The Fiedler vector, giving \(a(G)\). Mechanical analogy: balls connected by springs of constant \(k\) have potential energy \(V(x)=\frac k2x^TQx\).</p>
<div class="note">Homework 2 D.2(g): \(\wp=x^Tv=I^2\omega_{14}=4\cdot\tfrac53=\tfrac{20}3\) W.</div><fig id="l6_power" src="L6 slide 9">Power dissipated in a resistor network as a quadratic form.</fig>`},
{id:'l6s4',title:'Impedance networks',body:R`
<p>The RLC series circuit \(L\frac{d^2q}{dt^2}+R\frac{dq}{dt}+\frac qC=v_{ex}\) is mathematically identical to the damped harmonic oscillator \(m\ddot x+c\dot x+kx=F_{ex}\). After a Laplace transform \(V(s)=\int_0^\infty e^{-st}v(t)dt\), a link obeys \(V(s)=Z(s)I(s)+V_0(s)\) with the <dfn>impedance</dfn> \(Z(s)=R+sL+\frac1{sC}\) (a rational function of \(s\in\mathbb C\), \(Z(s)^*=Z(s^*)\)) and \(V_0\) collecting initial conditions. A zero of \(Z\) makes the two end nodes indistinguishable (short), a pole disconnects them (open).</p>
<p>Generalising, the Laplace-transformed weighted Laplacian is
\[Q(s)=B\operatorname{diag}\!\left(\frac1{z_l(s)}\right)B^T,\qquad\hat x(s)=Q(s)\hat v(s),\qquad Q(s)u=0,\]
symmetric but not Hermitian in general, with \(Q_{ij}^*(\sigma+i\omega)=Q_{ij}(\sigma-i\omega)\). The effective graph impedance is \(R_G(s)=N\operatorname{trace}Q^\dagger(s)=N\sum_{k=1}^{N-1}1/\mu_k(s)\); its zeros, poles and inverse transform give time-domain and stability behaviour (open research topic).</p><fig id="l6_impnet" src="L6 slide 16">Generalisation to an impedance network: Q(s) = B diag(1/z_l(s)) Bᵀ.</fig>`},
{id:'l6s5',title:'Ring and path: closed-form effective resistances',body:R`
<p>For the ring \(C_n\) with equal resistors \(R\) (conductance \(g=1/R\)) the Laplacian is circulant with eigenvalues \(\mu_k=4g\sin^2\frac{\pi k}n\), \(k=0,\dots,n-1\) (doubly degenerate except \(k=0\) and \(k=n/2\)). Given \(Q^+_{ij}=\frac R{12n}[(n^2-1)-6d(n-d)]\) with \(d=|i-j|\):
\[\omega_{ij}=Q^+_{ii}+Q^+_{jj}-2Q^+_{ij}=R\frac{d(n-d)}n,\]
which is the parallel combination of the two arcs \(dR\) and \((n-d)R\). Summing, \(R_G(C_n)=\frac R2\sum_{d=1}^{n-1}d(n-d)=\frac{Rn(n^2-1)}{12}\), confirmed spectrally with \(\sum_{k=1}^{n-1}\sin^{-2}(\pi k/n)=\frac{n^2-1}3\).</p>
<p>Cutting one resistor gives the path \(P_n\) (a tree, resistances add in series, \(\omega_{ij}=|i-j|R\)) with \(R_G(P_n)=R\sum_{d=1}^{n-1}(n-d)d=\frac{Rn(n^2-1)}6=2R_G(C_n)\): closing the ring halves the effective graph resistance. With resistances \(R/k\) on resistor \(k\), \(\omega_{ij}=R\frac{(H_j-H_i)(H_n-H_j+H_i)}{H_n}\) with harmonic numbers \(H_m=\sum_{k\le m}1/k\), again two arcs in parallel.</p><ix id="ringlab" title="Ring lab: effective resistance around a cycle"></ix>`},
{id:'l6s6',title:'Simplex geometry of graphs (not on the exam)',body:R`
<p>Writing \(Q=S^TS\) with \(S=\sqrt{\mathrm{diag}(\mu)}Z^T\) of rank \(N-1\), the columns \(s_i\) of \(S\) are the vertices of a simplex in \(\mathbb R^{N-1}\): each connected undirected graph corresponds to one simplex. \(\|s_i-s_j\|^2=d_i+d_j+2q_{ij}\), the Menger distance matrix; the dual (inverse) simplex from \(Q^\dagger\) has \(\|s_i^\dagger-s_j^\dagger\|^2=\omega_{ij}\). The altitude of vertex \(i\) in the inverse simplex is \(1/\sqrt{d_i}\); in the simplex it is \(1/\sqrt{Q^\dagger_{ii}}\), tying the degree and the best-spreader metric together geometrically. Volumes relate to the number of spanning trees. Inspiration only.</p><fig id="l6_simplex" src="L6 slide 26">Geometrical representation: the columns of S are the vertices of a simplex.</fig>`}
],
defs:[
{t:'Best spreader',d:R`Node \(i\) with minimal \(Q^\dagger_{ii}\); \(Q^\dagger_{ii}=\frac1N\sum_j(v_i-v_j)\) for unit injection at \(i\) leaving uniformly.`},
{t:'Zeta vector \\(\\zeta\\)',d:R`\(\zeta=(Q^\dagger_{11},\dots,Q^\dagger_{NN})^T\); plays for flows the role the degree vector plays for paths.`},
{t:'Closeness vs \\(Q^\\dagger_{ii}\\)',d:R`\(Q^\dagger_{ii}\le\frac1N\sum_j\omega_{ij}\le\frac1{NC_i}\); \(\omega_{ij}\le H_{ij}\), equality only in trees.`},
{t:'Power dissipation \\(\\wp\\)',d:R`\(\wp=x^Tv=v^TQv=x^TQ^\dagger x=\sum_l(v_{l^+}-v_{l^-})^2/r_l\); single injection \(\wp=I^2\omega_{ab}\).`},
{t:'Impedance \\(Z(s)\\)',d:R`Laplace-domain link law \(V(s)=Z(s)I(s)+V_0(s)\); RLC: \(Z(s)=R+sL+1/(sC)\).`},
{t:'Laplace-transformed Laplacian \\(Q(s)\\)',d:R`\(Q(s)=B\operatorname{diag}(1/z_l(s))B^T\), \(Q(s)u=0\), symmetric; \(R_G(s)=N\sum_k1/\mu_k(s)\).`},
{t:'Ring \\(C_n\\) eigenvalues',d:R`\(\mu_k=4g\sin^2(\pi k/n)\); \(\omega_{ij}=Rd(n-d)/n\); \(R_G(C_n)=Rn(n^2-1)/12\).`},
{t:'Path \\(P_n\\) resistance',d:R`\(\omega_{ij}=|i-j|R\); \(R_G(P_n)=Rn(n^2-1)/6=2R_G(C_n)\).`},
{t:'Simplex of a graph',d:R`\(Q=S^TS\); columns of \(S\) are simplex vertices in \(\mathbb R^{N-1}\); inverse simplex distances are effective resistances (not on exam).`}
]});
