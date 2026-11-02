// Lectures of the example course. Every content feature of the engine appears at least once:
// <dfn>, <fig>, display formulas, notes, recording notes (<voice>), an interactive lab (<ix>), definitions.
// Text is written as String.raw templates (R`...`) so LaTeX backslashes need no escaping.
LECTURES.push({id:'l1',num:1,title:'Signals and sampling',short:'Sampling',
rec:'Includes notes from the recording of this lecture (recording 1). You can hide the notes in the menu.',
sections:[
{id:'l1s1',title:'Continuous and discrete signals',body:R`
<p>A <dfn>signal</dfn> is a quantity that changes over time, such as a voltage \(x(t)\). A computer cannot store a function of a continuous variable, so it keeps only its values at regular instants \(t=nT_s\). The result is a <dfn>discrete-time signal</dfn> \(x[n]=x(nT_s)\), and the number of samples per second is the <dfn>sampling frequency</dfn> \(f_s=1/T_s\).</p>
<fig id="ex_sampling" src="Example slide 4">A 3 Hz sine sampled at 8 Hz: the dots are all the computer keeps.</fig>
<p>Whether those dots still describe the original signal depends on how fast the signal changes compared with how often we sample. That question is the subject of the next section.</p>
<voice r="1" t="12:40"><p>Example of a note from a lecture recording: the lecturer's own explanation or example, paraphrased, with the time in the recording so you can listen back.</p></voice>`},
{id:'l1s2',title:'The sampling theorem and aliasing',body:R`
<p>A sine of frequency \(f\) sampled at \(f_s\) produces exactly the same samples as a sine of frequency \(|f-kf_s|\) for any integer \(k\). If \(f\) is larger than half the sampling frequency, the samples look like those of a slower sine: the frequency appears under a false name, which is called <dfn>aliasing</dfn>. The <dfn>Nyquist–Shannon sampling theorem</dfn> states when this cannot happen:</p>
<div class="formula">\[f_s\gt 2f_{\max}\quad\Longrightarrow\quad x(t)\ \text{can be reconstructed exactly from } x[n].\]</div>
<p>The bound \(f_s/2\) is the <dfn>Nyquist frequency</dfn>. A frequency above it folds back to \(f_{\text{alias}}=|f-\operatorname{round}(f/f_s)\,f_s|\).</p>
<div class="note">Exam example Q1 asks for the alias of a 7 Hz tone sampled at 10 Hz: \(|7-10|=3\) Hz.</div>
<voice r="1" t="48:05" hint><p>Example of an exam tip from a recording: "check the units of \(f_s\) before anything else" — exam tips are shown in the exam colour.</p></voice>
<ix id="samplinglab" title="Sampling lab: move the frequency and watch aliasing appear"></ix>`}
],
defs:[
{t:'Signal',d:R`A quantity that varies with time, e.g. a voltage \(x(t)\).`},
{t:'Discrete-time signal',d:R`The samples \(x[n]=x(nT_s)\) of a signal taken every \(T_s\) seconds.`},
{t:'Sampling frequency \\(f_s\\)',d:R`Number of samples per second, \(f_s=1/T_s\).`},
{t:'Aliasing',d:R`A frequency above \(f_s/2\) produces the same samples as a lower frequency and is mistaken for it.`},
{t:'Nyquist–Shannon sampling theorem',d:R`A signal with highest frequency \(f_{\max}\) is reconstructed exactly from samples taken at \(f_s\gt2f_{\max}\).`},
{t:'Nyquist frequency',d:R`Half the sampling frequency, \(f_s/2\): the highest frequency that sampling can represent.`}
]});

LECTURES.push({id:'l2',num:2,title:'Energy and power of signals',short:'Energy',
sections:[
{id:'l2s1',title:'Energy and average power',body:R`
<p>The <dfn>energy</dfn> of a signal is the area under its square, \(E=\int_{-\infty}^{\infty}|x(t)|^2\,dt\). Periodic signals have infinite energy, so for them we use the <dfn>average power</dfn> over one period:</p>
<div class="formula">\[P=\frac1T\int_0^T|x(t)|^2\,dt,\qquad P_{\sin}=\frac{A^2}{2}.\]</div>
<p>A sine of amplitude \(A\) therefore has power \(A^2/2\), whatever its frequency.</p>`}
],
defs:[
{t:'Energy',d:R`\(E=\int|x(t)|^2dt\); finite for pulses, infinite for periodic signals.`},
{t:'Average power',d:R`\(P=\frac1T\int_0^T|x(t)|^2dt\) for a periodic signal; \(A^2/2\) for a sine of amplitude \(A\).`}
]});
