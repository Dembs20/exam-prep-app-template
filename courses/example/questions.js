// Quiz questions. One object per question:
//   id      unique id
//   lec     lecture id ('l1', ...)            sec   section id the question links back to ('l1s2')
//   type    'mc' (graded automatically) or 'open' (show the solution, the student grades themselves)
//   src     where it was asked: [{k:'exam'|'hw'|'lec'|'rec', r:'label shown on the tag'}, ...]; the first entry decides the group
//   q       question text (HTML + LaTeX)
//   o, ans  options and the index of the correct one (write the correct one first and use ans:0; options are shuffled on screen)
//   a       explanation / worked solution
const QUESTIONS=[
{id:'e01',lec:'l1',sec:'l1s2',type:'mc',src:[{k:'exam',r:'Exam example Q1'}],
 q:R`A 7 Hz tone is sampled at \(f_s=10\) Hz. At which frequency does it appear in the samples?`,
 o:[R`3 Hz`,R`7 Hz`,R`10 Hz`,R`17 Hz`],ans:0,
 a:R`7 Hz is above the Nyquist frequency \(f_s/2=5\) Hz, so it folds back to \(|7-10|=3\) Hz.`},
{id:'h01',lec:'l1',sec:'l1s2',type:'open',src:[{k:'hw',r:'Homework 1, Q2'}],
 q:R`An audio signal contains frequencies up to 20 kHz. What is the lowest sampling frequency that avoids aliasing, and why do CDs use 44.1 kHz?`,
 a:R`The theorem needs \(f_s\gt2\cdot20=40\) kHz. CDs use 44.1 kHz to leave room for a real anti-aliasing filter, which cannot cut off sharply at exactly 20 kHz.`},
{id:'c01',lec:'l1',sec:'l1s1',type:'mc',src:[{k:'lec',r:'Lecture 1'}],
 q:R`What is the sampling frequency if a sample is taken every \(T_s=2\) ms?`,
 o:[R`500 Hz`,R`2 Hz`,R`2000 Hz`,R`50 Hz`],ans:0,
 a:R`\(f_s=1/T_s=1/0.002=500\) Hz.`},
{id:'r01',lec:'l2',sec:'l2s1',type:'mc',src:[{k:'rec',r:'In class, rec. 2 at 15:10'}],
 q:R`Which average power does \(x(t)=4\sin(2\pi\cdot50t)\) have?`,
 o:[R`8`,R`16`,R`4`,R`2`],ans:0,
 a:R`For a sine \(P=A^2/2=16/2=8\), independent of the frequency.`}
];
