VOL 75AMS / MAA TEXTBOOKS
Optimal Control
A Differential Equations Approach
Stewart Johnson
Optimal Control
A Differential Equations Approach
AMS/MAA TEXTBOOKS
VOL 75
Optimal Control
A Differential Equations Approach
Stewart Johnson
MAA Textbooks Editorial Board
William R. Green, Co-Editor
Michael J. McAsey, Co-Editor
Paul T. Allen Mark Bollman Susan Crook
Meredith L. Greer Hugh N. Howards Kelly A. Jabbusch
Michael Janssen William Johnston Ryota Matsuura
Pamela Richardson Stephanie Treneer Erika Ward
Elizabeth Wilcox
2020 Mathematics Subject Classification. Primary 49-01, 34-01, 49K15, 49L12, 49N70, 49N90,
34H05, 35Q93, 37N35.
For additional information and updates on this book, visit
www.ams.org/bookpages/text-75
Library of Congress Cataloging-in-Publication Data
Cataloging-in-Publication Data has been applied for by the AMS.
See http://www.loc.gov/publish/cip/.
Copying and reprinting. Individual readers of this publication, and nonprofit libraries acting for them,
are permitted to make fair use of the material, such as to copy select pages for use in teaching or research.
Permission is granted to quote brief passages from this publication in reviews, provided the customary ac-
knowledgment of the source is given.
Republication, systematic copying, or multiple reproduction of any material in this publication is permit-
ted only under license from the American Mathematical Society. Requests for permission to reuse portions
of AMS publication content are handled by the Copyright Clearance Center. For more information, please
visit www.ams.org/publications/pubpermissions.
Send requests for translation rights and licensed reprints to reprint-permission@ams.org.
© 2025 by the American Mathematical Society. All rights reserved.
The American Mathematical Society retains all rights
except those granted to the United States Government.
Printed in the United States of America.
⃝∞ The paper used in this book is acid-free and falls within the guidelines
established to ensure permanence and durability.
Visit the AMS home page at https://www.ams.org/
10 9 8 7 6 5 4 3 2 1 30 29 28 27 26 25
To Mary, my wonderful wife and partner in life.
Contents
Introduction xi
1 Getting Started 1
1.1 A Simple Game 1
1.2 Terminology 6
1.3 The Difficulty 7
1.4 Costs and Ends 8
Key Points 9
Exercises 9
2 Static Optimization 13
2.1 The Derivative 13
2.2 Differentiation 14
2.3 Approximations 15
2.4 Extreme Values 17
2.5 Optimum Along a Path 18
2.6 Lagrange with One Constraint 20
2.7 Higher Dimensions 23
2.8 Multiple Constraints 24
2.9 Lambda 27
2.10 Hamilton and Lagrange 32
Key Points 33
Exercises 33
3 Control: A Discrete Start 35
3.1 Optimal Two-Step Process Control 35
3.2 Optimal 𝑁-Step Process Control 38
3.3 Deriving Principle 0 43
Key Points 45
Exercises 45
4 First Principle 49
4.1 One Dimension, Fixed Ends 49
4.2 Time Dependence 57
4.3 Can We Solve It? 59
Key Points 63
Exercises 63
vii
viii Contents
5 Unpacking Pontryagin 67
5.1 Hamilton and Pontryagin 67
5.2 The Principle of Optimality 71
5.3 Costates 73
5.4 Minimal Surfaces 75
Key Points 78
Exercises 78
6 Easing the Restrictions 81
6.1 One Dimension, Free Ends 81
6.2 When Things Go Wrong 87
6.3 Proving Pontryagin 89
Key Points 93
Exercises 94
7 Linear-Quadratic Systems 99
7.1 Linear-Quadratic with Fixed Ends 99
7.2 Linear-Quadratic with Free Ends 106
Key Points 110
Exercises 111
8 Two Dimensions 115
8.1 Optimal Control in Two Dimensions 116
8.2 Thrust Programming and Rocket Sleds 116
8.3 Zermelo onna Boat 125
8.4 The Brachistochrone Problem 131
Key Points 134
Exercises 134
9 Targets 139
9.1 Free Ends 139
9.2 Hitting a Curve 145
Key Points 152
Exercises 152
10 Switching Controls and Stationarity 155
10.1 Extreme Controls 155
10.2 Bang-Bang Controls 158
10.3 Rocket Races 160
10.4 Stationarity 163
Key Points 166
Exercises 166
11 Time, Value, and Hamilton-Jacobi-Bellman Equation 173
11.1 Time 173
11.2 Performance 178
11.3 Hamilton-Jacobi-Bellman Equation 181
Key Points 186
Exercises 186
Contents ix
12 Differential Games 189
12.1 Games 189
12.2 Differential Games 190
12.3 War 193
Key Points 199
Exercises 199
13 Calculus of Variations 201
13.1 Euler-Lagrange 201
13.2 Isoperimetric Problems 203
13.3 Conversions 204
Key Points 207
Exercises 207
A Table of Principles 209
B Two-Dimensional Linear Systems 211
C Hints 215
D Solutions 219
Bibliography 223
Index 225
Introduction
Humans are intelligent. We influence processes to achieve favorable outcomes, and we
try to get the very best outcome with just the right influence. We optimize.
We do this when choosing an investment strategy to maximize returns, operating
an engine on a hybrid car to minimize fuel use, designing a dosing regime for a medica-
tion to maximize treatment effect, setting an interest rate for an economy to maximize
growth and minimize inflation, establishing policies to maximize sustainable harvests,
and many other cases.
One set of mathematical tools can address all of these situations, and this is the
subject of this text.
```
Our main focus will be differential equation models 𝑥′ = 𝑓(𝑥, 𝑢) containing a
```
state variable 𝑥 and a control parameter 𝑢, and for which we have some performance
measure 𝐽, typically expressed as an integral, that captures the accumulated net payoff
over some time interval. We will explore the tools developed by Lev Pontryagin that
characterize controls 𝑢 that produce maximum values for 𝐽 under specified constraints.
The following points distinguish the approach in this text:
• Designed specifically for undergraduates in mathematics, physics, and economics
programs.
• Assumes nothing more than a good grasp of calculus, differential equations, and
some basic matrix algebra.
• Jumps right in with basic control problems and develops the theory gradually and
naturally, starting with familiar optimization methods from calculus.
• Has a hands-on approach and features examples and problems that can be worked
directly or with the assistance of a computer algebra system.
• Focuses on understanding the structure of the theory and how to apply the princi-
ples to a wide variety of models.
Examples and exercises include basic problems of controlling vehicle thrust, sav-
ing/spending money, inventory management, fisheries management, optimal consump-
tion of diminishing resources, linear-quadratic systems, and the classic brachistochrone
and Zermelo navigation problems. We will also look at some differential games, in-
cluding guarding a target and the war game of attrition and attack. We also generalize
these techniques to apply to geometric constructs like soap films and isoparametric
problems.
xi
xii Introduction
At heart, this text is about mathematical beauty, examined through a meaning-
ful exploration of the deeper structure of differential dynamics through the lens of
```
optimization: how the offsetting influences of costs and benefits fold together over
```
time to produce tantalizing mathematical landscapes that are fascinating, ultimately
intuitive, and very powerful.
To the Student
The emphasis of this text is understanding optimization tools and how to apply them.
This entails using them: understanding the examples and being able to work the exer-
cises are the keys to success.
Understanding the tools requires a good grasp of basic calculus concepts: deriva-
tives, integrals, and gradients.
Using the tools requires solid skills in working with differential equations: solving
```
first-order equations 𝑥′ = 𝑓(𝑥, 𝑡), working with two-dimensional systems (𝑥′, 𝑦′) =
```
```
(𝑓(𝑥, 𝑦), 𝑔(𝑥, 𝑦)) and their associated phase portraits, understanding linear systems,
```
and solving two-point boundary problems. Some of the work with differential equa-
tions can be challenging, and you are strongly encouraged to make good use of com-
puter algebra systems such as SageMath, SymPy, Mathematica, or various other sym-
bolic differential equation solvers. At the time of this writing, AI platforms are notori-
ously bad at solving differential equations, but hopefully this will be improving.
```
Some exercises, marked with (h), have a hint at the back of the book. If you are
```
```
stuck, see if a hint may help you out. Some exercises, marked with (s), have the solution
```
at the back of the book so you can check your answer.
```
Throughout the text I have a number of prompts such as (∗ check this ∗) or
```
```
(∗ verify ∗). These are intended to engage and alert the reader that there is a step here
```
that is not trivial or obvious and that it may be worth pausing to consider how you
would check or verify the step. You may want to work out some of these prompts on
scratch paper in order to fully develop understanding, but I’m not expecting you to stop
at each and every prompt to work out the step by hand.
I hope this study is meaningful for you and that it helps you become a stronger and
more capable mathematician. More than that, I hope you come out of this study with
deeper insight into mathematical structures and a greater appreciation of mathemati-
cal beauty.
To the instructor
While the main purpose of this text is to explore tools for optimal control, it is very
much written to develop greater understanding of and ability to work with sophisti-
cated mathematical structures. This study will develop student skills in working with
differential equations, broaden their insight into optimization concepts, and develop
their understanding of real analytic structures regardless of whether they have had a
formal course in real analysis.
Introduction xiii
The topic of optimization and optimal control is approached intuitively with many
supporting examples. The treatment is mathematically rigorous at a level appropriate
for undergraduates, with the core concepts having careful proofs that are specifically
designed for an undergraduate reader.
The prerequisites are minimal: the student needs a firm grasp of multivariable cal-
```
culus, some basic matrix algebra (up to eigenvalues and eigenvectors for 2×2 systems),
```
a good foundation in solving differential equations and working with phase portraits
for systems of differential equations. Important concepts in calculus and static opti-
mization will be reviewed, including Lagrange multipliers, and we will develop every-
thing else we need as we go.
I avoid a numerical methods approach to this topic, as I have found that approx-
imation tools distract or even obfuscate the core understanding of the concepts, and,
more often than not, the numerical solvers simply fail. As such I rely mainly on exam-
ples and exercises that can be solved in closed form. Some of these can be challenging
for students. I strongly recommend supplementing the course with support for solving
differential equations using a computer algebra platform of choice, such as SageMath,
SymPy, Mathematica, or any other differential equation solver.
Exercises are ordered to follow the chapter material and to build up from easier
computational to more conceptual problems. The text is also peppered with prompts
for the reader to check or verify steps in computations and derivations, which can make
for good short exercises to pace the students through the material.
This text has grown out of teaching a senior-level undergraduate seminar at
Williams College on dynamic modeling and optimal control for over 30 years. Perhaps
my most gratifying experience as an instructor has been hearing from graduates who
report back on how valuable this course has been to them in their growth as mathemati-
cians and how learning these advanced optimization techniques as an undergraduate
has opened opportunities for them in their varied careers. I hope you have a similar
positive experience with this material.
Roadmap
Chapter 1 lays out the basic problem of optimal control in the discrete case and ex-
plains why it can be challenging to solve. Chapter 2 lays a foundation of calculus-level
```
optimization including a review of Lagrange multipliers; this is a longer chapter and
```
```
is intended to be covered fairly quickly (two to three lectures) but may need more or
```
less time depending on background of the learner. Chapter 3 resolves the issues from
Chapter 1 using dynamic Lagrange multipliers, thereby establishing the fundamental
state-costate structure of optimal control. Chapters 4–6 develop Pontryagin’s method
using differential equations in a one-dimensional state space, with Chapter 7 filling
out the ideas in the linear-quadratic case, and Chapter 8 generalizing to higher dimen-
sions. These chapters, 1–8, would be a minimal treatment of the topic. Chapters 9–12
expand the ideas in several important directions and can be covered more or less at
the instructor’s or learner’s discretion. Chapter 13 covers calculus of variations. The
text is designed to be covered at a brisk pace in a standard 12-week semester, although
individual instructors may prefer to swap out some of the later topics for their own
preferred expositions.
xiv Introduction
Thanks!
I am very grateful to all the students who have engaged this material and provided
feedback, suggestions, and corrections. I am particularly thankful to students who
have done some significant work on this material, including Joe Fox, Jonathan Geller,
Seha Karabacak, and Noah Reich. I deeply appreciate the sustained support, guid-
ance, enthusiasm, and many helpful suggestions of my editors, William Green, Michael
McAsey, and Arlene O’Sean.
1
Getting Started
We begin our study with contrived examples of simple processes to establish basic ideas
and terminology for optimal control and to identify the core mathematical challenge
for solving such problems. These are toy problems that illuminate basic concepts. In
these examples, one is influencing the state of a process for a fixed amount of time.
Running costs accrue depending on the state of the process and the amount of control
applied, and a final payoff is awarded depending on the final state of the system. You
want to bring the system to a final state that yields a high payoff without expending too
much along the way. The exercise is to figure out how to influence the process in just
the right way to produce the maximum net gain.
1.1 A Simple Game
The following example is a very simple model of a one-step process with costs and
payoffs. The rules of this game are contrived to make an intuitive example with man-
ageable computation.
Example 1.1: One-Step Bocce
Start with a Bocce ball at given location 𝑥0 on the positive 𝑥-axis.
We may move the ball 𝑢 ≥ 0 units to the right at a cost of 𝑢2/𝑥0 dollars. The
cost is inversely proportional to distance 𝑥0 from the origin, so movement gets
cheaper the further we are down the number line. The cost is also proportional
to the square of the distance 𝑢 that we move, so longer moves get really expensive.
1
2 Chapter 1. Getting Started
The final location of the ball is then 𝑥1 = 𝑥0 + 𝑢. The end payoff is equal to
this distance we moved down the number line, so we collect a payoff of 𝑥1 dollars.
The net payoff in this game is then
```
𝐽(𝑥0, 𝑢) = 𝑥1 − ᵆ2𝑥0
```
```
= (𝑥0 + 𝑢) − ᵆ2𝑥0.
```
So if we start the game at 𝑥0 = 2 and move the ball 𝑢 = 3 units to the right,
we incur a cost of 𝑢2/𝑥0 = 32/2 and collect a payoff of 𝑥0 + 𝑢 = 2 + 3 = 5, for a
```
net gain of 𝐽(2, 3) = 5 − 9/2 = 1/2.
```
Can we get a better payoff ? Starting at 𝑥0 = 2, what is the most we can gain
from this process? This is a question of maximizing the differentiable function
```
𝐽(𝑥0, 𝑢) = 𝑥0 + 𝑢 − 𝑢
```
2
𝑥0
```
over the domain 𝑢 ∈ [0, ∞) for a fixed 𝑥0.
```
First, find places inside the domain with a zero derivative:
0 = 𝜕𝐽𝜕𝑢 = 1 − 2𝑢𝑥
0
⟹ 𝑢 = 12 𝑥0.
Using the move 𝑢 = 𝑥0/2 produces a net payoff of
𝐽 = 54 𝑥0.
This is a local maximum since 𝜕2𝐽𝜕ᵆ2 < 0.
```
The control 𝑢 is restricted to the interval [0, ∞), and we check the endpoints:
```
𝑢 = 0 produces a payoff of 𝐽 = 𝑥0, and 𝑢 → ∞ forces 𝐽 → −∞. Therefore,
starting at 𝑥0, the optimal move is 𝑢 = 𝑥0/2 producing 𝐽 = 5𝑥0/4. No other move
can produce a higher payoff.
We call the optimal payoff starting at 𝑥0 the value of the one-step game:
```
𝑉1(𝑥0) = 5𝑥0/4
```
```
Starting at 𝑥0 = 2 we have 𝐽(2, 𝑢) = 2 + 𝑢 − 𝑢2/2 which attains a maximum
```
```
of 𝐽 = 5/2 at 𝑢 = 1 (Figure 1.1). So 𝑉1(2) = 5/2 is the absolute maximum gain for
```
𝑥0 = 2.
1.1. A Simple Game 3
Figure 1.1. Maximum of 𝐽 as a function of 𝑢.
The one-step game was solved using techniques from single variable calculus. Now
we take the same example with two steps, which will require multivariable calculus.
Example 1.2: Two-Step Bocce
Start with a Bocce ball at location 𝑥0 > 0, and on our first step we move it 𝑢0 ≥ 0
units to the right at a cost of 𝑢20/𝑥0 to a new location 𝑥1 = 𝑥0 + 𝑢0. On the second
step we move the ball 𝑢1 ≥ 0 units to the right at a cost of 𝑢21/𝑥1 to its final location
𝑥2 = 𝑥1 + 𝑢1 and collect a payoff of 𝑥2. Our net payoff is then
```
𝐽(𝑥0, 𝑢0, 𝑢1) = 𝑥2 − 𝑢
```
20
𝑥0−
𝑢21
𝑥1
```
= (𝑥0 + 𝑢0 + 𝑢1) − 𝑢
```
20
𝑥0−
𝑢21
𝑥0 + 𝑢0.
So if we start at 𝑥0 = 2 and implement moves 𝑢0 = 3 followed by 𝑢1 = 4, we
```
have 𝑥1 = 5, 𝑥2 = 9 and our net payoff is 𝐽(2, 3, 4) = 9 − 32/2 − 42/5 = 1.3.
```
Can we get a better payoff? Starting at 𝑥0 = 2, what is the most we can gain
from this process?
In the two-step problem we are given 𝑥0 and have control over 𝑢0 and 𝑢1, so
we look for maximum net gain
```
𝐽(𝑥0, 𝑢0, 𝑢1) = (𝑥0 + 𝑢0 + 𝑢1) − 𝑢
```
20
𝑥0−
𝑢21
𝑥0 + 𝑢0
4 Chapter 1. Getting Started
by setting the partial derivatives 𝜕𝐽𝜕ᵆ0and 𝜕𝐽𝜕ᵆ1equal to zero to find a single critical
```
point (∗ check this ∗):
```
𝑢0 = 58 𝑥0,
𝑢1 = 1316 𝑥0.
Using these moves yields a net payoff of
𝐽 = 10564 𝑥0.
Using techniques from multivariable calculus, we check that the discriminant at
this critical point is positive and the two second derivatives are negative, so this
critical point is a local maximum.
```
Both controls are restricted to the interval [0, ∞). We need to analyze the
```
boundaries 𝑢0 = 0, 𝑢1 = 0, 𝑢0 → ∞, 𝑢1 → ∞ to conclude this is a global
maximum. If either control is zero, the game reduces to the one-step game with
a maximum payoff of 𝐽 = 5 𝑥0/4 < 105 𝑥0/64. The payoff will become negative
for large values of either control.
Therefore, starting at 𝑥0, the optimal moves produce a payoff of 𝐽 = 105 𝑥0/64.
This is the absolute maximum. No other pair of moves can produce a higher pay-
off.
The optimal payoff starting at 𝑥0 is called the value of the two-step game:
```
𝑉2(𝑥0) = 105 𝑥0/64.
```
```
We conclude that for two moves starting at 𝑥0 = 2 we have 𝐽(2, 𝑢0, 𝑢1) =
```
```
(𝑥0 + 𝑢0 + 𝑢1) − 𝑢20/𝑥0 − 𝑢21/(𝑥0 + 𝑢0), which has a maximum of 𝐽 = 3.28 . . . at
```
```
𝑢0 = 1.25 and 𝑢1 = 1.625 (Figure 1.2).
```
Figure 1.2. Contour lines and maximum point for 𝐽 as a func-
tion of 𝑢0, 𝑢1.
Real-world processes may take place over a large number of steps. The following
is the Bocce example for 𝑁 steps.
1.1. A Simple Game 5
Example 1.3: 𝑁-Step Bocce
To generalize the previous examples to 𝑁 steps, start with a Bocce ball at location
𝑥0 > 0, and on our first step we move it 𝑢0 ≥ 0 units to the right at a cost of 𝑢20/𝑥0
to a new location 𝑥1 = 𝑥0 + 𝑢0. On the second step we move the ball 𝑢1 ≥ 0 units
to the right at a cost of 𝑢21/𝑥1 to its final location 𝑥2 = 𝑥1 + 𝑢1, and so on until we
reach a final location 𝑥𝑁 . We collect an end payoff of 𝑥𝑁 , so our net payoff is
```
𝐽(𝑥0, 𝑢0, 𝑢1, . . . , 𝑢𝑁−1) = 𝑥𝑁 − 𝑢
```
20
𝑥0−
𝑢21
𝑥1− ⋯ −
𝑢2𝑁−1
𝑥𝑁−1.
For 𝑁 = 4 this would expand out to be
```
𝐽(𝑥0, 𝑢0, 𝑢1, 𝑢3) = (𝑥0 + 𝑢0 + 𝑢1 + 𝑢2 + 𝑢3) − 𝑢
```
20
𝑥0
− 𝑢
21
𝑥0 + 𝑢0−
𝑢22
𝑥0 + 𝑢0 + 𝑢1−
𝑢23
𝑥0 + 𝑢0 + 𝑢1 + 𝑢2.
To maximize this, we would compute the partials 𝜕𝐽𝜕ᵆ0, . . . , 𝜕𝐽𝜕ᵆ3, set them equal
to zero, and solve the four equations for the four unknown controls 𝑢0, . . . , 𝑢3:
0 = 𝜕𝐽𝜕ᵆ0= 1 − 𝑢0 + ᵆ
21
```
(2+ᵆ0)2 +
```
ᵆ22
```
(2+ᵆ0+ᵆ1)2 +
```
ᵆ23
```
(2+ᵆ0+ᵆ1+ᵆ2)2 ,
```
0 = 𝜕𝐽𝜕ᵆ1= 1 − 2ᵆ12+ᵆ0+ ᵆ
22
```
(2+ᵆ0+ᵆ1)2 +
```
ᵆ23
```
(2+ᵆ0+ᵆ1+ᵆ2)2 ,
```
0 = 𝜕𝐽𝜕ᵆ2= 1 − 2ᵆ22+ᵆ0+ᵆ1+ ᵆ
23
```
(2+ᵆ0+ᵆ1+ᵆ2)2 ,
```
0 = 𝜕𝐽𝜕ᵆ3= 1 − 2ᵆ32+ᵆ0+ᵆ1+ᵆ2.
This is four nonlinear equations in four unknowns. This can be solved by
hand or by using a symbolic processor to conclude that for 𝑥0 = 2 our optimal
choices are 𝑢0 = 2.31 . . . , 𝑢1 = 3.53 . . . , 𝑢2 = 4.91 . . . , and 𝑢3 = 6.38 . . . , with a
net payoff of 𝐽 = 7.30 . . . .
For 𝑁 = 10 we would have 10 equations in 10 unknowns, and working
through a solution and verifying that it is a maximum starts to become quite in-
volved.
6 Chapter 1. Getting Started
The previous example demonstrates that adding more steps compounds the com-
plexity of using calculus techniques to find a maximum. Using this approach, solving
the 𝑁 = 100 case would create a wall of 100 equations in 100 unknowns.
With complicated controls and a large number of steps the problem simply be-
comes impossible to compute by hand and can overwhelm computer symbolic or nu-
merical methods for locating maxima.
Perhaps more importantly, this brute force approach produces a large number of
equations to be solved but doesn’t yield much insight into what is going on within the
process that would lead to good optimization strategies.
We need better tools.
In the 1950s, Lev Pontryagin and his students developed mathematical structures
for analyzing controls by defining a codynamical system of Lagrange multipliers that
addresses the compounding complexity of multiple steps without requiring the simul-
taneous solution of a large number of equations. They defined a quantity, called a
Hamiltonian, within this dynamic/codynamic structure that creates a global optimum
by choosing a local optimum at every step. Understanding this methodology is the core
topic of this text, as will be developed and explored in the upcoming chapters.
We begin by standardizing our terminology for discrete time control processes and
revisiting the problem of compounded complexity demonstrated in the above exam-
ples.
We then need to carefully reexamine the fundamental mathematical structures of
differentiation and optimization and to review the method of Lagrange multipliers,
which we undertake in Chapter 2. The core idea of Pontryagin’s method is developed
in Chapters 3 through 5, and the concepts are more fully explored in the remaining
chapters.
1.2 Terminology
Optimal control uses terminology from dynamical systems.
In the Bocce ball examples the state of the system is the position of the ball, which
could be anywhere on the positive real line, and we call this the state space. We will
work with continuous state spaces, typically ℝ or ℝ𝑛.
The future state of the system is completely determined by the current state, the
location 𝑥 of the ball, and the influence we apply, represented by the control variable
𝑢 which in this case is the distance we move the ball. The Bocce ball examples are
discrete dynamics: if the current state is 𝑥𝑛, the next state is
```
𝑥𝑛+1 = 𝑓(𝑥𝑛, 𝑢𝑛) = 𝑥𝑛 + 𝑢𝑛.
```
The sequence of states is the trajectory of the system. For two-step Bocce, the trajectory
```
is (𝑥0, 𝑥1, 𝑥2), with 𝑥0 as the initial state and 𝑥2 as the final state.
```
The sequence of controls is the control vector or the control function. For two-step
```
Bocce the control vector is (𝑢0, 𝑢1).
```
We want to maximize payoff, which we typically think of as being positive, with
negative payoffs being cost.
Payoffs have two components: those that accumulate along the way and those that
come from the final state of the system. For two-step Bocce, costs along the way are
```
𝑔(𝑥𝑛, 𝑢𝑛) = −𝑢2𝑛/𝑥𝑛 and the final payoff is 𝐺(𝑥2) = 𝑥2. The final sum of all payoffs and
```
1.3. The Difficulty 7
costs is referred to as net payoff, which for two-step Bocce would be
```
𝐽 = 𝐺(𝑥2) − 𝑢
```
20
𝑥0−
𝑢21
𝑥1.
The general discrete 𝑁-step optimal control problem can thus be formulated with an
```
initial state 𝑥0, a dynamical system 𝑥𝑛+1 = 𝑓(𝑥𝑛, 𝑢𝑛), and a control vector (𝑢0, . . . , 𝑢𝑁−1)
```
```
producing a trajectory (𝑥0, . . . , 𝑥𝑁 ). The net payoff would be
```
```
𝐽(𝑥0, 𝑢0, . . . , 𝑢𝑁−1) = 𝐺(𝑥𝑁 ) +
```
𝑁−1
∑
𝑛=0
```
𝑔(𝑥𝑛, 𝑢𝑛) with 𝑥𝑛+1 = 𝑓(𝑥𝑛, 𝑢𝑛).
```
The optimal control problem is then to maximize 𝐽 for a given starting position 𝑥0
over all possible control vectors 𝑢0, . . . , 𝑢𝑛−1. This typically involves some restrictions
on the state space and/or controls. In the Bocce examples, the ball could be anywhere
on the positive real line, 𝑥 > 0, and our controls have to be nonnegative.
Most problems have a specified starting location. Some problems may specify a
fixed ending location, so only the payoffs or costs along the way are relevant. Other
problems have a free end condition with an associated payoff.
In the Bocce ball examples, we incur costs along the way and receive a payoff at
the end. Other possibilities may be payoffs along the way and a cost at the end. It could
be that everything is a payoff. Or it could be that everything is a cost and we want to
minimize rather than maximize.
1.3 The Difficulty
The calculus techniques used in the previous section don’t work well for additional
steps. Consider the four-step case.
We have a starting position 𝑥0, our controls are 𝑢0, 𝑢1, 𝑢2, and 𝑢3, and we express
intermediate locations in terms of our controls:
```
𝑥1 = 𝑓(𝑥0, 𝑢0),
```
```
𝑥2 = 𝑓(𝑥1, 𝑢1) = 𝑓(𝑓(𝑥0, 𝑢0), 𝑢1),
```
```
𝑥3 = 𝑓(𝑥2, 𝑢2) = 𝑓(𝑓(𝑓(𝑥0, 𝑢0), 𝑢1), 𝑢2),
```
```
𝑥4 = 𝑓(𝑥3, 𝑢3) = 𝑓(𝑓(𝑓(𝑓(𝑥0, 𝑢0), 𝑢1), 𝑢2), 𝑢3).
```
Our payoff is then
```
𝐽(𝑥0, 𝑢0, 𝑢1, 𝑢2, 𝑢3) = 𝐺(𝑓(𝑓(𝑓(𝑓(𝑥0, 𝑢0), 𝑢1), 𝑢2), 𝑢3)) + 𝑔(𝑥0, 𝑢0) + 𝑔(𝑓(𝑥0, 𝑢0), 𝑢1)
```
- 𝑔(𝑓(𝑓(𝑥0, 𝑢0), 𝑢1), 𝑢2) + 𝑔(𝑓(𝑓(𝑓(𝑥0, 𝑢0), 𝑢1), 𝑢2), 𝑢3).
Yikes. Our calculus technique would then be to take partials with respect to 𝑢0,
𝑢1, 𝑢2, 𝑢3, set them equal to zero, and so on. Very messy. Chain rule nightmare. This
approach becomes bogged down in complexity and simply becomes intractable as more
steps add more free variables 𝑢0, . . . , 𝑢𝑁−1.
This reveals the core problem of optimal control:
Compounding effects of intermediary controls in multiple-step processes cre-
ate insurmountable difficulties for standard methods of optimization.
8 Chapter 1. Getting Started
We crack this complexity problem by using Lagrange multipliers, which will open
up a whole landscape of beautiful mathematics. The big picture is that for the 𝑁-step
process we will need 𝑁 Lagrange multipliers 𝜆1, . . . , 𝜆𝑁 . Setting up the optimization
will create a dynamic relationship for these values in a costate space, which tends to
proceed from the last multiplier 𝜆𝑁 to the first 𝜆1. Understanding such structures is
the heart of optimal control.
Before diving in to this control technique, we need to take a deeper look at opti-
mization techniques from calculus and review the technique of Lagrange multipliers,
which we take up in the next chapter.
1.4 Costs and Ends
We conclude this section with one more example, where the initial and final states
of the system are prescribed and the performance is measured in cost, which is to be
minimized.
Example 1.4
Consider a system that must be moved from starting state 𝑥𝑎 = 0 to ending state
𝑥𝑏 = 100. The state is moved at each step by applying control 𝑢 according to the
```
dynamic 𝑓(𝑥, 𝑢) = 𝑥 + 𝑢, so 𝑥𝑛+1 = 𝑥𝑛 + 𝑢𝑛. The cost for each move is given by
```
```
𝑔(𝑥, 𝑢) = 𝑥 + 𝑢2/2. The cost is quadratic in the amount of control applied, and it
```
is linearly more expensive at higher values of 𝑥.
Suppose we have 𝑁 = 2 moves. We could try equal steps 𝑢0 = 𝑢1 = 50
```
creating a trajectory 0 → 50 → 100 at a cost of 𝐽 = (0 + 502/2) + (100 + 502/2) =
```
2550. Another approach may be to avoid the higher costs at higher 𝑥 values and
take 𝑢0 = 0, 𝑢1 = 100 creating a trajectory 0 → 0 → 100 at a cost of 𝐽 = 1002/2 =
5000. Our first guess was better.
To find the optimal control, we consider control variables 𝑢0, 𝑢1 that create
trajectory 𝑥0, 𝑥1 = 𝑥0 + 𝑢0, 𝑥2 = 𝑥1 + 𝑢1 with cost
```
𝐽 = (𝑥0 + 12 𝑢20) + (𝑥1 + 12 𝑢21) .
```
With 𝑥0 = 0 and 𝑥1 = 𝑢0 this becomes
```
𝐽 = ( 12 𝑢20) + (𝑢0 + 12 𝑢21) .
```
For the fixed end location 𝑥2 = 𝑢0 + 𝑢1 = 100 we have 𝑢1 = 100 − 𝑢0 and can
express the payoff
```
𝐽 = ( 12 𝑢20) + (𝑢0 + 12 (100 − 𝑢0)2)
```
as a function of a single variable which has a minimum of 𝐽 = 2549.75 at 𝑢0 =
49.5, making 𝑢1 = 50.5. So we shave a tiny bit off the cost of our first solution by
not moving quite as far with our first move, thereby avoiding the higher costs at
higher values of 𝑥. Okay, but not very impressive. This is the best we can do with
two moves.
Exercises 9
```
How about three moves? With details left to the reader (∗ check these ∗), the
```
requirement 𝑥0 = 0 and 𝑥3 = 100 imposes restriction 𝑢0 + 𝑢1 + 𝑢2 = 100, and
this is used to express 𝐽 as a function of two variables:
```
𝐽 = ( 12 𝑢20) + (𝑢0 + 12 𝑢21) + (𝑢0 + 𝑢1 + 12 (100 − 𝑢0 − 𝑢1)2)
```
which has a minimum value of 𝐽 = 1765.67 . . . with 𝑢0 = 32.33 . . . , 𝑢1 = 33.33 . . . ,
and 𝑢2 = 34.33 . . . . We save a considerable amount with an additional step, and
note that we take slightly smaller steps at first to avoid the higher costs at higher
𝑥 values.
We could similarly analyze four moves and get 𝐽 = 1397.5 with 𝑢0 = 23.5,
𝑢1 = 24.5, 𝑢2 = 25.5, and 𝑢3 = 26.5.
What happens as we add more moves? How low would 𝐽 go? There appears
```
to be a pattern in the controls applied; would the pattern continue with more
```
moves? It would be challenging to address these questions with our current mul-
```
tivariable approach (∗ try it ∗). Perhaps we need new tools. . . .
```
Key Points
In this chapter we considered contrived games to introduce discrete control processes
and the challenge of optimizing control. Our games involved moving a ball along the
𝑥-axis with costs for each move and either a prescribed end location or a free end loca-
tion with an associated payoff. We used terms from dynamical systems to describe the
processes.
We were able to maximize our net payoff for games with a few moves using basic
calculus. This approach won’t work with larger number of moves as the compounding
nature of sequential controls leads to intractable computation of the chain rule.
Exercises
Exercise 1.1. A Bocce ball is located at 𝑥0 = 10 on the real line and must be moved to
the origin. The cost of moving the ball a distance 𝑢 > 0 to the left is 𝑥 + 𝑢2. Our control
system is
```
𝑥𝑛+1 = 𝑓(𝑥𝑛, 𝑢𝑛) = 𝑥𝑛 − 𝑢𝑛
```
and our cost is
```
𝑔(𝑥𝑛, 𝑢𝑛) = 𝑥𝑛 + 𝑢2𝑛.
```
For example, to move the ball in one move from 𝑥0 = 10 to 𝑥1 = 0 incurs a cost of
𝐽 = 10 + 102 = 110. To move the ball in two moves from 𝑥0 = 10 to 𝑥1 = 5 to 𝑥2 = 0
```
with moves 𝑢0 = 𝑢1 = 5 incurs a cost of 𝐽 = (10 + 52) + (5 + 52) = 65.
```
```
(a) What is the minimum cost for two moves (assume 𝑢1, 𝑢2 ≥ 0)?
```
```
(b) What is the minimum cost for three moves (assume 𝑢𝑖 ≥ 0)?
```
10 Chapter 1. Getting Started
Exercise 1.2. A Bocce ball is located at 𝑥0 = 0 on the real line and must be moved to
a prescribed location 𝑥𝑁 = 𝐵 > 0 in 𝑁 moves. The cost of moving the ball 𝑢 units is
```
𝑔(𝑢) = 𝑢2 dollars. Our control system is
```
```
𝑥𝑛+1 = 𝑓(𝑥𝑛, 𝑢𝑛) = 𝑥𝑛 + 𝑢𝑛
```
and the total cost is
𝐽 = ∑𝑁−1𝑛=0 𝑢2𝑛.
```
(a) What is the minimal cost for 𝑁 = 1 and 𝑁 = 2 moves?
```
```
(b) In general, would it reasonable to assume 𝑢0 = 𝑢1 = ⋯ = 𝑢𝑁 ? With this
```
assumption, what is the minimum for 𝑁 moves?
Exercise 1.3. Repeat the previous exercise where the end location of the ball is not
specified, but at the end of 𝑁 moves you receive a payoff of √𝑥𝑁 dollars. So for a given
𝑁, the net payoff is
𝐽 = √𝑥𝑁 − ∑𝑁−1𝑛=0 𝑢2𝑛.
```
We still have 𝑥0 = 0 and control dynamics are 𝑥𝑛+1 = 𝑓(𝑥𝑛, 𝑢𝑛) = 𝑥𝑛 + 𝑢𝑛.
```
```
(a) What is the optimal solution for 𝑁 = 1 and 𝑁 = 2 moves?
```
```
(b) Would it be reasonable to assume 𝑢0 = 𝑢1 = ⋯ = 𝑢𝑁 in this case? If so, what
```
is your maximum payoff for 𝑁 moves?
```
Exercise 1.4(hs). A Bocce ball rests at location (𝑥𝑎, 𝑦𝑎) on the Cartesian plane. Moving
```
```
the ball to location (𝑥𝑏, 𝑦𝑏) incurs a cost of
```
```
𝐽 = (𝑥𝑏 − 𝑥𝑎)
```
```
2 + (𝑦𝑏 − 𝑦𝑎)2
```
|𝑦𝑎| + 1 .
Note that moving costs are cheaper at higher values of |𝑦𝑎|.
```
(a) Suppose you want to move the ball from (0, 0) to (10, 0) in two steps. For ex-
```
```
ample, (0, 0) → (6, 2) → (10, 0) would incur a cost of 𝐽 = 62 + 22 + (42 + 22)/3 = 140/3.
```
```
What value for (𝑥1, 𝑦1) would incur the minimal cost for (0, 0) → (𝑥1, 𝑦1) → (10, 0)?
```
```
(b) How about three moves? Set up the equations and describe what you’d have
```
```
to do to find the minimal cost for (0, 0) → (𝑥1, 𝑦1) → (𝑥2, 𝑦2) → (10, 0)? Can you
```
approximate the solution?
```
Exercise 1.5(h). Be careful with your assumptions. Nowhere in Example 1.2 did we
```
use the fact that the controls 𝑢0 and 𝑢1 had to be positive. Show that with 𝑥0 = 1 you
can get an arbitrarily large payoff in two moves if you allow negative controls.
This demonstrates that optimization principles will only define locally optimal so-
```
lutions; the solution in Example 1.2 is a local optimum.
```
Exercise 1.6. A Bocce ball is located at 𝑥0 = 𝑎 on the real line and must be moved to
the origin 𝑥𝑁 = 0 in 𝑁 moves. The cost of moving the ball a distance 𝑢 > 0 to the left
```
is (𝑥 + 𝑢)2. Our control system is
```
```
𝑥𝑛+1 = 𝑓(𝑥𝑛, 𝑢𝑛) = 𝑥𝑛 − 𝑢𝑛
```
Exercises 11
and our cost is
```
𝑔(𝑥𝑛, 𝑢𝑛) = (𝑥𝑛 + 𝑢𝑛)2.
```
```
(a) Verify that the optimal trajectory for three moves starting at 𝑥0 = 10 is 10 →
```
100/21 → 40/21 → 0.
```
(b) Verify that 100/21 → 40/21 → 0 is the optimal trajectory for two moves start-
```
ing at 𝑥0 = 100/21.
```
(c) Argue that, in general, if 𝑎 → 𝑏 → 𝑐 → 0 is the optimal trajectory for three
```
moves starting at 𝑥0 = 𝑎, then 𝑏 → 𝑐 → 0 has to be the optimal trajectory for two
moves starting at 𝑥0 = 𝑏.
```
Exercise 1.7(hs). Continue with the previous exercise: a control system 𝑥𝑛+1 = 𝑥𝑛 −
```
```
𝑢𝑛 and cost 𝑔(𝑥𝑛, 𝑢𝑛) = (𝑥𝑛 + 𝑢𝑛)2.
```
```
(a) Compute 𝑉3(𝑎) as the minimal cost for moving the ball from 𝑥 = 𝑎 to 𝑥 = 0 in
```
three moves.
```
(b) Compute 𝑉2(𝑏) as the minimal cost for moving the ball from 𝑥 = 𝑏 to 𝑥 = 0 in
```
two moves.
```
(c) Verify that
```
```
𝑉3(𝑎) = minᵆ {(𝑎 + 𝑢)2 + 𝑉2(𝑎 − 𝑢)}.
```
```
(d) Argue that, in general,
```
```
𝑉 𝑁+1(𝑎) = minᵆ {(𝑎 + 𝑢)2 + 𝑉 𝑁 (𝑎 − 𝑢)}.
```
Use this to derive 𝑉4 from 𝑉3.
```
(e) Construct a general formula for 𝑉 𝑁 (𝑎). Can you evaluate lim𝑁→∞ 𝑉 𝑁 (𝑎)?
```
2
Static Optimization
Understanding dynamic optimization requires a solid understanding of the general
concept of optimization. Static optimization techniques are introduced in the study of
calculus, and we take a fresh look at these ideas with a philosophy of understanding
simple things deeply.
Optimization problems are typically solved by ruling out all the cases where things
are not optimal. A single variable function cannot attain a local maximum at a place
where the derivative is nonzero, so we look at locations where the derivative is zero.
This concept generalizes to higher dimensions, and to do so we must carefully under-
stand what we mean by the derivative of a function in one and several variables.
If an optimization problem in multiple dimensions has constraints, we engage the
method of Lagrange multipliers, and this concept will lead us naturally into methods
for optimizing control processes. Most readers will have some familiarity with the topic
of Lagrange multipliers, as it is covered to some degree in most multivariable calculus
courses. We develop what we need from the topic in this chapter.
```
This is foundation building; it is essential to have a clear understanding of these
```
basic concepts as we begin our journey into optimal control.
2.1 The Derivative
The derivative of a function is a fundamental mathematical concept. It is introduced
in calculus for functions 𝑓 ∶ ℝ → ℝ as a limit of a difference quotient,
```
𝑓′(𝑎) = lim𝑥→𝑎𝑓(𝑥) − 𝑓(𝑎)𝑥 − 𝑎 .
```
If this limit exists, the function is said to be differentiable at 𝑥 = 𝑎 and the derivative is
used to get the slope of a line tangent to the function. This tangent line is a very good
```
approximation to the function near the point of tangency (Figure 2.1). For 𝑥 near 𝑎,
```
```
𝑓(𝑥) ≈ 𝑓(𝑎) + 𝑓′(𝑎)(𝑥 − 𝑎).
```
13
14 Chapter 2. Static Optimization
Figure 2.1. Tangent line approximation.
We could invert this and define the derivative as the slope of a line that would give
the best approximation to the function at a point. This approach has the advantage
of naturally generalizing to higher dimensions. Consider a multivariable function 𝑔 ∶
ℝ2 → ℝ. For 𝑥, 𝑦 near 𝑎, 𝑏,
```
𝑔(𝑥, 𝑦) ≈ 𝑔(𝑎, 𝑏) + 𝜕𝑔𝜕𝑥 (𝑎, 𝑏) (𝑥 − 𝑎) + 𝜕𝑔𝜕𝑦 (𝑎, 𝑏) (𝑦 − 𝑏)
```
```
= 𝑔(𝑎, 𝑏) + ( 𝜕𝑔𝜕𝑥 (𝑎, 𝑏), 𝜕𝑔𝜕𝑦 (𝑎, 𝑏)) ⋅ ((𝑥 − 𝑎), (𝑦 − 𝑏))
```
```
= 𝑔(𝑎, 𝑏) + ∇𝑔(𝑎, 𝑏) ⋅ ((𝑥 − 𝑎), (𝑦 − 𝑏)) .
```
Here the gradient vector
```
∇𝑔 = ( 𝜕𝑔𝜕𝑥 , 𝜕𝑔𝜕𝑦 )
```
```
is the derivative of 𝑔 since ∇𝑔(𝑎, 𝑏) is the coefficient for ((𝑥 − 𝑎), (𝑦 − 𝑏)) that yields the
```
```
best linear approximation to 𝑔 at the point (𝑎, 𝑏, 𝑔(𝑎, 𝑏)). We would not be able to get
```
this from a difference quotient interpretation because we can’t divide vectors.
2.2 Differentiation
It is important to distinguish the derivative of a function from the process of differen-
tiation as an operation applied to a function. This is particularly relevant for partial
derivatives of multivariable functions with dependencies among the variables.
```
The expression 𝜕𝐻𝜕𝑥 (𝑥, 𝑦, 𝑧) is the derivative of the function 𝐻 with respect to the
```
free variable 𝑥.
```
The expression 𝜕𝜕𝑥 𝐻(𝑥, 𝑦, 𝑧) means to compute the full derivative of 𝐻(𝑥, 𝑦, 𝑧) with
```
respect to 𝑥 where there may be dependency between 𝑥, 𝑦, and 𝑧, in which case we
need to apply the chain rule. Think of this as the 𝜕𝜕𝑥 operator applied to the expression
```
𝐻(𝑥, 𝑦, 𝑧).
```
The following example should clarify, and it demonstrates how these notations
will be used in the remainder of the text.
2.3. Approximations 15
Example 2.1
```
Suppose that for 𝐻(𝑥, 𝑦, 𝑧) = sin(𝑥 + 𝑦 + 𝑧) we want to compute 𝜕𝜕𝑥 𝐻(𝑥, 𝑦, 𝑧)
```
where 𝑦 = 𝑥2 and 𝑧 is unrelated to 𝑥. We have 𝑑𝑦𝑑𝑥 = 2𝑥 and, since there is
no dependency between 𝑧 and 𝑥, we have 𝑑𝑧𝑑𝑥 = 0. Using the chain rule, with
𝜕𝐻
𝜕𝑥 =
𝜕𝐻
𝜕𝑦 =
𝜕𝐻
```
𝜕𝑧 = cos(𝑥 + 𝑦 + 𝑧), we derive
```
𝜕
```
𝜕𝑥 𝐻(𝑥, 𝑦, 𝑧) =
```
𝜕𝐻
𝜕𝑥 +
𝜕𝐻
𝜕𝑦
𝑑𝑦
𝑑𝑥 +
𝜕𝐻
𝜕𝑧
𝑑𝑧
𝑑𝑥
```
= cos(𝑥 + 𝑦 + 𝑧) + cos(𝑥 + 𝑦 + 𝑧)(2𝑥) + cos(𝑥 + 𝑦 + 𝑧)(0).
```
```
Substituting 𝑦 = 𝑥2 this simplifies to (1 + 2𝑥) cos(𝑥 + 𝑥2 + 𝑧).
```
```
We could also solve this problem by substituting 𝑦 = 𝑥2 first to get 𝐻(𝑥, 𝑥2, 𝑧) =
```
```
sin(𝑥 + 𝑥2 + 𝑧) and then differentiating with respect to 𝑥 to get the same result.
```
Partial differentiation and the chain rule can be tricky, so it is important to keep
clear on the subtle distinction between a differentiation operator 𝜕𝜕𝑥 and a derivative
𝜕𝐻
𝜕𝑥 .
2.3 Approximations
The concept of linear approximation to a differentiable function
```
𝑓(𝑥) ≈ 𝑓(𝑎) + 𝑓′(𝑎)(𝑥 − 𝑎) (2.1)
```
```
means that the function 𝑓(𝑥) is very close to the tangent line 𝑓(𝑎) + 𝑓′(𝑎)(𝑥 − 𝑎) for
```
points 𝑥 near 𝑎. This intuitive understanding is all we really need for this subject, but a
deeper dive into the proofs covered in later chapters requires more precise nomencla-
ture. Recall that Taylor series allow some functions to be expressed as a power series:
```
𝑓(𝑥) = 𝑓(𝑎) + 𝑓′(𝑎)(𝑥 − 𝑎) + 12 𝑓″(𝑎)(𝑥 − 𝑎)2 + 16 𝑓‴(𝑎)(𝑥 − 𝑎)3 + ⋯ .
```
```
For a polynomial approximation to 𝑓(𝑥) near 𝑥 = 𝑎, we can chop this series off at any
```
```
location and toss the subsequent terms into the remainder 𝑅(𝑥). A linear approxima-
```
tion would be
```
𝑓(𝑥) = 𝑓(𝑎) + 𝑓′(𝑎)(𝑥 − 𝑎) + 𝑅(𝑥)
```
```
where 𝑅(𝑥) is a catch basin for the sum of the subsequent nonlinear terms, and the size
```
```
of |𝑅(𝑥)| is on the order of (𝑥 −𝑎)2 or smaller. Specifically, this means there is a positive
```
constant 𝐶 such that
||
|
```
𝑅(𝑥)
```
```
(𝑥 − 𝑎)2
```
||
| < 𝐶 < ∞
```
for 𝑥 values near the point 𝑎 (with 𝑥 ≠ 𝑎).
```
```
This may be conveniently expressed using “big-O” notation. For functions 𝑝(𝑥),
```
```
𝑞(𝑥) with 𝑝(𝑥) → 0 and 𝑞(𝑥) → 0 as 𝑥 → 𝑎 we say 𝑝(𝑥) = 𝑂(𝑞(𝑥)) if there is a constant
```
```
𝐶 with |𝑝(𝑥)/𝑞(𝑥)| < 𝐶 for 𝑥 near 𝑎.
```
16 Chapter 2. Static Optimization
```
For our remainder term in the linear approximation (2.1) we say 𝑅(𝑥) is 𝑂((𝑥−𝑎)2),
```
or that
```
𝑓(𝑥) = 𝑓(𝑎) + 𝑓′(𝑎)(𝑥 − 𝑎) + 𝑂((𝑥 − 𝑎)2)
```
for 𝑥 near 𝑎 and 𝑥 ≠ 𝑎.
The big-O notation retains the intuitive and informal feel of the approximation
idea, “≈”, but this notation is mathematically rigorous.
```
We could take this a step further with “little-o” notation. For functions 𝑝(𝑥), 𝑞(𝑥) >
```
```
0 we say 𝑝(𝑥) = 𝑜(𝑞(𝑥)) as 𝑥 → 𝑎 if
```
```
lim𝑥→𝑎|||𝑝(𝑥)𝑞(𝑥)||| = 0.
```
```
So 𝑝(𝑥) = 𝑂(𝑞(𝑥)) if |𝑝(𝑥)/𝑞(𝑥)| stays bounded near 𝑎, and 𝑝(𝑥) = 𝑜(𝑞(𝑥)) if |𝑝(𝑥)/𝑞(𝑥)|
```
is vanishingly small near 𝑎.
```
The more general idea of a linear approximation (2.1) is then expressed as
```
```
𝑓(𝑥) = 𝑓(𝑎) + 𝑓′(𝑎)(𝑥 − 𝑎) + 𝑜(𝑥 − 𝑎).
```
```
This version of our linear approximation can be taken as defining 𝑓′(𝑎) in an equivalent
```
```
way to the standard difference quotient definition: solving this for 𝑓′(𝑎) yields
```
```
𝑓′(𝑎) = 𝑓(𝑥) − 𝑓(𝑎)𝑥 − 𝑎 + 𝑜(𝑥 − 𝑎)𝑥 − 𝑎
```
```
and so with lim𝑥→𝑎 𝑜(𝑥 − 𝑎)/(𝑥 − 𝑎) = 0, we have
```
```
𝑓′(𝑎) = lim𝑥→𝑎 ( 𝑓(𝑥)−𝑓(𝑎)𝑥−𝑎 + 𝑜(𝑥−𝑎)𝑥−𝑎 )
```
```
= lim𝑥→𝑎𝑓(𝑥)−𝑓(𝑎)𝑥−𝑎 + lim𝑥→𝑎𝑜(𝑥−𝑎)𝑥−𝑎
```
```
= lim𝑥→𝑎𝑓(𝑥)−𝑓(𝑎)𝑥−𝑎 .
```
```
We can say that a function 𝑓(𝑥) is differentiable at a point 𝑥 = 𝑎 with derivative
```
```
𝑓′(𝑎) if it is well-approximated by a line near 𝑥 = 𝑎 as 𝑓(𝑥) = 𝑓(𝑎) + 𝑓′(𝑎)(𝑥 − 𝑎) +
```
```
𝑜(𝑥 − 𝑎).
```
The same reasoning applies to our linear approximations in higher dimensions.
We say that a multivariable function 𝑓 ∶ ℝ𝑛 → ℝ is differentiable at a point 𝐚 ∈ ℝ𝑛 if
```
it is well-approximated by a tangent plane (of dimension 𝑛) for 𝐱 near 𝐚. Specifically,
```
this means that
```
𝑓(𝐱) = 𝑓(𝐚) + ∇𝑓(𝐚) ⋅ (𝐱 − 𝐚) + 𝑜 (|𝐱 − 𝐚|)
```
where the gradient vector
```
∇𝑓 = ( 𝜕𝑓𝜕𝑥1, . . . , 𝜕𝑓𝜕𝑥𝑛 )
```
```
is the derivative of 𝑓 with respect to 𝐱 = (𝑥1, . . . , 𝑥𝑚).
```
2.4. Extreme Values 17
The key idea is:
The derivative is the multiplicative coefficient in the linear approximation
of a function.
2.4 Extreme Values
```
A function 𝑦 = 𝑓(𝑥) defined on a closed interval 𝐼 attains a maximum value at a point
```
```
𝑎 ∈ 𝐼 if 𝑓(𝑥) ≤ 𝑓(𝑎) for all 𝑥 ∈ 𝐼, and it attains a minimum value at a point 𝑏 ∈ 𝐼
```
```
if 𝑓(𝑥) ≥ 𝑓(𝑏) for all 𝑥 ∈ 𝐼. The Extreme Value Theorem tells us that a continuous
```
```
function on a closed interval must attain a maximum and a minimum value.
```
```
A function 𝑦 = 𝑓(𝑥) attains a local maximum at 𝑥 = 𝑎 if 𝑓(𝑥) ≤ 𝑓(𝑎) for all 𝑥
```
in an open interval containing 𝑎. If the function is differentiable at some point 𝑥 = 𝑎
```
interior to 𝐼 and 𝑓′(𝑎) > 0, then the function is increasing near 𝑎: there are points
```
```
𝑥 > 𝑎 with 𝑓(𝑥) > 𝑓(𝑎) and points 𝑥 < 𝑎 with 𝑓(𝑥) < 𝑓(𝑎). We can apply the same
```
```
idea if 𝑓′(𝑎) < 0, and so if the derivative at 𝑥 = 𝑎 exists and is nonzero, there are always
```
points near 𝑎 that produce larger and smaller values for the function. Thus we have
that a differentiable function can only attain a local maximum or minimum value if
the derivative is zero.
These ideas generalize to multivariable functions. If ℛ is a closed and bounded
region in ℝ𝑛 and 𝑓 ∶ ℛ → ℝ is continuous, then 𝑓 must attain a maximum and a
minimum in ℛ. This is the Extreme Value Theorem, and it follows from the abstract
concept of compactness covered in real analysis. As in the one-dimensional case, if 𝑓
is differentiable and has a nonzero derivative at some point 𝐚 interior to ℛ, in this case
```
meaning a nonzero gradient ∇𝑓(𝐚) ≠ 𝟎, then there are points 𝐱 near 𝐚 with 𝑓(𝐱) > 𝑓(𝐚)
```
```
and points with 𝑓(𝐱) < 𝑓(𝐚).
```
Thus we have the following general key principle:
A function 𝑓 defined on a region ℛ cannot attain a maximum or minimum
value at a point 𝑥 interior to ℛ where the derivative is nonzero.
With this, the only places we need to look for a maximum or minimum of 𝑓 over
ℛ are:
• Interior points where the derivative is zero.
• Places where the derivative does not exist.
• The boundary of ℛ.
Example 2.2
```
Consider 𝑓(𝑥) = |𝑥2 − 1| over the interval −2 ≤ 𝑥 ≤ 2 (Figure 2.2). This function
```
is not differentiable at 𝑥 = ±1, and it has a zero derivative at 𝑥 = 0. So the
only candidates for which it may attain extreme values are 𝑥 = 0, ±1, ±2. The
```
function attains a maximum of 𝑦 = 3 at the endpoints and a minimum of 𝑦 = 0
```
at the cusps.
18 Chapter 2. Static Optimization
Figure 2.2. Maximum values at endpoints, minimum at cusps.
In the multivariable case we interpret a zero derivative to mean that the gradient
is the zero vector.
Example 2.3
```
To find the shortest distance from the plane 𝑧 = 𝑥 + 2𝑦 to the point (1, 2, 3) we
```
```
formulate the distance √(𝑥 − 1)2 + (𝑦 − 2)2 + (𝑧 − 3)2 as a function of 𝑥 and 𝑦:
```
```
𝑑(𝑥, 𝑦) = √(𝑥 − 1)2 + (𝑦 − 2)2 + ((𝑥 + 2𝑦) − 3)2.
```
The square root is an increasing function, and so it suffices to minimize the
square of the distance:
```
𝑔(𝑥, 𝑦) = (𝑥 − 1)2 + (𝑦 − 2)2 + ((𝑥 + 2𝑦) − 3)2
```
= 2𝑥2 + 4𝑥𝑦 + 5𝑦2 − 8𝑥 − 16𝑦 + 14
with
```
∇𝑔 = (4𝑥 + 4𝑦 − 8, 4𝑥 + 10𝑦 − 16).
```
We look for points where the gradient is the zero vector by solving
4𝑥 + 4𝑦 − 8 = 0
4𝑥 + 10𝑦 − 16 = 0
```
for the single solution (𝑥, 𝑦, 𝑧) = (2/3, 4/3, 10/3) with distance 𝑑 = √2/3 =
```
```
0.8165 . . . . (How do we know this is a minimum?)
```
2.5 Optimum Along a Path
```
The maximum/minimum of a function 𝑔(𝑥, 𝑦) along a path 𝑥(𝑡), 𝑦(𝑡) for 𝑎 ≤ 𝑡 ≤ 𝑏 can
```
```
be handled as a single variable max/min problem applied to 𝑔(𝑥(𝑡), 𝑦(𝑡)) as a function
```
of 𝑡. However, it is usually easier to use a multivariable approach as follows. Assuming
everything is differentiable, the optimum must occur at the boundary, 𝑡 = 𝑎 or 𝑡 = 𝑏,
2.5. Optimum Along a Path 19
or at a point where
```
0 = 𝑑𝑔𝑑𝑡 (𝑥(𝑡), 𝑦(𝑡)) = ∇𝑔(𝑥(𝑡), 𝑦(𝑡)) ⋅ (𝑥′(𝑡), 𝑦′(𝑡)).
```
If the optimum is attained at an interior time 𝑡1, with 𝑎 < 𝑡1 < 𝑏, then the path must
touch the level curve at optimal height, but not cross it. For nonzero speed, the path
```
is tangent to the level curve of 𝑔(𝑥, 𝑦) at the point 𝑥(𝑡1), 𝑦(𝑡1), making the gradient of 𝑔
```
perpendicular to the curve at the maximal point. This is one of the key concepts from
multivariable calculus.
```
The same idea works in any dimension: for 𝐱 ∈ ℝ𝑛, to optimize 𝑓(𝐱) along a path
```
```
𝐱(𝑡) look for points where
```
```
0 = ∇𝑔(𝐱(𝑡)) ⋅ 𝐱 ′(𝑡).
```
Example 2.4: Saddle
Suppose we want to find the maximum and minimum values of the hyperbolic
paraboloid
```
𝑔(𝑥, 𝑦) = 𝑥2 + 2𝑥𝑦 − 3𝑦2 + 8𝑦 − 4
```
over the circle of radius 2 centered at the origin.
Figure 2.3. Maxima and minima along a path occur at tangen-
cies to level curves.
The extreme values appear where the circle is tangent to the level curves of
```
the surface (Figure 2.3).
```
```
To solve for the extreme values, we can parameterize the circle by 𝑥(𝜃) =
```
```
2 cos(𝜃), 𝑦(𝜃) = 2 sin(𝜃) and express 𝑔(𝑥(𝜃), 𝑦(𝜃)) as a function of 𝜃:
```
```
𝑔 (2 cos(𝜃), 2 sin(𝜃))
```
```
= 4 cos2(𝜃) + 8 cos(𝜃) sin(𝜃) − 12 sin2(𝜃) + 16 sin(𝜃) − 4.
```
20 Chapter 2. Static Optimization
Figure 2.4. Function values along the path show maxima and
minima.
Optimizing as a function of 𝜃 reveals a maximum of 7.682 . . . at 𝜃 = 0.634 . . . ,
```
and it reveals a minimum of −32.648 . . . at 𝜃 = 4.873 . . . (Figure 2.4).
```
The constraint curve in the previous example was a circle with a nice parameter-
ization. Other constraints may not be so readily parameterized. Fortunately, there is
a more sophisticated approach that avoids parameterization altogether and, although
more abstract, is actually much more straightforward. This is the Lagrange multiplier
technique introduced in the next section.
2.6 Lagrange with One Constraint
```
If we want to optimize 𝑔(𝑥, 𝑦) constrained to a curve defined by 𝑓(𝑥, 𝑦) = 𝑐, we look for
```
```
where the level curves of 𝑔 are tangent to the curve 𝑓(𝑥, 𝑦) = 𝑐. The idea of Lagrange
```
multipliers is to expand the focus beyond just the level curve at height 𝑐 and to consider,
```
in general, where the level curves of 𝑓 (the constraint function) are tangent to the level
```
```
curves of 𝑔 (the objective function we want to optimize). This set of points is defined
```
by
∇𝑔 ∥ ∇𝑓,
and the set of solutions to this condition is often referred to as the set of stationary
points. We expect solutions to the constrained optimization problem to occur at a sta-
tionary point, and so we look for solutions that are both stationary and satisfy the con-
straints.
Example 2.5: Saddle
Returning to Example 2.4, suppose we want to find the maximum and mini-
```
mum values of 𝑔(𝑥, 𝑦) = 𝑥2 + 2𝑥𝑦 − 3𝑦2 + 8𝑦 − 4 subject to the constraint
```
2.6. Lagrange with One Constraint 21
```
𝑓(𝑥, 𝑦) = 𝑥2 + 𝑦2 = 4. In that example we examined values of 𝑔(𝑥, 𝑦) on a single
```
```
circle 𝑓(𝑥, 𝑦) = 𝑥2 + 𝑦2 = 4 and used the first derivative test to find extreme
```
values.
Lagrange multipliers represent a different approach which may seem rather
roundabout, but it has some surprising advantages. Compute the gradients
```
∇𝑓 = (2𝑥, 2𝑦),
```
```
∇𝑔 = (2𝑥 + 2𝑦, 2𝑥 − 6𝑦 + 8)
```
and find when these are parallel by looking for a zero determinant of the matrix
with ∇𝑓 and ∇𝑔 as rows:
0 = Det [
2𝑥 2𝑦
2𝑥 + 2𝑦 2𝑥 − 6𝑦 + 8
] = 4𝑥2 − 16𝑥𝑦 + 4𝑦2 + 16𝑥.
This amounts to looking at the level curves of the saddle 𝑔 and the level curves of
```
the constraint 𝑓 (a collection of circles in this case) and seeing where these level
```
curves are tangent. The set of tangent points are the stationary values defined by
```
the hyperbola 0 = 4𝑥2 − 16𝑥𝑦 + 4𝑦2 + 16𝑥 (Figure 2.5).
```
Figure 2.5. The set of tangencies between level curves of two
functions is a curve of stationary points.
```
Now we apply the constraint 𝑓(𝑥, 𝑦) = 4 by intersecting this hyperbola of
```
stasis points with the constraint circle 𝑥2 + 𝑦2 = 4 yielding two equations in two
unknowns,
4 = 𝑥2 + 𝑦2,
0 = 4𝑥2 − 16𝑥𝑦 + 4𝑦2 + 16𝑥,
with the same solution as Example 2.4: four critical points with a maximum of
```
7.682 . . . at (𝑥, 𝑦) = (1.611 . . . , 1.185 . . . ) and a minimum of −32.648 . . . at (𝑥, 𝑦) =
```
```
(0.319 . . . , −1.974 . . . ).
```
22 Chapter 2. Static Optimization
The following example demonstrates that the parallel condition ∇𝑔 ∥ ∇𝑓 isn’t
quite sufficient to cover all cases.
Example 2.6: Parabolic Cylinder
```
Consider finding extreme values of 𝑧 = 𝑔(𝑥, 𝑦) = (𝑦 − 𝑥)2 subject to 𝑦 + 2𝑥2 = 1.
```
```
We formulate the constraint as 𝑓(𝑥, 𝑦) = 𝑐 with 𝑓(𝑥, 𝑦) = 𝑦+2𝑥2. Computing
```
gradients,
```
∇𝑓 = (4𝑥, 1),
```
```
∇𝑔 = (−2(𝑦 − 𝑥), 2(𝑦 − 𝑥)),
```
we look for where these are parallel by setting
0 = Det [
4𝑥 1
```
−2(𝑦 − 𝑥) 2(𝑦 − 𝑥)
```
```
] = 2(4𝑥 + 1)(𝑦 − 𝑥)
```
and find solutions 𝑥 = −1/4 and 𝑦 = 𝑥.
```
The solution 𝑥 = −1/4 and the constraint 𝑦+2𝑥2 = 1 yields a point (−1/4, 7/8).
```
This produces a maximum value of 𝑧 = 81/64 = 1.266 . . . for the function given
the constraint. This maximum is attained at a point where the constraint curve
```
𝑦 + 2𝑥2 = 1 is tangent to the level curves of the function 𝑔(𝑥, 𝑦) = (𝑦 − 𝑥)2.
```
We also have the solution 𝑦 = 𝑥 and the constraint 𝑦 + 2𝑥2 = 1 yielding
```
points (1/2, 1/2) and (−1, −1) where 𝑔(𝑥, 𝑦) attains its minimum value of 𝑧 = 0.
```
However, the constraint curve 𝑦 + 2𝑥2 = 1 is not tangent to the level curves of
```
𝑔(𝑥, 𝑦) at these points, and it doesn’t look like the gradients would be parallel
```
```
(Figure 2.6). What’s going on?
```
```
Figure 2.6. Level curves of (𝑦 − 𝑥)2 and constraint curve 𝑦 + 2𝑥2 = 1.
```
```
The function 𝑔(𝑥, 𝑦) attains its global minimum value of 𝑧 = 0 along a line of
```
```
critical points 𝑦 = 𝑥, and the gradient of 𝑔(𝑥, 𝑦) is zero at these critical points. It is
```
2.7. Higher Dimensions 23
```
questionable as to whether we want to consider this as a case where ∇𝑔 ∥ ∇𝑓 (is
```
```
every vector parallel to the zero vector?), but note that our method still detected
```
these points as a zero for the determinant of the gradient matrix, since one of the
gradients was zero.
```
The previous example had a constraint curve 𝑓(𝑥, 𝑦) = 𝑐 passing through a mini-
```
```
mum of the objective function 𝑔(𝑥, 𝑦) where ∇𝑔 = 𝟎. So when looking for solutions to
```
constrained optimization problems, we should look for where
∇𝑔 ∥ ∇𝑓 or ∇𝑔 = 𝟎.
This is accomplished by looking for points where
∇𝑔 = 𝜆∇𝑓
for any 𝜆, zero or nonzero. This is the Lagrange multiplier approach, and 𝜆 is the La-
grange multiplier.
Example 2.7: Parabolic Cylinder Again
```
Returning to Example 2.6, find the extreme values of 𝑧 = 𝑔(𝑥, 𝑦) = (𝑦 − 𝑥)2
```
subject to 𝑦 + 2𝑥2 = 1 by solving ∇𝑔 = 𝜆∇𝑓 for the gradients
```
∇𝑔 = (−2(𝑦 − 𝑥), 2(𝑦 − 𝑥)),
```
```
∇𝑓 = (4𝑥, 1).
```
Together with the constraint, this yields three equations
```
−2(𝑦 − 𝑥) = 𝜆4𝑥,
```
```
2(𝑦 − 𝑥) = 𝜆,
```
𝑦 + 2𝑥2 = 1
in three unknowns, 𝑥, 𝑦, 𝜆. Solving these, we find the same solutions found ear-
```
lier. Adding the first two equations yields 0 = 𝜆(4𝑥+1), and so 𝜆 = 0 or 𝑥 = −1/4.
```
If 𝜆 = 0, we get two solutions, 𝑥 = 𝑦 = −1 and 𝑥 = 𝑦 = 1/2, both with 𝑧 = 0. If
𝑥 = −1/4, we get 𝑦 = 7/8 and 𝜆 = 9/4, with 𝑧 = 81/64, the same solutions we
had before.
2.7 Higher Dimensions
Most of our work will involve functions with a small number of variables. However, to
develop the machinery of optimal control, we will need to have a basic understanding
of how Lagrange multipliers operate with a large number of variables. The patterns we
see in the two and three variable cases generalize to any number of variables. We will
focus on maximizing a function subject to constraints, but the same techniques work
for minimizing as well.
```
The general idea is that we want to maximize a function 𝑔(𝑥1, 𝑥2, . . . , 𝑥𝑛) subject to
```
```
a constraint 𝑐 = 𝑓(𝑥1, 𝑥2, . . . , 𝑥𝑛). For a basic example, suppose we want to maximize
```
24 Chapter 2. Static Optimization
```
𝑔(𝑥, 𝑦, 𝑧) subject to a planar restriction, 𝑎𝑥 + 𝑏𝑦 + 𝑐𝑧 = 𝑑. One could imagine moving
```
```
around on this plane seeking the highest values for 𝑔(𝑥, 𝑦, 𝑧). Standing at any point
```
```
(𝑥, 𝑦, 𝑧) on the plane, we would project the gradient ∇𝑔 onto the plane and increase
```
the value of 𝑔 by moving in that projected direction while still remaining on the plane.
This only fails if ∇𝑔 projects to the zero vector on the plane. In that case, there is no
direction we could move on the plane that would guarantee an increase in the value
of 𝑔. So the maximum value of 𝑔 restricted to the plane has to occur at a point where
∇𝑔 has zero components in the plane. This is characterized by ∇𝑔 being parallel to the
```
normal vector ∇𝑓 = (𝑎, 𝑏, 𝑐) to the plane 𝑓(𝑥, 𝑦, 𝑧) = 𝑎𝑥 + 𝑏𝑦 + 𝑐𝑧 = 𝑑.
```
Example 2.8
In Example 2.3 we found the shortest distance from the plane 𝑧 = 𝑥 + 2𝑦 to the
```
point (1, 2, 3). We can formulate this as a constrained optimization problem as
```
minimizing
```
𝑔(𝑥, 𝑦, 𝑧) = (𝑥 − 1)2 + (𝑦 − 2)2 + (𝑧 − 3)2
```
subject to
```
𝑓(𝑥, 𝑦, 𝑧) = 𝑥 + 2𝑦 − 𝑧 = 0.
```
With
```
∇𝑔 = (2(𝑥 − 1), 2(𝑦 − 2), 2(𝑧 − 3)),
```
```
∇𝑓 = (1, 2, −1),
```
we look for points that satisfy ∇𝑔 = 𝜆∇𝑓 and the constraint by solving four linear
```
equations:
```
```
2(𝑥 − 1) = 𝜆,
```
```
2(𝑦 − 2) = 2𝜆,
```
```
2(𝑧 − 3) = −𝜆,
```
𝑥 + 2𝑦 − 𝑧 = 0
for four unknowns to get
𝑥 = 2/3, 𝑦 = 4/3, 𝑧 = 10/3, 𝜆 = −2/3.
```
Note that the vector between the points (2/3, 4/3, 10/3) and (1, 2, 3) is parallel to
```
```
the normal vector (1, 2, −1) to the plane (∗ check this ∗). The minimum distance
```
```
to the point (1, 2, 3) is attained when the point is straight up from the plane.
```
2.8 Multiple Constraints
The Lagrange multiplier technique also applies to multiple constraints, where we seek
```
to maximize a function 𝑔(𝑥1, . . . , 𝑥𝑛) subject to 𝑚 < 𝑛 constraints:
```
```
0 = 𝑓1(𝑥1, . . . , 𝑥𝑛),
```
⋮
```
0 = 𝑓𝑚(𝑥1, . . . , 𝑥𝑛).
```
```
(2.2)
```
2.8. Multiple Constraints 25
These maxima can occur only at points where the gradient ∇𝑔 is in the space
spanned by ∇𝑓1, ∇𝑓2, . . . , ∇𝑓𝑚, that is, where there are scalars 𝜆1, . . . , 𝜆𝑚 with
```
∇𝑔 = 𝜆1 ∇𝑓1 + ⋯ + 𝜆𝑚 ∇𝑓𝑚 for some 𝜆1, . . . , 𝜆𝑚. (2.3)
```
```
For example, suppose we want to maximize 𝑔(𝑥, 𝑦, 𝑧) subject to two planar restric-
```
tions
𝑑1 = 𝑎1𝑥 + 𝑏1𝑦 + 𝑐1𝑧,
𝑑2 = 𝑎2𝑥 + 𝑏2𝑦 + 𝑐2𝑧.
That is, we are restricted to the line of intersection between these two planes. One could
```
imagine moving along this intersection line seeking the highest values for 𝑔(𝑥, 𝑦, 𝑧).
```
This movement is necessarily perpendicular to both normals to the planes, 𝐯1 =
```
(𝑎1, 𝑏1, 𝑐1) and 𝐯2 = (𝑎2, 𝑏2, 𝑐2). The only location where 𝑔 could have a maximum
```
```
is where ∇𝑔 is in the span of 𝐯1 and 𝐯2; that is, ∇𝑔 = 𝜆1𝐯1 + 𝜆2𝐯2 for some 𝜆1, 𝜆2. Oth-
```
erwise ∇𝑔 would have a component which is not in the span of 𝐯1 and 𝐯2, and you are
free to move in the direction of that component along the line of intersection, thereby
increasing the value of 𝑔.
Example 2.9
```
Consider minimizing 𝑔(𝑥, 𝑦, 𝑧) = 𝑥2 + 𝑦2 + 𝑧2 subject to constraints
```
```
𝑓1(𝑥, 𝑦, 𝑧) = 𝑥 + 𝑦 + 𝑧 = 1,
```
```
𝑓2(𝑥, 𝑦, 𝑧) = 𝑥 + 𝑦 + 2𝑧 = 1.
```
Taking a direct approach, the intersection of the two constraints is 𝑥 + 𝑦 = 1
```
with 𝑧 = 0, and the minimum is attained at (1/2, 1/2, 0).
```
Applying Lagrange, we formulate
∇𝑔 = 𝜆1∇𝑓1 + 𝜆2∇𝑓2,
```
(2𝑥, 2𝑦, 2𝑧) = 𝜆1(1, 1, 1) + 𝜆2(1, 1, 2).
```
This yields five linear equations in five unknowns:
2𝑥 = 𝜆1 + 𝜆2,
2𝑦 = 𝜆1 + 𝜆2,
2𝑧 = 𝜆1 + 2𝜆2,
1 = 𝑥 + 𝑦 + 𝑧,
1 = 𝑥 + 𝑦 + 2𝑧.
Solving these yields
𝑥 = 12 , 𝑦 = 12 , 𝑧 = 0, 𝜆1 = 2, 𝜆2 = −1.
```
In more dimensions, if we want to maximize 𝑔(𝑥1, 𝑥2, . . . , 𝑥𝑛) in the intersection
```
of 𝑚 < 𝑛 planes with normal vectors 𝐯1, 𝐯2, . . . , 𝐯𝑚, we would look for points where
26 Chapter 2. Static Optimization
∇𝑔 is in the span of 𝐯𝑖’s. In this case, the intersection of these planes would generically
```
be an (𝑛 − 𝑚)-dimensional linear space, and if ∇𝑔 were not in the span of 𝐯𝑖’s, then
```
∇𝑔 would have a positive component in this intersection space. We could move in the
direction of that component and increase the value of 𝑔.
Note that for 𝑚 constraints in 𝑛-dimensional space we generate 𝑛 equations for the
Lagrange multipliers and 𝑚 equations for the constraints, for a total of 𝑛 + 𝑚 equations
for the 𝑛 + 𝑚 unknowns 𝑥1, . . . , 𝑥𝑛, 𝜆1, . . . , 𝜆𝑚.
It is hard to visualize this multidimensional result, but it is a direct generalization
of the intersection of two planes in three dimensions. The key idea is that a maximum
of 𝑔 can only occur at a location where any movement in any direction that would
increase 𝑔 is prohibited by the constraints, which forces ∇𝑔 to be in the span of the
normals.
The same principles apply when the constraints are nonlinear. In three dimen-
```
sions the intersection of two surfaces 𝑓1(𝑥, 𝑦, 𝑧) = 𝑐1 and 𝑓2(𝑥, 𝑦, 𝑧) = 𝑐2 is generically
```
a curve. A tangent vector to the curve of intersection is perpendicular to the normals
of the surfaces, and any vector perpendicular to the curve must be in the span of those
normals. An optimal point can only occur when ∇𝑔 is perpendicular to the curve, and
hence in the span of the normals.
In constrained optimization we always assume there are fewer constraints than
dimensions, 𝑚 < 𝑛. If we have the same number of constraints as dimensions, 𝑚 = 𝑛
equations in 𝑚 = 𝑛 unknowns, we generically expect the solution to consist of iso-
lated points, so we can’t really move around in the intersection space. If we have more
constraints than dimensions, we typically have no solutions at all.
Example 2.10
```
The maximum and minimum of height 𝑔(𝑥, 𝑦, 𝑧) = 𝑧 subject to 𝑥 + 𝑦 + 𝑧 = 12
```
```
and 𝑧 = 𝑥2 + 𝑦2 occurs at a place where the gradient of 𝑔(𝑥, 𝑦, 𝑧) is a linear
```
```
combination of the gradients of 𝑓1(𝑥, 𝑦, 𝑧) = 𝑥 + 𝑦 + 𝑧 − 12 and 𝑓2(𝑥, 𝑦, 𝑧) =
```
𝑥2 + 𝑦2 − 𝑧:
∇𝑔 = 𝜆1∇𝑓1 + 𝜆2∇𝑓2
```
= 𝜆1(1, 1, 1) + 𝜆2(2𝑥, 2𝑦, −1).
```
This generates five equations in five unknowns:
0 = 𝜆1 + 2𝜆2𝑥,
0 = 𝜆1 + 2𝜆2𝑦,
1 = 𝜆1 − 𝜆2,
0 = 𝑥 + 𝑦 + 𝑧 − 12,
0 = 𝑥2 + 𝑦2 − 𝑧.
```
From the first three we conclude 𝑥 = 𝑦. (How can we assume 𝜆2 ≠ 0?)
```
```
Combining with the last two equations we solve for points (2, 2, 8) (minimum)
```
```
and (−3, −3, 18) (maximum).
```
2.9. Lambda 27
2.9 Lambda
What is 𝜆?
In this work, 𝜆 is the Lagrange multiplier, and it serves as a place holding tool for
solving a problem of optimizing with constraints. A closer look at 𝜆 reveals interesting
properties that will provide insight when we apply the Lagrange multiplier structure
to dynamic controls.
```
Consider the basic case in Section 2.6 of optimizing 𝑔(𝑥, 𝑦) under a constraint
```
```
𝑓(𝑥, 𝑦) = 𝑐 where extremal points are characterized by the alignment of the gradients
```
```
of 𝑔(𝑥, 𝑦) and 𝑓(𝑥, 𝑦):
```
∇𝑔 = 𝜆 ∇𝑓.
If ∇𝑓 is nonzero, |𝜆| is the ratio of the lengths of the gradients of 𝑓 and 𝑔:
|𝜆| = ‖∇𝑔‖‖∇𝑓‖ .
As such, 𝜆 is the rate of change in 𝑔 per rate of change in 𝑓 in the direction the gradients
are aligned. From this we can conclude that if our constraint, 𝑓, changes from 𝑐 to 𝑐 + 𝛿
for some small 𝛿, we expect our optimal value, 𝑔, to change by about 𝛿𝜆.
The following example demonstrates this numerically.
Example 2.11: Saddle
```
Returning to Example 2.5, we found a maximum value for 𝑔(𝑥, 𝑦) = 𝑥2 + 2𝑥𝑦 −
```
```
3𝑦2 + 8𝑦 − 4 to be 7.682 . . . at (𝑥, 𝑦) = (1.611 . . . , 1.185 . . . ) for the constraint
```
𝑥2 +𝑦2 = 22 = 4. At this extremal point we calculate 𝜆 = ‖∇𝑔‖/‖∇𝑓‖ = 1.735 . . . .
Figure 2.7. Increasing the constraint moves the maximum
point along the stationary curve.
Now consider a circle of radius, say, 2.3, and maximize subject to the con-
```
straint 𝑥2 + 𝑦2 = 2.32 = 5.29 (Figure 2.7). Then we have changed the value of
```
28 Chapter 2. Static Optimization
our constraint by 𝛿 = 1.29, and we can expect our maximum value to increase
```
by 𝛿𝜆 = (1.29)(1.735 . . . ) = 2.239 . . . . The actual maximum of 𝑔(𝑥, 𝑦) subject to
```
𝑥2 + 𝑦2 = 2.32 is 9.870 . . . , an increase of 2.188 . . . . Pretty close to our estimate.
If we maximize over a circle of radius 2.1, making our constraint 𝑥2 + 𝑦2 =
2.12 = 4.41, we increase our constraint by 𝛿 = 0.41 and we expect our maxi-
```
mum to increase by 𝛿𝜆 = (0.41)(1.735 . . . ) = .7115 . . . . The actual maximum is
```
approximately 8.387 . . . , an increase of .706 . . . . Even closer.
Maximizing over a circle of radius 2.01 would increase our constraint by 𝛿 =
```
0.0401, our anticipated increase would be 𝛿𝜆 = (0.0401)(1.735 . . . ) = 0.0659 . . .
```
and our actual increase is 0.0654 . . . . In the limit, the ratio of our anticipated
increase and actual increase converges to one.
It is important to see this concept clearly.
Recall that the gradient ∇𝑓 points in the direction of steepest ascent of the function
𝑓, and the length |∇𝑓| is the rise over run of that steepest ascent.
```
Suppose the maximum of 𝑔(𝑥, 𝑦) given constraint 𝑓(𝑥, 𝑦) = 𝑐 is at a point (𝑥1, 𝑦1)
```
```
with value 𝑣1 = 𝑔(𝑥1, 𝑦1). Assume the gradients are parallel (pointing in the same
```
```
direction) and nonzero at this point, with 𝜆 = ‖∇𝑔‖/‖∇𝑓‖.
```
If our constraint 𝑓 = 𝑐 is relaxed to a constraint 𝑓 = 𝑐 + 𝛿 for some small 𝛿 > 0,
```
we would want to get a better maximum for 𝑔 by moving from the point (𝑥1, 𝑦1) in the
```
direction ∇𝑔, the direction of greatest increase in 𝑔.
How far in this direction can we move?
At this optimal point the gradients ∇𝑓 and ∇𝑔 are aligned. So a better question is
how far in the direction of ∇𝑓 can we move if we increase the constraint from 𝑓 = 𝑐 to
𝑓 = 𝑐 + 𝛿. As ‖∇𝑓‖ is the rise over run of 𝑓 in this direction, the answer is that we can
move a distance 𝜖 in this direction where 𝛿 = 𝜖‖∇𝑓‖, or 𝜖 = 𝛿/‖∇𝑓‖, see Figure 2.8.
Figure 2.8. Increase in the value of 𝑓 in the direction of the gradient.
2.9. Lambda 29
How much of an increase will we get from 𝑔 with such a move?
The length ‖∇𝑔‖ is the rise over run of increase in 𝑔 in the direction ∇𝑔. If we move
a distance 𝜖 in this direction, we expect an increase of about 𝜖‖∇𝑔‖.
So, if we increase our constraint from 𝑐 to 𝑐+𝛿, we can move a distance 𝜖 = 𝛿/‖∇𝑓‖
and expect to increase our optimal 𝑔 by
𝜖 ‖∇𝑔‖ = 𝛿 ‖∇𝑔‖‖∇𝑓‖ = 𝛿𝜆.
That is, increasing our constraint by 𝛿 increases our maximum by 𝜆𝛿. This is what 𝜆
is.
We have the following key idea:
The Lagrange multiplier 𝜆 is the rate of change in the optimum value of
```
𝑔(𝑥, 𝑦) per change in constraint value 𝑐 = 𝑓(𝑥, 𝑦).
```
Conceptually, we have
```
𝜆 = 𝑑𝑑𝑐 (Maximum of 𝑔(𝑥, 𝑦) subject to 𝑓(𝑥, 𝑦) = 𝑐).
```
The previous example demonstrated this principle as a numerical approximation. The
following example shows the idea exactly as a derivative in closed form. The example
also demonstrates that the principle applies equally to minimizing.
Example 2.12: Paraboloid
```
Consider 𝑔(𝑥, 𝑦) = 5𝑥2 + 4𝑥𝑦 + 2𝑦2, and suppose we want to find the minimum
```
value of this function subject to a constraint 𝑥 = 𝑐. We expect this minimum to
occur at a point where the level curve of 𝑔 is tangent to the vertical line 𝑥 = 𝑐.
```
We will express this minimum value as a function of the constraint 𝐽(𝑐). We
```
do this using Lagrange multipliers, and then we explore how the value of the
```
multiplier 𝜆 relates to the rate of change of 𝐽(𝑐).
```
```
Note that we can minimize 𝑔(𝑥, 𝑦) subject to this constraint directly by sub-
```
```
stituting 𝑥 = 𝑐 and considering 𝑔(𝑐, 𝑦) = 5𝑐2 + 4𝑐𝑦 + 2𝑦2. This is unbounded, so
```
```
no maximum exists. We can complete the square to get 𝑔(𝑐, 𝑦) = 2(𝑦 + 𝑐)2 + 3𝑐2,
```
which has a minimum of 3𝑐2 at 𝑦 = −𝑐.
```
For Lagrange, formulate the constraint as 𝑓(𝑥, 𝑦) = 𝑐 where 𝑓(𝑥, 𝑦) = 𝑥 to
```
get
```
∇𝑓 = (1, 0),
```
```
∇𝑔 = (10𝑥 + 4𝑦, 4𝑥 + 4𝑦).
```
```
These are parallel when 4𝑥 + 4𝑦 = 0, producing a stationary set 𝑦 = −𝑥; see
```
Figure 2.9.
30 Chapter 2. Static Optimization
Figure 2.9. Stationary points and a minimum for the con-
straint value 𝑐 = 1.
```
Setting the constraint 𝑥 = 𝑐 yields a minimum value of 𝐽(𝑐) = 𝑔(𝑐, −𝑐) = 3𝑐2,
```
as we found earlier.
```
Evaluating gradients at the extremal point (𝑐, −𝑐),
```
```
∇𝑔(𝑐, −𝑐) = (6𝑐, 0),
```
```
∇𝑓(𝑐, −𝑐) = (1, 0),
```
we see 𝜆 = 6𝑐.
```
This is equal to the derivative of the minimum 𝐽(𝑐) = 3𝑐2 with respect to the
```
constraint value 𝑐.
The value of the Lagrange multiplier 𝜆 is the rate of change of the minimum
with respect to change in constraint value 𝑐.
Some care is needed to interpret the sign of 𝜆. Gradients point in the direction of
greatest increase. If 𝜆 > 0, then the gradients are pointing in the same direction, and
if 𝜆 < 0, they are pointing in opposite directions.
If 𝜆 > 0, then the maximum of 𝑔 will increase with an increase in the constraint
𝑐 = 𝑓, and if 𝜆 < 0, the maximum will decrease.
This flips when minimizing. If 𝜆 < 0, then the minimum of 𝑔 will decrease with
an increase in the constraint 𝑐 = 𝑓, and if 𝜆 < 0, the minimum will increase.
We can generalize this interpretation of 𝜆 to the multiple constraint case covered
in Section 2.8. When maximizing 𝑔 with multiple constraints 𝑓𝑖 = 𝑐𝑖, each associated
𝜆𝑖 is the rate of change of the optimal value with respect to a change in the restriction
𝑐𝑖. The following example demonstrates the concept.
2.9. Lambda 31
Example 2.13
```
Returning to the Example 2.9, consider minimizing 𝑔(𝑥, 𝑦, 𝑧) = 𝑥2 + 𝑦2 + 𝑧2
```
subject to the general constraint values:
```
𝑓1(𝑥, 𝑦, 𝑧) = 𝑥 + 𝑦 + 𝑧 = 𝑐1,
```
```
𝑓2(𝑥, 𝑦, 𝑧) = 𝑥 + 𝑦 + 2𝑧 = 𝑐2
```
for given constants 𝑐1, 𝑐2. Setting ∇𝑔 = 𝜆1∇𝑓1 + 𝜆2∇𝑓2 generates
2𝑥 = 𝜆1 + 𝜆2,
2𝑦 = 𝜆1 + 𝜆2,
2𝑧 = 𝜆1 + 2𝜆2.
Solving these five equations for the five unknowns 𝑥, 𝑦, 𝑧, 𝜆1, 𝜆2, produces a unique
solution
𝑥 = 𝑐1 − 12 𝑐2,
𝑦 = 𝑐1 − 12 𝑐2,
𝑧 = 0,
𝜆1 = 6𝑐1 − 4𝑐2,
𝜆2 = −4𝑐1 + 3𝑐2.
```
(2.4)
```
The minimum value for 𝑔 under these constraints is a function of the con-
straint values:
```
𝐽(𝑐2, 𝑐2) = 𝑔 (𝑐1 − 12 𝑐2, 𝑐1 − 12 𝑐2, 0) = 3𝑐21 − 4𝑐1𝑐2 + 32 𝑐22
```
and we note that the partial derivatives turn out to be equal to the values we found
```
in equations (2.4) for the Lagrange multipliers:
```
𝜕𝐽
𝜕𝑐1= 6𝑐1 − 4𝑐2 = 𝜆1,
𝜕𝐽
𝜕𝑐2= −4𝑐1 + 3𝑐2 = 𝜆2.
That is, the value of the Lagrange multiplier 𝜆𝑖 is the rate of change of the mini-
mum with respect to change in constraint value 𝑐𝑖.
It is insightful to consider how all this plays out in terms of the units of variables
in our models. For example, suppose we have an economic model of production, mea-
```
sured in number of units produced, as a function 𝑔(𝑥, 𝑦, 𝑧) of hours of labor 𝑥, equip-
```
```
ment run time 𝑦, and tons of material 𝑧. The cost of 𝑥, 𝑦, 𝑧 is a function 𝑓1(𝑥, 𝑦, 𝑧)
```
32 Chapter 2. Static Optimization
```
measured in dollars and we have a budget constraint 𝑓1(𝑥, 𝑦, 𝑧) = 𝑐1 dollars. The car-
```
```
bon dioxide produced by 𝑥, 𝑦, 𝑧 is a function 𝑓2(𝑥, 𝑦, 𝑧) measure in tons of 𝐶𝑂2 and we
```
```
have a regulatory restriction 𝑓2(𝑥, 𝑦, 𝑧) = 𝑐2 tons. In the Lagrange multiplier condition
```
∇𝑔 = 𝜆1∇𝑓1 + 𝜆2∇𝑓2
we have that 𝜆1 is the change in optimal production per dollar change in budget con-
```
straint (production per dollar), and 𝜆2 is the change in optimal production per ton
```
```
change in 𝐶𝑂2 restriction (production per ton). With ∇𝑔 in production units, ∇𝑓1 in
```
dollars, and ∇𝑓2 in tons, this yields the dimensional analysis:
```
production = ( productiondollars ) dollars + ( productiontons ) tons.
```
2.10 Hamilton and Lagrange
Hamiltonians and Lagrangians are universal structures with deep mathematical mean-
ing. Our use of them in this study barely scratches the surface of their importance in
mathematics and physics. We will make significant use of the Hamiltonian in the sub-
sequent chapters.
```
For optimizing 𝑔(𝑥, 𝑦) with respect to a constraint 𝑓(𝑥, 𝑦) = 0 we look for points
```
where ∇𝑔 = 𝜆∇𝑓. Allowing for changes in the sign of 𝜆 and expanding the gradient
operator, these conditions can be reframed as three equations in three unknowns:
```
0 = 𝜕𝑔𝜕𝑥 (𝑥, 𝑦) + 𝜆 𝜕𝑓𝜕𝑥 (𝑥, 𝑦),
```
```
0 = 𝜕𝑔𝜕𝑦 (𝑥, 𝑦) + 𝜆 𝜕𝑓𝜕𝑦 (𝑥, 𝑦),
```
```
0 = 𝑓(𝑥, 𝑦).
```
Solutions to this set of equations are critical points of
```
𝐻(𝑥, 𝑦, 𝜆) = 𝑔(𝑥, 𝑦) + 𝜆 𝑓(𝑥, 𝑦)
```
as these equations are expansions of 0 = 𝜕𝐻𝜕𝑥 , 0 = 𝜕𝐻𝜕𝑦 , and 0 = 𝜕𝐻𝜕𝜆 , respectively.
This function is called the Hamiltonian and has a pretty widespread reputation for
```
awesomeness. The multiple conditions in equations (2.2) and (2.3) can be written as
```
```
𝑛 + 𝑚 equations in 𝑛 + 𝑚 unknowns (with sign changes for 𝜆𝑖’s):
```
```
0 = 𝜕𝑔𝜕𝑥1(𝑥1, . . . , 𝑥𝑚) + 𝜆1𝜕𝑓𝜕𝑥1(𝑥1, . . . , 𝑥𝑚) + ⋯ + 𝜆𝑚𝜕𝑓𝜕𝑥1(𝑥1, . . . , 𝑥𝑚),
```
```
0 = 𝜕𝑔𝜕𝑥2(𝑥1, . . . , 𝑥𝑚) + 𝜆1𝜕𝑓𝜕𝑥2(𝑥1, . . . , 𝑥𝑚) + ⋯ + 𝜆𝑚𝜕𝑓𝜕𝑥2(𝑥1, . . . , 𝑥𝑚),
```
⋮
```
0 = 𝜕𝑔𝜕𝑥𝑚(𝑥1, . . . , 𝑥𝑚) + 𝜆1𝜕𝑓𝜕𝑥𝑚(𝑥1, . . . , 𝑥𝑚) + ⋯ + 𝜆𝑚𝜕𝑓𝜕𝑥𝑚(𝑥1, . . . , 𝑥𝑚),
```
```
0 = 𝑓1(𝑥1, . . . , 𝑥𝑚),
```
```
0 = 𝑓2(𝑥1, . . . , 𝑥𝑚),
```
⋮
```
0 = 𝑓𝑛(𝑥1, . . . , 𝑥𝑚).
```
Exercises 33
Solutions to this set of equations are critical points of a single Hamiltonian function of
𝑛 + 𝑚 variables:
```
𝐻(𝑥1, . . . , 𝑥𝑚, 𝜆1, . . . , 𝜆𝑛)
```
```
= 𝑔(𝑥1, . . . , 𝑥𝑚) + 𝜆1𝑓1(𝑥1, . . . , 𝑥𝑚) + ⋯ + 𝜆𝑛𝑓1(𝑥1, . . . , 𝑥𝑚).
```
Hamiltonians and Lagrangians are deeply involved in the abstract study of phys-
ical mechanics. A Hamiltonian is formed by the sum of kinetic and potential energy
and is a conserved quantity in mechanical systems. The Lagrangian is the difference
between kinetic and potential energy, and the optimization of the Lagrangian produces
mechanical action. These are intertwined and closely related concepts. We won’t get
into theoretical mechanics, but these deep principles extend far beyond mechanics.
Much of optimal control works from the Hamiltonian viewpoint. The Lagrangian will
make an appearance in calculus of variations in Chapter 13.
Key Points
In this chapter we reviewed methods of static optimization from single and multivari-
able calculus. This entailed a careful examination of what we mean by the derivative
of a function, which we interpret using linearization. We emphasized that locating a
maximum or minimum is a process of eliminating all the places where a maximum or
minimum cannot occur.
We examined the Lagrange multiplier method, for single and multiple constraints,
with an emphasis of understanding the Lagrange multiplier 𝜆 as the change in opti-
mum per change in constraint.
We introduced the idea of a Hamiltonian function, whose critical points are solu-
tions to Lagrange multiplier problems.
Exercises
```
Exercise 2.1(s). Use Lagrange multipliers to find the maximum and minimum of
```
```
𝑔(𝑥, 𝑦) = 𝑥 + 𝑦 subject to constraint 𝑓(𝑥, 𝑦) = 𝑥2 + 2𝑦2 = 1.
```
```
Exercise 2.2(s). Use Lagrange multipliers to find the minimum of 𝑔(𝑥, 𝑦) = 𝑥2 +𝑦2 +𝑧2
```
```
subject to constraints 𝑓1(𝑥, 𝑦, 𝑧) = 𝑥 + 𝑦 + 𝑧 = 2 and 𝑓2(𝑥, 𝑦, 𝑧) = 𝑥 + 𝑦 − 𝑧 = 3.
```
```
Exercise 2.3. Find the extreme values of 𝑔(𝑥, 𝑦) = 5𝑥2 + 5𝑦2 − 6𝑥 − 8𝑦 + 1 over the
```
circle 𝑥2 + 𝑦2 = 2 in two different ways:
```
(a) Parameterize the circle 𝑥(𝜃) = 2 cos(𝜃), 𝑦(𝜃) = 2 sin(𝜃) and optimize over 𝜃.
```
```
(b) Use Lagrange multipliers. Do you get the same result?
```
```
Exercise 2.4. Maximize and minimize 𝑔(𝑥, 𝑦) = 5𝑥2 + 5𝑦2 − 6𝑥 − 8𝑦 + 1 over the
```
unit circle 𝑥2 + 𝑦2 = 1 using Lagrange multipliers. Plot some level curves of 𝑔 and the
constraint curve, and identify the maxima and minima. You should get that a Lagrange
multiplier is 𝜆 = 0. Show where this occurs.
34 Chapter 2. Static Optimization
```
Exercise 2.5(s). Continuing with the previous exercises, use Lagrange multipliers to
```
find the minimum value of 5𝑥2 + 5𝑦2 − 6𝑥 − 8𝑦 + 1 over the circle 𝑥2 + 𝑦2 = 𝜅 as a
```
function 𝐽(𝜅) of 𝜅 > 0. Plot this function, and show that it has a minimum at 𝜅 = 1.
```
How does this relate to Exercise 2.4?
```
Exercise 2.6. Consider the paraboloid 𝑔(𝑥, 𝑦) = (𝑥 − 1)2 + 𝑦2.
```
```
(a) Use Lagrange multipliers to find the minimum of 𝑔(𝑥, 𝑦) on the line 𝑥 + 𝑦 = 2.
```
```
(b) Use Lagrange multipliers to find the minimum 𝐽(𝜅) of 𝑔(𝑥, 𝑦) on the line 𝑥 + 𝑦
```
= 𝜅.
```
(c) Verify that 𝐽′(𝜅) equals the value of the Lagrange multiplier.
```
```
Exercise 2.7(hs). Consider 𝑔(𝑥, 𝑦, 𝑧) = 𝑥𝑦 + 𝑧2.
```
```
(a) Use Lagrange multipliers to find the minimum of 𝑔 subject to constraints 2𝑥 −
```
𝑦 + 3𝑧 = 2 and 𝑥 + 𝑦 + 𝑧 = 0.
```
(b) Use Lagrange multipliers to find the minimum of 𝑔 subject to constraints 2𝑥 −
```
```
𝑦 + 3𝑧 = 𝑝 and 𝑥 + 𝑦 + 𝑧 = 𝑞 as a function 𝐽(𝑝, 𝑞). Verify that 𝜕𝐽𝜕𝑝 and 𝜕𝐽𝜕𝑞 are equal to
```
the Lagrange multipliers.
```
Exercise 2.8. The Cobb-Douglas production function 𝑔(𝑥, 𝑦) = 𝑘𝑥𝛼𝑦𝛽 for positive 𝑘,
```
```
𝛼, 𝛽, with 𝛼 + 𝛽 = 1, is the number of units manufactured by 𝑥 units of capital (in
```
```
dollars) and 𝑦 units of labor (in hours).
```
Assume labor costs 𝐿 dollars per hour, so total cost is measured as 𝑥 + 𝐿𝑦 dollars.
Taking 𝛼 = 1/5, 𝛽 = 4/5, how can we maximize production while spending 𝑀
```
dollars (so 𝑥 + 𝐿𝑦 = 𝑀)? How would the maximum change if we could spend 𝑀 + 1
```
dollars? How does this relate to the Lagrange multiplier?
```
Exercise 2.9(h). For values 𝑎1, . . . , 𝑎𝑛 and 𝑏1, . . . , 𝑏𝑛, prove the Cauchy-Schwarz in-
```
equality for finite sums:
∑𝑎𝑖𝑏𝑖 ≤ √∑ 𝑎2𝑖 √∑ 𝑏2𝑖
by the following steps:
```
(a) Maximize ∑ 𝑥𝑖𝑦𝑖 subject to ∑ 𝑥2𝑖 = 1 and ∑ 𝑦2𝑖 = 1.
```
```
(b) Substitute 𝑥𝑖 = 𝑎𝑖/√∑ 𝑎2𝑖 and 𝑦𝑖 = 𝑏𝑖/√∑ 𝑏2𝑖 in your result, and conclude
```
the Cauchy-Schwarz inequality.
```
Exercise 2.10(h). Suppose 𝑓 is differentiable at 𝑥 = 𝑎 with 𝑓′(𝑎) > 0. Use the defini-
```
```
tion of the derivative to prove that there is a point 𝑏 > 𝑎 with 𝑓(𝑏) > 𝑓(𝑎).
```
3
```
Control: A Discrete Start
```
In Chapter 1 we optimized the net payoff 𝐽 in a simple game of Bocce ball using basic
calculus techniques. This worked well for the one- or two-step game, but the direct
approach quickly becomes untenable as more steps are added. Pontryagin’s method,
which we begin to study in this chapter, uses Lagrange multipliers, covered in Chapter
2, to cut through this complexity and create a format that scales up for any number of
steps. Here is where we start building our core theory.
We consider a process that begins in a state 𝑥0, and for 𝑖 = 0, 1, . . . , 𝑁 − 1 we
exercise a control 𝑢𝑖 to move the system from state 𝑥𝑖 to the next state 𝑥𝑖+1 according
```
to a control dynamic 𝑥𝑖+1 = 𝑓(𝑥𝑖, 𝑢𝑖) creating a trajectory 𝑥0, . . . , 𝑥𝑁 in state space. We
```
want to operate the control to optimize the overall performance of the system, which
```
is measured at each step as 𝑔(𝑥𝑖, 𝑢𝑖) and at the end state as 𝐺(𝑥𝑁 ). We can think of
```
```
these as payoffs (with costs being negative values) and so we want to optimize 𝐽 =
```
```
𝐺(𝑥𝑁 ) + ∑𝑁−1𝑖=0 𝑔(𝑥𝑖, 𝑢𝑖). In the Bocce ball examples, we had a cost for each move and
```
a payoff at the end, and in Example 1.4 we had a fixed start and end position, with
costs along the way. In this chapter we will develop a general technique for addressing
problems of this form.
3.1 Optimal Two-Step Process Control
We begin by revisiting the two-step optimization problem using Lagrange techniques.
Example 3.1: Two-Step Bocce Redux
We return to our Bocce ball example, Example 1.2, and solve the problem using
Lagrange multipliers.
From a given starting position 𝑥0 we make two moves, 𝑢0, 𝑢1, with 𝑥1 = 𝑥0 +
𝑢0 and 𝑥2 = 𝑥1+𝑢1. Each move costs 𝑢2𝑖 /𝑥𝑖 and our final payoff is 𝑥2. Formulating
this in terms of Lagrange multipliers, we want to find values 𝑥1, 𝑥2, 𝑢0, 𝑢1 that
35
36 Chapter 3. Control: A Discrete Start
maximize net payoff
```
𝐽(𝑥1, 𝑥2, 𝑢0, 𝑢1) = 𝑥2 − 𝑢
```
20
𝑥0−
𝑢21
𝑥1
subject to constraints 𝑥1 = 𝑥0 + 𝑢0 and 𝑥2 = 𝑥1 + 𝑢1, which we formulate as
functions set equal to zero
```
𝑓1(𝑥1, 𝑥2, 𝑢0, 𝑢1) = 𝑥0 + 𝑢0 − 𝑥1 = 0,
```
```
𝑓2(𝑥1, 𝑥2, 𝑢0, 𝑢1) = 𝑥1 + 𝑢1 − 𝑥2 = 0.
```
The Lagrange condition is
```
∇𝐽 = 𝜆1∇𝑓1 + 𝜆2∇𝑓2. (3.1)
```
Expanding the gradients by differentiating our functions with respect to each
```
variable 𝑥1, 𝑥2, 𝑢0, 𝑢1 yields (∗ check ∗)
```
```
∇𝐽 = ( ᵆ
```
21
𝑥21, 1, −
2ᵆ0
𝑥0, −
2ᵆ1
```
𝑥1 ) ,
```
```
∇𝑓1 = (−1, 0, 1, 0) ,
```
```
∇𝑓2 = (1, −1, 0, 1) .
```
```
Substituting these into equation (3.1) generates four equations (∗ verify ∗):
```
ᵆ21
𝑥21= −𝜆1 + 𝜆2,
1 = −𝜆2,
− 2ᵆ0𝑥0= 𝜆1,
− 2ᵆ1𝑥1= 𝜆2.
```
(3.2)
```
From here, we solve the last two equations to determine 𝑢0 and 𝑢1 in terms
of 𝑥1, 𝑥2, 𝜆1, 𝜆2:
𝑢0 = − 12 𝑥0𝜆1,
𝑢1 = − 12 𝑥1𝜆2.
```
Substituting into the first two equations of (3.2) yields (∗ check ∗)
```
𝜆22
4 = −𝜆1 + 𝜆2,
1 = −𝜆2,
which determines our costates: 𝜆2 = −1 and 𝜆1 = −5/4.
So at the first step we should apply control 𝑢0 = −𝑥0𝜆1/2 = 5𝑥0/8 which
moves the ball to 𝑥1 = 13𝑥0/8.
On the second step we apply control 𝑢1 = −𝑥1𝜆2/2 = 13𝑥0/8 moving the ball
to 𝑥2 = 39𝑥0/16 for a net payoff of 105𝑥0/64.
This matches our result from Example 1.2.
3.1. Optimal Two-Step Process Control 37
The Lagrange multiplier solution to this example takes more steps and seems more
complicated than the direct solution in Chapter 1, but the idea is that the Lagrange
multiplier approach will readily generalize to any number of steps whereas the direct
approach will become untenable due to compounding complexity.
Let’s look more carefully at a general two-step process, and then we will generalize
to 𝑛 steps.
Consider a problem where we observe the initial state 𝑥0 of a system and apply a
```
control 𝑢0 which leads to outcome 𝑥1 = 𝑓(𝑥0, 𝑢0). We then apply control 𝑢1 which
```
```
leads to a final outcome 𝑥2 = 𝑓(𝑥1, 𝑢1). We want to choose controls to optimize a
```
performance function in the form
```
𝐽(𝑥1, 𝑥2, 𝑢0, 𝑢1) = 𝐺(𝑥2) + 𝑔(𝑥0, 𝑢0) + 𝑔(𝑥1, 𝑢1). (3.3)
```
For using Lagrange multipliers, we express our control dynamics as constraints
```
𝑓1(𝑥1, 𝑥2, 𝑢0, 𝑢1) = 𝑓(𝑥0, 𝑢0) − 𝑥1 = 0,
```
```
𝑓2(𝑥1, 𝑥2, 𝑢0, 𝑢1) = 𝑓(𝑥1, 𝑢1) − 𝑥2 = 0.
```
```
(3.4)
```
For a given starting point 𝑥0, we look for optimal values of 𝐽 over 𝑛 = 4 variables
𝑥1, 𝑥2, 𝑢0, 𝑢1 subject to 𝑚 = 2 constraints by setting up the Lagrange multipliers
∇𝐽 = 𝜆1∇𝑓1 + 𝜆2∇𝑓2
which generates four equations, one for each partial derivative with respect to 𝑥1, 𝑥2,
𝑢0, 𝑢1.
𝜕𝐽
𝜕𝑥1= 𝜆1
𝜕𝑓1
𝜕𝑥1+ 𝜆2
𝜕𝑓2
𝜕𝑥1,
𝜕𝐽
𝜕𝑥2= 𝜆1
𝜕𝑓1
𝜕𝑥2+ 𝜆2
𝜕𝑓2
𝜕𝑥2,
𝜕𝐽
𝜕ᵆ0= 𝜆1
𝜕𝑓1
𝜕ᵆ0+ 𝜆2
𝜕𝑓2
𝜕ᵆ0,
𝜕𝐽
𝜕ᵆ1= 𝜆1
𝜕𝑓1
𝜕ᵆ1+ 𝜆2
𝜕𝑓2
𝜕ᵆ1.
When expanding out these four equations many of the terms are zero. Check this
```
with substitutions from equations (3.3) and (3.4) to derive
```
𝜕𝑔
```
𝜕𝑥 (𝑥1, 𝑢1) = −𝜆1 + 𝜆2
```
𝜕𝑓
```
𝜕𝑥 (𝑥1, 𝑢1),
```
𝜕𝐺
```
𝜕𝑥 (𝑥2) = −𝜆2,
```
𝜕𝑔
```
𝜕ᵆ (𝑥0, 𝑢0) = 𝜆1
```
𝜕𝑓
```
𝜕ᵆ (𝑥0, 𝑢0),
```
𝜕𝑔
```
𝜕ᵆ (𝑥1, 𝑢1) = 𝜆2
```
𝜕𝑓
```
𝜕ᵆ (𝑥1, 𝑢1).
```
```
(3.5)
```
There is a certain order in resolving these equations that makes for an elegant solu-
tion, which is basically the steps we followed in Example 3.1 and which is a consistent
approach throughout our exploration of optimal control techniques.
38 Chapter 3. Control: A Discrete Start
```
First, solve the last two equations in the system (3.5) to determine the optimal
```
controls 𝑢0 and 𝑢1 in terms of state variables 𝑥0, 𝑥1 and Lagrange multipliers 𝜆1, 𝜆2.
Second, substitute the resulting 𝑢1 and 𝑢2 into the first two equations in system
```
(3.5) and the constraints (3.4) to get
```
𝜕𝑔
```
𝜕𝑥 (𝑥1, 𝑢1) = −𝜆1 + 𝜆2
```
𝜕𝑓
```
𝜕𝑥 (𝑥1, 𝑢1),
```
𝜕𝐺
```
𝜕𝑥 (𝑥2) = −𝜆2,
```
```
𝑥1 = 𝑓(𝑥0, 𝑢0),
```
```
𝑥2 = 𝑓(𝑥1, 𝑢1).
```
Third, solve these equations for 𝑥1, 𝑥2, 𝜆1, and 𝜆2, which will determine controls
𝑢1, 𝑢2 and payoff 𝐽. The 𝜆𝑖 will be referred to as costate variables and will become part
of a dynamical system that defines necessary conditions for an optimal control.
This method produces state values 𝑥1, 𝑥2 and costate values 𝜆1, 𝜆2 and a condition
on control values 𝑢0, 𝑢1 that must be satisfied by an optimal control.
3.2 Optimal 𝑁-Step Process Control
The above two-step method gives us some idea of how Lagrange multipliers can be used
to solve multistep control problems. The general method for solving the 𝑁-step discrete
optimal control problem extends the two-step method and is summarized in the follow-
ing basic principle. We state the principle, explain how to apply it, and demonstrate
with a couple of examples.
This principle reveals the key elements of Pontryagin’s method and shows the basic
template for the principles developed throughout this text.
OPTIMAL PRINCIPLE 0
Local optimal, fixed duration, time independent, one dimension, discrete
Given a starting point 𝑥0, a trajectory 𝑥0, 𝑥1, . . . , 𝑥𝑁 that optimizes
```
𝐽 = 𝐺(𝑥𝑁 ) +
```
𝑁−1
∑
𝑖=0
```
𝑔(𝑥𝑖, 𝑢𝑖)
```
under the process
```
𝑥𝑖+1 = 𝑓(𝑥𝑖, 𝑢𝑖) for 𝑖 = 0, . . . , 𝑁 − 1
```
with costates 𝜆0, 𝜆1, . . . , 𝜆𝑁 that satisfy the recursion
```
𝜆𝑖 = 𝜆𝑖+1𝜕𝑓𝜕𝑥 (𝑥𝑖, 𝑢𝑖) − 𝜕𝑔𝜕𝑥 (𝑥𝑖, 𝑢𝑖) for 𝑖 = 0, . . . , 𝑁 − 1
```
must have a control vector 𝑢0, 𝑢1, . . . , 𝑢𝑁−1 that satisfies
𝜕𝑔
```
𝜕ᵆ (𝑥𝑖, 𝑢𝑖) = 𝜆𝑖+1
```
𝜕𝑓
```
𝜕ᵆ (𝑥𝑖, 𝑢𝑖) for 𝑖 = 0, . . . , 𝑁 − 1.
```
If the end state 𝑥𝑁 is not specified, then the final costate must satisfy
```
𝜆𝑁 = −𝐺′(𝑥𝑁 ).
```
3.2. Optimal 𝑁-Step Process Control 39
With this principle, we have a recursive condition on the sequence 𝜆0, . . . , 𝜆𝑁 of
```
costates (basically a sequence of Lagrange multipliers) which combine with the recur-
```
sively defined state sequence 𝑥0, . . . , 𝑥𝑁 to define conditions that an optimal control
sequence 𝑢0, . . . , 𝑢𝑁−1 must satisfy.
Applying the principle typically proceeds through three steps:
First Step: Solve
𝜕𝑔
```
𝜕𝑢 (𝑥𝑖, 𝑢𝑖) = 𝜆𝑖+1
```
𝜕𝑓
```
𝜕𝑢 (𝑥𝑖, 𝑢𝑖)
```
for 𝑢𝑖 in terms of 𝑥𝑖 and 𝜆𝑖+1 for 𝑖 = 0, . . . , 𝑁 − 1.
Second Step: Substitute these 𝑢𝑖 values to set up two recursions:
```
𝑥𝑖+1 = 𝑓(𝑥𝑖, 𝑢𝑖),
```
```
𝜆𝑖 = 𝜆𝑖+1𝜕𝑓𝜕𝑥 (𝑥𝑖, 𝑢𝑖) − 𝜕𝑔𝜕𝑥 (𝑥𝑖, 𝑢𝑖)
```
for 𝑖 = 0, 1, . . . , 𝑁 − 1. Note that the recursion for 𝜆𝑖 seems to go backwards in time.
Weird.
Third Step: Solve the recursions. You will need two boundary conditions, one of which
```
is that given by the starting point 𝑥0. If 𝑥𝑁 is free, use 𝜆𝑁 = −𝐺′(𝑥𝑁 ) as the second
```
```
condition (see Example 3.2). If both 𝑥0 and 𝑥𝑁 are specified, use these as endpoint
```
```
values and this will determine the value for 𝜆𝑁 (see Example 3.3). Note that in most
```
recursions, one thinks of starting at some location and proceeding forward. In this
case, and in many of the Pontryagin solutions, we usually have some form of two-point
boundary problems, where a starting and ending location are specified.
Example 3.2: 𝑁-Step Bocce
```
Generalizing Example 3.1 to 𝑁 steps, we have a controlled process 𝑥𝑛+1 = 𝑓(𝑥𝑛, 𝑢𝑛)
```
```
= 𝑥𝑛 + 𝑢𝑛 for 𝑛 = 0, . . . , 𝑁 − 1 with running costs 𝑔(𝑥, 𝑢) = 𝑢2/𝑥 and end payoff
```
```
𝐺(𝑥) = 𝑥, for net payoff
```
𝐽 = 𝑥𝑁 −
𝑁−1
∑
𝑖=0
𝑢2𝑖
𝑥𝑖.
40 Chapter 3. Control: A Discrete Start
Applying Principle 0 we have
```
𝑓(𝑥, 𝑢) = 𝑥 + 𝑢,
```
```
𝐺(𝑥) = 𝑥,
```
```
𝑔(𝑥, 𝑢) = − ᵆ2𝑥 .
```
First Step: Solve for 𝑢𝑖 from
𝜕𝑔
```
𝜕ᵆ (𝑥𝑖, 𝑢𝑖) = 𝜆𝑖+1
```
𝜕𝑓
```
𝜕ᵆ (𝑥𝑖, 𝑢𝑖),
```
− 2ᵆ𝑖𝑥𝑖= 𝜆𝑖+1
which determines our control
𝑢𝑖 = − 12 𝜆𝑖+1 𝑥𝑖
in terms of state 𝑥𝑖 and costate 𝜆𝑖+1.
```
Second Step: Set up the recursions; substitute 𝑢𝑖:
```
```
𝑥𝑖+1 = 𝑓(𝑥𝑖, 𝑢𝑖)
```
= 𝑥𝑖 + 𝑢𝑖
= 𝑥𝑖 − 12 𝜆𝑖+1𝑥𝑖,
```
𝜆𝑖 = 𝜆𝑖+1𝜕𝑓𝜕𝑥 (𝑥𝑖, 𝑢𝑖) − 𝜕𝑔𝜕𝑥 (𝑥𝑖, 𝑢𝑖)𝑚
```
= 𝜆𝑖+1 − ᵆ
2𝑖
𝑥2𝑖
= 𝜆𝑖+1 − 14 𝜆2𝑖+1
```
= 𝜆𝑖+1 (1 − 14 𝜆𝑖+1) .
```
Third Step: Solve the recursions. In this case 𝑥𝑁 is not specified, and we have
```
𝜆𝑁 = −𝐺′(𝑥𝑁 ) = −1. Since the recursion for 𝜆𝑖 does not involve 𝑥𝑖, we now have
```
the costate sequence completely defined for any 𝑁. Start with 𝜆𝑁 = −1 and work
```
backwards to get 𝜆𝑁−1, . . . , 𝜆0 by applying the recursion 𝜆𝑖 = 𝜆𝑖+1 (1 − 14 𝜆𝑖+1):
```
𝜆𝑁 = −1,
```
𝜆𝑁−1 = (−1) (1 − 14 (−1)) = − 54 ,
```
```
𝜆𝑁−2 = (− 54 ) (1 − 14 (− 54 )) = − 10564 ,
```
⋮ ⋮ ⋮
We then use the 𝜆𝑖 sequence to determine our controls 𝑢𝑖 and this allows us
to solve for the optimal trajectory 𝑥0, 𝑥1, . . . , 𝑥𝑁 and control sequence 𝑢0, 𝑢1, . . . ,
𝑢𝑁−1.
3.2. Optimal 𝑁-Step Process Control 41
For 𝑁 = 5 and 𝑥0 = 1 we achieve a maximum 𝐽 = 6.98 . . . using
𝑥 𝜆 𝑢
0 1.00 −6.99 . . . 1.83 . . .
1 2.83 . . . −3.65 . . . 3.27 . . .
2 6.09 . . . −2.31 . . . 5.00 . . .
3 11.09 . . . −1.64 . . . 6.93 . . .
4 18.03 . . . −1.25 . . . 9.01 . . .
5 27.04 . . . −1.00 −
Note that it is the state-costate system
𝑥𝑖+1 = 𝑥𝑖 − 12 𝜆𝑖+1 𝑥𝑖,
```
𝜆𝑖 = 𝜆𝑖+1 (1 − 14 𝜆𝑖+1)
```
```
with boundary values 𝑥0 = 1 and 𝜆5 = −1 that drives this solution (Figure 3.1).
```
Figure 3.1. The optimal trajectory for 𝑁 = 5 plotted in state-
costate space.
This is typical for optimal control problems: the optimization principle cre-
ates a dynamic set of Lagrange multipliers, or costates, and it is the state-costate
dynamics fitted to the initial conditions that create an optimal solution. It is of
interest that the costates seem to be working backwards in time.
42 Chapter 3. Control: A Discrete Start
The following applies Principle 0 to the control problem in Example 1.4 and demon-
strates how the principle works when both 𝑥0 and 𝑥𝑁 are specified, and we are mini-
mizing a cost.
Example 3.3
Consider an 𝑁-step process with fixed end locations 𝑥0 = 0, 𝑥𝑁 = 100, control
```
dynamic 𝑓(𝑥, 𝑢) = 𝑥 + 𝑢, and running costs 𝑔(𝑥, 𝑢) = 𝑥 + 𝑢2/2, as in Example
```
1.4.
Take 𝑁 = 10. For equal steps, 𝑢0 = 𝑢1 = ⋯ = 𝑢9 = 10, we calculate a cost of
𝐽 = 950. We don’t expect this to be optimal, as running costs increase as we move
farther down the number line, so perhaps some adjustments will improve the
outcome. Reviewing Example 1.4, we suspect that we might improve by taking
smaller steps at first to reduce the number of steps we have to take in the more
expensive regions farther down the number line.
Applying Principle 0 to find the optimal solution, the costate recursion is
```
𝜆𝑖 = 𝜆𝑖+1𝜕𝑓𝜕𝑥 (𝑥𝑖, 𝑢𝑖) − 𝜕𝑔𝜕𝑥 (𝑥𝑖, 𝑢𝑖),
```
𝜆𝑖 = 𝜆𝑖+1 − 1.
An optimal control must satisfy
𝜕𝑔
```
𝜕ᵆ (𝑥𝑖, 𝑢𝑖) = 𝜆𝑖+1
```
𝜕𝑓
```
𝜕ᵆ (𝑥𝑖, 𝑢𝑖),
```
𝑢𝑖 = 𝜆𝑖+1.
If we assume a terminal costate value of 𝜆10 = 𝐾, we have
𝑢9 = 𝜆10 = 𝐾,
𝑢8 = 𝜆9 = 𝐾 − 1,
⋮ ⋮
𝑢0 = 𝜆1 = 𝐾 − 9.
Note that the value of the control increases by one unit each step, and we verify
that the pattern we observed in Example 1.4 continues to apply.
Our endpoint restriction then imposes
100 = 𝑢0 + 𝑢1 + ⋯ + 𝑢9
```
= (𝐾 − 9) + (𝐾 − 8) + ⋯ + 𝐾
```
```
= 10𝐾 − (9 + 8 + ⋯ + 1)
```
= 10𝐾 − 45
making 𝐾 = 14.5 and controls 𝑢0 = 5.5, 𝑢1 = 6.5, . . . , 𝑢9 = 14.5 for a total
computed cost of 𝐽 = 908.75. With 𝑢𝑖 = 𝜆𝑖, the resulting state-costate trajectory
3.3. Deriving Principle 0 43
```
(𝑥𝑖, 𝜆𝑖) for 𝑖 = 0, . . . , 𝑁 − 1 is defined by
```
𝑥𝑖+1 = 𝑥𝑖 + 𝜆𝑖,
𝜆𝑖 = 𝜆𝑖+1 − 1
with boundary conditions 𝑥0 = 0, 𝑥10 = 100 and is shown in Figure 3.2.
Figure 3.2. The optimal trajectory for 𝑁 = 10 plotted in state-
costate space.
Examining these discrete cases carefully reveals the foundational concepts of Pon-
tryagin’s theory and demonstrates how applying Pontryagin’s principle avoids the com-
pounding complexity we encountered in Chapter 1. Going deeper into the discrete
cases would involve a treatment of solving two-point boundary problems in discrete
dynamics. We avoid this, as we want to focus on differential equation models covered
in subsequent chapters.
The next section is a derivation of the principle in the general discrete case, allow-
ing some mathematical insight into the machinery that drives these solutions.
3.3 Deriving Principle 0
To derive Principle 0, consider a system that starts in an initial position 𝑥0 and evolves
according to a controlled process
```
𝑥𝑖+1 = 𝑓(𝑥𝑖, 𝑢𝑖) for 𝑖 = 0, 2, . . . , 𝑁 − 1
```
for a fixed number 𝑁 steps. We reformulate this control process into 𝑁 constraints that
will work with Lagrange multipliers:
```
𝑓𝑖(𝑥1, . . . , 𝑥𝑁 , 𝑢0, . . . , 𝑢𝑁 ) = 𝑓(𝑥𝑖−1, 𝑢𝑖−1) − 𝑥𝑖 = 0 for 𝑖 = 1, 2, . . . , 𝑁.
```
With these constraints, we want to operate the controls to optimize performance
```
𝐽(𝑥1, . . . , 𝑥𝑁 , 𝑢0, . . . , 𝑢𝑁−1) = 𝐺(𝑥𝑁 ) + ∑𝑁−1𝑖=0 𝑔(𝑥𝑖, 𝑢𝑖)
```
```
= 𝐺(𝑥𝑁 ) + 𝑔(𝑥0, 𝑢0) + ⋯ + 𝑔(𝑥𝑁−1, 𝑢𝑁−1).
```
```
(3.6)
```
Note that we have 2𝑁 variables, 𝑥1, . . . , 𝑥𝑁 , 𝑢0, . . . , 𝑢𝑁−1, and 𝑁 constraints for an
𝑁-step process.
44 Chapter 3. Control: A Discrete Start
The problem is now expressed in a way that we can apply Lagrange multipliers,
and we would look for solutions that satisfy
```
∇𝐽 = 𝜆1∇𝑓1 + 𝜆2∇𝑓2 + ⋯ + 𝜆𝑁 ∇𝑓𝑁 (3.7)
```
where each gradient is the vector of partial derivatives for the full set of 2𝑁 variables, 𝑥1,
. . . , 𝑥𝑛 and 𝑢0, . . . , 𝑢𝑛−1, and this creates a set of 2𝑁 equations, each equation resulting
from the partial derivative of one of the variables.
Let’s look at these partial derivatives carefully, separating out the derivatives with
respect to controls and with respect to state. Keep in mind the distinction between a
```
derivative and a differential operator (see Section 2.2).
```
```
First consider the derivatives in equation (3.7) with respect to the controls 𝑢0, . . . ,
```
```
𝑢𝑁−1. For the left-hand side of (3.7) we differentiate with respect to 𝑢𝑖 and get
```
𝜕𝐽
𝜕ᵆ𝑖=
𝜕
```
𝜕ᵆ𝑖(𝐺(𝑥𝑁 ) + 𝑔(𝑥0, 𝑢0) + ⋯ + 𝑔(𝑥𝑁−1, 𝑢𝑁−1))
```
```
= 𝜕𝑔𝜕ᵆ (𝑥𝑖, 𝑢𝑖).
```
for each 𝑖 = 0, 1, . . . , 𝑁 − 1.
```
For the right-hand side of equation (3.7), note that for the constraint functions 𝑓1,
```
. . . , 𝑓𝑁 , only the constraint 𝑓𝑖+1 depends on 𝑢𝑖, which is the control we operate to get
from 𝑥𝑖 to 𝑥𝑖+1. We have
𝜕
𝜕ᵆ𝑖𝑓𝑖+1 =
𝜕
```
𝜕ᵆ𝑖(𝑓(𝑥𝑖, 𝑢𝑖) − 𝑥𝑖+1) =
```
𝜕𝑓
```
𝜕ᵆ (𝑥𝑖, 𝑢𝑖),
```
```
so considering just the partial derivative with respect to 𝑢𝑖 in equation (3.7) we get
```
𝜕𝑔
```
𝜕ᵆ (𝑥𝑖, 𝑢𝑖) = 𝜆𝑖+1
```
𝜕𝑓
```
𝜕ᵆ (𝑥𝑖, 𝑢𝑖)
```
which we can solve to determine our control 𝑢𝑖 in terms of 𝑥𝑖 and 𝜆𝑖+1 for 𝑖 = 0, . . . ,
𝑁 −1. This can tell us how to operate our control in terms of state and costate variables.
```
Second, consider the derivatives in equation (3.7) with respect to the state variables
```
```
𝑥1, . . . , 𝑥𝑁 . For the left-hand side, differentiating equation (3.6) with respect to 𝑥𝑖 yields
```
𝜕𝐽
𝜕𝑥𝑖=
𝜕
```
𝜕𝑥𝑖(𝐺(𝑥𝑁 ) + ∑
```
𝑁−1
```
𝑖=0 𝑔(𝑥𝑖, 𝑢𝑖))
```
```
= 𝜕𝑔𝜕𝑥 (𝑥𝑖, 𝑢𝑖)
```
```
for each 𝑖 = 1, . . . , 𝑁 − 1. For the right-hand side of equation (3.7) note that for the
```
constraint functions 𝑓1, . . . , 𝑓𝑁 , only the constraints 𝑓𝑖 and 𝑓𝑖+1 depend on 𝑥𝑖, and so
we get
𝜕
𝜕𝑥𝑖𝑓𝑖 =
𝜕
```
𝜕𝑥𝑖(𝑓(𝑥𝑖−1, 𝑢𝑖−1) − 𝑥𝑖) = −1,
```
𝜕
𝜕𝑥𝑖𝑓𝑖+1 =
𝜕
```
𝜕𝑥𝑖(𝑓(𝑥𝑖, 𝑢𝑖) − 𝑥𝑖+1) =
```
𝜕𝑓
```
𝜕𝑥 (𝑥𝑖, 𝑢𝑖).
```
```
Considering just the partial derivative with respect to 𝑥𝑖 in equation (3.7) we have
```
𝜕𝑔
```
𝜕𝑥 (𝑥𝑖, 𝑢𝑖) = 𝜆𝑖+1
```
𝜕𝑓
```
𝜕𝑥 (𝑥𝑖, 𝑢𝑖) − 𝜆𝑖,
```
the solution of which would yield the recursion relation for 𝜆𝑖’s for 𝑖 = 0, . . . , 𝑁 − 1.
Exercises 45
```
Considering where 𝑥𝑁 appears in equation (3.7) and taking the derivative with
```
respect to 𝑥𝑁 yields
```
𝐺′(𝑥𝑁 ) = 𝜕𝜕𝑥𝑁 (𝑓(𝑥𝑁−1, 𝑢𝑁−1) − 𝑥𝑁 ) = −𝜆𝑁 .
```
This gives us one endpoint of the recursion, which we solve backwards to get the re-
maining values 𝜆𝑁−1, . . . , 𝜆0.
Third, using the endpoint conditions, we can then solve the recurrence relation-
```
ship for 𝑥𝑖’s (state variables) and 𝜆𝑖’s (costate variables) and together these will inform
```
us how to operate our control 𝑢𝑖.
This, in a nutshell, is the fundamental application of Pontryagin’s optimal principle
for the discrete case and sets the template for the technique in the chapters to come.
Keep in mind that this establishes necessary conditions for a control to be optimal.
When applying these techniques we still need to address whether the controls are local
maxima or minima and if the control is a global optimum.
While discrete dynamical systems are the most natural way to introduce these op-
timal control techniques, we will avoid going deeper into discrete systems and differ-
ence equations and move on to our main topic of continuous dynamics and differential
equations.
Key Points
In this chapter we used Lagrange multipliers to solve basic multistep discrete con-
trol problems, thereby working around the difficulty of compounding complexity pre-
sented in Chapter 1. We stated the method as Principle 0, with an outline proof.
This frames the basic concepts and format for solving optimal control problems.
Pontryagin’s technique sets up a costate space of Lagrange multipliers and imposes a
dynamic on these costates that must be satisfied in order for a control to be optimal.
This recasts a one-dimensional control problem in state space into a problem of explor-
ing trajectories in two-dimensional state-costate space.
Exercises
```
Exercise 3.1(s). Suppose you start at location 𝑥0 = 100 on the 𝑥-axis. You have four
```
turns, and at each turn you have the option of moving a distance 𝑢 to the left, making
```
your control dynamic 𝑥𝑖+1 = 𝑓(𝑥𝑖, 𝑢𝑖) = 𝑥𝑖 − 𝑢𝑖. On each move, you collect a payoff
```
```
of 𝑔(𝑥𝑖, 𝑢𝑖) = 𝑥𝑖 − 𝑢2𝑖 /2 dollars. At the end of four turns, you have to pay the bank 4𝑥4
```
dollars. So if you don’t move at all, you collect 100 dollars on each of four turns and
then pay the bank 400 dollars, for a break-even game. Can you make money at this
game? What is the optimal strategy?
```
Apply Principle 0 with 𝑓(𝑥, 𝑢) = 𝑥 − 𝑢, 𝑔(𝑥, 𝑢) = 𝑥 − 𝑢2/2, and 𝐺(𝑥) = −4𝑥. You
```
have 𝑥0 = 100 and 𝑁 = 4. Complete the following steps:
```
(a) Solve 𝜕𝑔𝜕ᵆ (𝑥𝑖, 𝑢𝑖) = 𝜆𝑖+1𝜕𝑓𝜕ᵆ (𝑥𝑖, 𝑢𝑖) to get 𝑢𝑖 in terms of 𝜆𝑖+1.
```
```
(b) Solve 𝜆𝑖 = 𝜆𝑖+1𝜕𝑓𝜕𝑥 (𝑥𝑖, 𝑢𝑖) − 𝜕𝑔𝜕𝑥 (𝑥𝑖, 𝑢𝑖) to get a recursion for 𝜆𝑖 in terms of 𝜆𝑖+1.
```
```
(c) Solve 𝜆𝑁 = 𝐺′(𝑥𝑁 ) to get a value for 𝜆4.
```
46 Chapter 3. Control: A Discrete Start
```
(d) Compute the resulting values for 𝜆1, . . . , 𝜆3, 𝑢0, . . . , 𝑢3, and 𝑥0, . . . , 𝑥4
```
```
(e) Compute the net payoff 𝐽 = 𝐺(𝑥4) + ∑3𝑖=0 𝑔(𝑥𝑖, 𝑢𝑖). Did you make money?
```
```
Exercise 3.2(s). Suppose you start at location 𝑥0 on the 𝑥-axis. You have 𝑁 moves, and
```
at each move you can multiply your position by an amount 𝑢 > 0 for a cost of 𝑥𝑢2. So
```
your control dynamic is 𝑓(𝑥𝑖, 𝑢𝑖) = 𝑥𝑖𝑢𝑖 and your running cost (as a negative payoff) is
```
```
𝑔(𝑥𝑖, 𝑢𝑖) = −𝑥𝑖𝑢2𝑖 . At the end of 𝑁 moves you collect 𝐺(𝑥𝑁 ) = 4𝑥𝑁 dollars. Find your
```
optimal strategy using Principle 0 with the following steps:
```
(a) Solve 𝜕𝑔𝜕ᵆ (𝑥𝑖, 𝑢𝑖) = 𝜆𝑖+1𝜕𝑓𝜕ᵆ (𝑥𝑖, 𝑢𝑖) to get 𝑢𝑖 in terms of 𝜆𝑖+1.
```
```
(b) Solve 𝜆𝑖 = 𝜆𝑖+1𝜕𝑓𝜕𝑥 (𝑥𝑖, 𝑢𝑖) − 𝜕𝑔𝜕𝑥 (𝑥𝑖, 𝑢𝑖) to get a recursion for 𝜆𝑖 in terms of 𝜆𝑖+1.
```
```
(c) Solve 𝜆𝑁 = 𝐺′(𝑥𝑁 ) to get a value for 𝜆𝑁 .
```
```
(d) For 𝑥0 = 1 and 𝑁 = 4 compute the values of 𝜆1, . . . , 𝜆4, 𝑢0, . . . , 𝑢3, and
```
𝑥0, . . . , 𝑥4
```
(e) Compute the resulting net payoff 𝐽 = 𝐺(𝑥4) + ∑3𝑖=0 𝑔(𝑥𝑖, 𝑢𝑖). Can you make
```
more money with larger or smaller 𝑁?
```
Exercise 3.3(h). Repeat Example 3.3 with 𝑁 = 100. That is, we have a process with
```
```
fixed end locations 𝑥0 = 0, 𝑥𝑁 = 100, control dynamic 𝑓(𝑥, 𝑢) = 𝑥 + 𝑢, and running
```
```
costs 𝑔(𝑥, 𝑢) = 𝑥 +𝑢2/2 with 𝑁 = 100 steps. Comment on anything unusual you notice
```
about your solution.
```
Exercise 3.4(s). Suppose you have a control dynamic 𝑓(𝑥, 𝑢) = 𝑥 + 𝑢, running costs
```
```
(negative values) of 𝑔(𝑥, 𝑢) = −(𝑥+𝑢)2, an end payoff of 𝐺(𝑥𝑁 ) = 100𝑥𝑁 , and a starting
```
value 𝑥0 > 0. Your optimal strategy is to first move from 𝑥0 to 𝑥1 = 0, then stay at 𝑥 = 0
until your last move, and then move to 𝑥𝑁 = 50. Apply Principle 0 to derive this result.
Exercise 3.5. In Exercise 1.2, we were moving a Bocce ball
```
𝑥𝑛+1 = 𝑓(𝑥𝑛, 𝑢𝑛) = 𝑥𝑛 + 𝑢𝑛
```
with endpoint conditions 𝑥0 = 0 and 𝑥𝑁 = 𝐵 for a given 𝐵 > 0, with running costs
```
𝑔(𝑢) = 𝑢2.
```
```
(a) Apply Principle 0 to justify our assumption that the optimal control is constant
```
𝑢0 = 𝑢1 = ⋯ = 𝑢𝑁 = 𝐵/𝑁.
```
(b) What is the optimal payoff 𝐽 as a function, 𝐽(𝐵, 𝑁), of ending location 𝐵 and
```
number of steps 𝑁? What happens to the cost as 𝑁 → ∞?
Exercise 3.6. Repeat Exercise 3.5 where the end location of the ball is not specified,
```
but at the end of 𝑁 moves you receive a payoff of √𝑥𝑁 dollars (as in Exercise 1.3). So
```
for a given 𝑁, the net payoff is
√𝑥𝑁 −
𝑁−1
∑
𝑛=0
𝑢2𝑛.
Exercises 47
```
We still have 𝑥0 = 0 and control dynamics are 𝑥𝑛+1 = 𝑓(𝑥𝑛, 𝑢𝑛) = 𝑥𝑛 + 𝑢𝑛.
```
```
(a) What is the optimal solution? What is the optimal payoff?
```
```
(b) Consider the payoff function 𝐽(𝐵, 𝑁) from Exercise 3.5. Show that the solution
```
```
to this exercise corresponds to a maximum of √𝐵 − 𝐽(𝐵, 𝑁).
```
Exercise 3.7. What would Principle 0 look like for higher dimensions? What if you
had two controls, maybe one for horizontal movement and one for vertical movement,
as in Exercise 1.4. What would you have to add to Principle 0 to have it apply to this
case?
4
First Principle
In developing Principle 0, we considered a controlled system defined by discrete time
dynamics, explored why these systems are difficult to optimize, and demonstrated how
the application of Lagrange multipliers simplifies the problem by creating a state-costate
system, with Principle 0 specifying conditions that must be satisfied by an optimal con-
trol.
Most control problems involve continuous systems that are modeled with differen-
tial equations, and these continuous time problems will be the main focus of our study.
Building on our understanding of discrete systems, this chapter introduces the foun-
dational ideas for continuous systems and introduces Principles I and II that extend
Principle 0 to continuous systems and represent a more complete statement of Pon-
tryagin’s principle. Principle I addresses autonomous systems and Principle II allows
for time dependence.
These principles all have a similar form: optimization imposes dynamics on a
structure of Lagrange multipliers, creating a state-costate dynamical system that de-
fines conditions necessary for a control to be optimal.
4.1 One Dimension, Fixed Ends
Consider the differential equation
```
𝑥′ = 𝑓(𝑥, 𝑢)
```
on a time interval 𝑡 ∈ [0, 𝑇] with boundary conditions
```
𝑥(0) = 𝐴 and 𝑥(𝑇) = 𝐵.
```
```
The variable 𝑢 is the control; it is a function of time, and we can select any function
```
𝑢 we want from a prescribed set 𝒰 of allowed controls. We must operate our control
to attain the given boundary conditions. From the set of allowed controls that attain
these endpoints, we want the one that optimizes
𝐽 = ∫
𝑇
0
```
𝑔(𝑥, 𝑢) 𝑑𝑡.
```
49
50 Chapter 4. First Principle
If this is a payoff, we want to maximize it, and if it is a cost, we want to minimize it.
These being equivalent problems, we will just speak of optimizing and refer to 𝐽 as the
performance.
Example 4.1: Integrator
```
Consider the simple controlled system 𝑥′ = 𝑢 with boundary conditions 𝑥(0) =
```
```
−1 and 𝑥(6) = 1 and we wish to find a control that minimizes cost
```
𝐽 = ∫
6
0
𝑥2 + 𝑢2 𝑑𝑡.
In other words,we want to move a point from position 𝑥 = −1 to position 𝑥 = 1
in 𝑇 = 6 time units, and we control the velocity of the point. The running cost
is the sum of the squares of position and velocity: it is expensive to be farther
away from 𝑥 = 0, and it is expensive to move quickly. We assume 𝑢 must be a
piecewise continuous function.
```
A constant velocity control with 𝑢 ≡ 1/3 creates trajectory 𝑥(𝑡) = 𝑡/3 − 1
```
```
(Figure 4.1) which satisfies the initial and endpoint conditions and would cost
```
```
(∗ check this ∗)
```
𝐽 = ∫
6
0
```
( 𝑡3 − 1)
```
2
- ( 13 )
2
𝑑𝑡 = 8/3 = 2.666 . . . .
Figure 4.1. State and control plotted against time, constant control.
It’s expensive to be farther away from zero, so maybe we should stay at 𝑥 = 0
```
for a little while (its free!). Perhaps move from 𝑥 = −1 to 𝑥 = 0 at constant speed
```
in two time units, then stay at 𝑥 = 0 for two time units, and move from 𝑥 = 0
```
to 𝑥 = 1 at constant speed in the last two time units (Figure 4.2). This would
```
```
cost 𝐽 = 7/3 = 2.333 . . . (∗ check this ∗), so we’ve improved our initial proposed
```
control.
4.1. One Dimension, Fixed Ends 51
Figure 4.2. State and control plotted against time, varying control.
There are many other ways we could operate our control to get from 𝑥 = −1
to 𝑥 = 1 in six time units. The question is, out of all such controls which one will
cost the very least?
Example 4.2: King Tiny’s Plan
King Tiny is the beloved king and absolute dictator of Tinyland, and the size of
the current economy of Tinyland, measured in dollars, is exactly one dollar. If the
King of Tinyland reinvests all of his domestic product back into capital stock, his
```
economy will grow by 20% per year: 𝑥′ = .2𝑥 (where 𝑥 is the size of the economy
```
```
in dollars). The King wants to take out an amount 𝑢 ≥ 0 (in dollars per day) and
```
allow his loyal subjects to consume it for their enjoyment, so his resulting growth
is 𝑥′ = .2𝑥 − 𝑢. Now, consumption is a funny thing: the more you consume the
less enjoyment you seem to get out of each additional unit of consumption, so
let’s say the Kingdom’s pleasure is measured as the concave downward function
√𝑢.
The King starts with an economy of one dollar and declares that he will dou-
```
ble it in ten years: 𝑥(0) = 1 and 𝑥(10) = 2. With 20% growth, he can easily do
```
this, with money to spare. How to best consume the spare money? The ques-
tion is, how can he meet his goal of doubling the economy while maximizing the
Kingdom’s pleasure
𝐽 = ∫
10
0
√𝑢 𝑑𝑡?
The following is our first version of Pontryagin’s maximal principle for continuous
systems and will help solve these two examples by setting differential conditions that
an optimal solution must satisfy.
52 Chapter 4. First Principle
OPTIMAL PRINCIPLE I
Local optimum, fixed duration, fixed endpoint, time independent, one dimension
Consider the controlled system
```
𝑥′ = 𝑓(𝑥, 𝑢), 𝑥, 𝑡 ∈ ℝ, 𝑢 ∈ 𝒰,
```
with fixed endpoint and end time conditions
```
𝑥(0) = 𝐴, 𝑥(𝑇) = 𝐵, 𝐴, 𝐵, 𝑇 given,
```
and objective function
𝐽 = ∫
𝑇
0
```
𝑔(𝑥, 𝑢) 𝑑𝑡.
```
Define the Hamiltonian
```
𝐻 = 𝐻(𝑥, 𝑢, 𝜆) = 𝑔(𝑥, 𝑢) + 𝜆𝑓(𝑥, 𝑢)
```
and the costate equation
```
𝜆′ = − 𝜕𝐻𝜕𝑥 (𝑥, 𝑢, 𝜆).
```
Then a locally optimal control 𝑢 must satisfy
𝜕𝐻
```
𝜕𝑢 (𝑥, 𝑢, 𝜆) = 0
```
and the optimal control 𝑢 that optimizes 𝐽 will optimize 𝐻 at all times.
Furthermore, 𝐻 is constant on optimal trajectories.
The principle is not at all intuitive, and the role of the costate variable is quite
mysterious at first, but it follows the ideas developed in the discrete case in Chapter 3.
We begin by working through some examples to build up intuition, and then we will
return to more abstract considerations of the principle.
This principle uses the first derivative, 𝜕𝐻𝜕ᵆ , to specify a locally optimal solution, or
the best among an open set of nearby controls in a set 𝒰 of allowable controls. This is
analogous to the first derivative test in calculus to find a local maximum or minimum
in the interior of an interval. We explore this concept more carefully in Section 4.3.3.
Some optimal control problems involve solutions at the very boundary of allowable
controls, as explored later in Chapter 10.
```
Note that an optimal control “will optimize 𝐻 at all times” (to maximize 𝐽 we max-
```
```
imize 𝐻, and to minimize 𝐽 we minimize 𝐻). Thus, to optimize an overall measure of
```
performance 𝐽, we must optimize 𝐻 at each instant. This transforms a problem of opti-
mizing a global measure 𝐽 in the state space defined by 𝑥, to optimizing a local measure
𝐻 in the state-costate space defined by 𝑥 and 𝜆. This is the power and beauty of Pon-
tryagin’s optimality principles. We can optimize globally in state space by optimizing
locally in state-costate space.
4.1. One Dimension, Fixed Ends 53
```
Finally, note that 𝐻 is constant on optimal trajectories; we can explore the set of
```
optimal trajectories by examining the level curves of 𝐻. This is analogous to the conser-
vation of energy in physical systems where the Hamiltonian represents the total energy
of the system. We return to this idea in Section 5.1
There is much here to unpack, but we will take it a step at a time. For now we
focus on applying the principle. Note how the steps for applying Principle I replicate
those of applying Principle 0 in Section 3.2.
Apply Principle I using the following steps:
```
• Identify your functions 𝑓(𝑥, 𝑢) and 𝑔(𝑥, 𝑢) and define the Hamiltonian
```
```
𝐻(𝑥, 𝑢, 𝜆).
```
```
• Find the value of 𝑢 that optimizes 𝐻(𝑥, 𝑢, 𝜆) (if we want to maximize 𝐽,
```
```
then we maximize 𝐻, and if we want to minimize 𝐽, we minimize 𝐻).
```
This defines our control 𝑢 in terms of of 𝑥 and 𝜆.
```
• Substitute this form of 𝑢 into state 𝑥′ = 𝑓(𝑥, 𝑢) and costate 𝜆′ =
```
```
− 𝜕𝐻𝜕𝑥 (𝑥, 𝑢, 𝜆) equations, yielding a system of two ordinary differential
```
equations.
```
• Endpoints 𝑥(0) = 𝐴, 𝑥(𝑇) = 𝐵 make a two-point boundary problem;
```
we want to resolve the two integration constants to match the initial and
terminal positions.
This methodology will lead to solutions in our Integrator and King Tiny examples.
Example 4.3: Integrator
```
We return to Example 4.1 and consider 𝑥′ = 𝑢 with 𝑥(0) = −1, 𝑥(6) = 1 where
```
we want to minimize
𝐽 = ∫
6
0
𝑥2 + 𝑢2 𝑑𝑡.
```
Applying Principle I with 𝑓(𝑥) = 𝑢 and 𝑔(𝑥) = 𝑥2 + 𝑢2, define
```
𝐻 = 𝑥2 + 𝑢2 + 𝜆𝑢.
Look for a control 𝑢 that minimizes 𝐻 by setting the derivative to zero:
0 = 𝜕𝐻𝜕𝑢 = 2𝑢 + 𝜆,
implying 𝑢 = −𝜆/2. Note that 𝜕2𝐻𝜕ᵆ2 = 2 > 0, making this a local minimum.
Our state and costate equations are
𝑥′ = 𝑢,
𝜆′ = −2𝑥.
54 Chapter 4. First Principle
Substituting 𝑢 = −𝜆/2, our state and costate differential equations are
𝑥′ = −𝜆/2,
𝜆′ = −2𝑥.
This represents an important step in analyzing optimal control problems:
we have reduced necessary conditions for optimality to an exercise in solving
```
differential equations. Working with differential equations is an important skill;
```
some differential equations can be solved readily by hand, while others are best
solved using computer algebra systems. Many differential equations simply do
not admit a closed form solution, and analysis relies on numerical techniques.
In this case we have a two-dimensional linear system. Techniques for solving
such systems are briefly reviewed in Appendix B.
```
We have a two-point boundary problem, 𝑥(0) = −1, 𝑥(6) = 1, and express
```
our system in matrix form as
```
(
```
𝑥
𝜆
```
)
```
′
= [
0 − 12
−2 0
```
] (
```
𝑥
𝜆
```
) .
```
```
With eigenvalues ±1 and eigenvectors (±1, 2) for the coefficient matrix, this sys-
```
tem has general solution
𝑥 = 𝐶1𝑒−𝑡 − 𝐶2𝑒𝑡,
𝜆 = 2𝐶1𝑒−𝑡 + 2𝐶2𝑒𝑡.
```
Resolving the integration constants 𝐶1, 𝐶2 with boundary conditions 𝑥(0) =
```
```
−1, 𝑥(6) = 1 yields
```
𝑥 = 𝑒
𝑡 − 𝑒6−𝑡
𝑒6 − 1 ,
𝜆 = −2 𝑒
𝑡 + 𝑒6−𝑡
𝑒6 − 1 ,
𝑢 = 𝑒
𝑡 + 𝑒6−𝑡
𝑒6 − 1 ,
```
with 𝑥(𝑡) and 𝑢(𝑡) plotted in Figure 4.3. This control carries a cost of
```
𝐽 = 2 𝑒
6 + 1
𝑒6 − 1 = 2.009 . . . .
This is the very best anyone can do.
Note that this control verifies the intuition of Example 4.1 that we want to
linger near 𝑥 = 0 where cost is low. But now we have the very best balance of
moving close to zero, slowing down there, and then moving on to our required
end value.
4.1. One Dimension, Fixed Ends 55
Figure 4.3. State and control plotted against time, optimal control.
Example 4.4: King Tiny’s Solution
```
King Tiny (Example 4.2) has 𝑥′ = 0.2 𝑥 − 𝑢 with 𝑥(0) = 1, 𝑥(10) = 2, and he
```
wants to maximize
𝐽 = ∫
10
0
√𝑢 𝑑𝑡.
Define
```
𝐻 = √𝑢 + 𝜆(0.2𝑥 − 𝑢).
```
Then
0 = 𝜕𝐻𝜕𝑢 = 1
2√𝑢
− 𝜆
```
implies 𝑢 = 1/(4𝜆2), and note that this is a local maximum since 𝜕2𝐻𝜕ᵆ2 < 0.
```
We get the costate equation 𝜆′ = − 𝜕𝐻𝜕𝑥 = −.2𝜆. Our state-costate system is
then
𝑥′ = 0.2𝑥 − 0.25𝜆−2,
𝜆′ = −0.2𝜆.
```
In this case we have a two-point boundary problem, 𝑥(0) = 1, 𝑥(10) = 2,
```
for a system of two first-order differential equations, one of which is nonlinear.
The second equation, 𝜆′ = −.2𝜆, has an exponential solution 𝜆 = 𝐶1𝑒−0.2𝑡, which
we substitute into the first equation to obtain 𝑥′ = 0.2𝑥 − 0.25𝐶−21 𝑒0.4𝑡. This is a
first-order linear equation that we can solve by hand using an integrating factor,
```
or using a computer algebra system, to get general solution (∗ verify ∗)
```
```
𝑥(𝑡) = −1.25 𝐶−21 𝑒0.4𝑡 + 𝐶2𝑒0.2𝑡.
```
56 Chapter 4. First Principle
```
Resolving the integration constants 𝐶1, 𝐶2 with boundary conditions 𝑥(0) = 1
```
```
and 𝑥(10) = 2 yields (∗ check this ∗)
```
```
𝑥 = (−0.114 . . . ) 𝑒.4𝑡 + (1.114 . . . ) 𝑒.2𝑡,
```
```
𝜆 = (3.309 . . . ) 𝑒−0.2𝑡,
```
```
𝑢 = (0.023 . . . ) 𝑒0.4𝑡
```
with performance 𝐽 = 4.827 . . . .
Figure 4.4. Capital and optimal consumption plotted against time.
In Figure 4.4 we see this solution overshoots the end goal of doubling the
economy, spending down the excess towards the end of the time period with a
level of spending that would be unsustainable in the longer run. This is the solu-
tion to the problem as stated, but it may differ from the expectations or intentions
of those formulating the problem. This is not uncommon in optimal control the-
ory.
The Hamiltonian 𝐻 has a constant value on these optimal trajectories, a fea-
ture that we will explore more carefully in Section 5.1 and Example 5.3.
4.2. Time Dependence 57
4.2 Time Dependence
Principle I readily generalizes to systems that explicitly depend on time 𝑡. A statement
of the optimal principle that allows for time dependence is:
OPTIMAL PRINCIPLE II
Local optimum, fixed duration, fixed endpoint, time dependent, one dimension
Consider the controlled system
```
𝑥′ = 𝑓(𝑥, 𝑢, 𝑡), 𝑥, 𝑡 ∈ ℝ, 𝑢 ∈ 𝒰,
```
with fixed endpoint and end time conditions
```
𝑥(0) = 𝐴, 𝑥(𝑇) = 𝐵, 𝐴, 𝐵, 𝑇 given,
```
and objective function
𝐽 = ∫
𝑇
0
```
𝑔(𝑥, 𝑢, 𝑡) 𝑑𝑡.
```
Define the Hamiltonian
```
𝐻(𝑥, 𝑢, 𝑡, 𝜆) = 𝑔(𝑥, 𝑢, 𝑡) + 𝜆𝑓(𝑥, 𝑢, 𝑡)
```
and the costate equation
```
𝜆′ = − 𝜕𝐻𝜕𝑥 (𝑥, 𝑢, 𝑡, 𝜆).
```
Then a locally optimal control 𝑢 must satisfy
𝜕𝐻
```
𝜕𝑢 (𝑥, 𝑢, 𝑡, 𝜆) = 0
```
and the control 𝑢 that optimizes 𝐽 will optimize 𝐻 at all times.
Furthermore, if 𝑓 and 𝑔 are independent of time 𝑡, then 𝐻 is constant on op-
timal trajectories.
Note that if 𝑓 and 𝑔 are dependent on time, we can no longer conclude that 𝐻 is
constant on trajectories.
Example 4.5: King Tiny with a Discount
```
King Tiny (Example 4.4) faced a very unhappy constituency with his plan. Spend-
```
ing money on fun stuff started at a measly 2.3 cents per year and didn’t increase
much for several years. The people did not want to wait that long and really start
getting their groove on. So King Tiny decides to discount the future enjoyment a
rate of 5% per year.
Our system remains
𝑥′ = .2𝑥 − 𝑢
but the payoff is now
𝐽 = ∫
10
0
𝑒−.05𝑡√𝑢 𝑑𝑡.
```
We still have fixed boundary requirements 𝑇 = 10, 𝑥(0) = 1, and 𝑥(10) = 2.
```
58 Chapter 4. First Principle
Our Hamiltonian is
```
𝐻 = 𝑒−.05𝑡√𝑢 + 𝜆(.2𝑥 − 𝑢)
```
and setting
0 = 𝜕𝐻𝜕𝑢 = 12 𝑢−1/2𝑒−.05𝑡 − 𝜆
yields
𝑢 = 14 𝜆−2𝑒−0.1 𝑡.
This is a local maximum as 𝜕2𝐻𝜕ᵆ2 < 0.
Thus we have the state-costate system
𝑥′ = .2𝑥 − .25𝜆−2𝑒−.1 𝑡,
𝜆′ = −.2𝜆.
```
Solving this with boundary conditions 𝑥(0) = 1 and 𝑥(10) = 2 (using steps
```
```
as used in Example 4.4) yields (∗ verify this ∗)
```
```
𝑥 = (1.425 . . . ) 𝑒.2𝑡 − (0.424 . . . ) 𝑒.3𝑡,
```
```
𝜆 = (2.427 . . . ) 𝑒−.2𝑡,
```
```
𝑢 = (0.042 . . . ) 𝑒.3𝑡
```
with a net payoff of 𝐽 = 3.540 . . . .
Figure 4.5. Capital and optimal consumption plotted against
```
time, discounted future (solid) and nondiscounted (dashed).
```
```
Note the contrast in Figure 4.5 between the discounted solution (solid lines)
```
```
and nondiscounted (dashed lines): more consumption early on, less consump-
```
tion later, and a lower peak of maximum capital. King Tiny has nearly doubled
the initial enjoyment of his people, from 2.3 cents per year to 4.2 cents per year.
The original plan had consumption growing at 40% per year, whereas this plan
4.3. Can We Solve It? 59
has consumption growing at 30% per year, so discounting the future by 5% cost
10 percentage points off of annual growth of consumption.
Substituting the solutions into the Hamiltonian and simplifying would lead
to
```
𝐻 = (0.6914 . . . ) − (0.1030 . . . ) 𝑒.1𝑡
```
which is not constant on optimal trajectories.
4.3 Can We Solve It?
Not all optimal control problems have solutions. There are several ways that things
can go wrong. First off, the problem has to be clearly formulated. For our purposes,
we will always assume the dynamics of the problem are modeled by a well-defined
```
function 𝑓(𝑥, 𝑢, 𝑡) which is differentiable (or at least continuous) in all its variables.
```
This allows us to employ the theorems of existence and uniqueness from differential
equations.
Solving an optimal control problem starts with affirming that the problem is clearly
formulated, that the endpoint conditions can be attained with allowed controls, and
that we expect that the set of allowed controls 𝒰 contains an optimal control.
4.3.1 Attainability. In some cases the structure of the stated problem precludes
any solution, optimal or not. For example, if 𝑥′ = 𝑢2, then we cannot satisfy boundary
```
conditions 𝑥(0) = 1 and 𝑥(1) = −1 (∗ why not? ∗).
```
We often have restrictions on our control. For example, we may require 𝑢 ≥ 0 or
maybe |𝑢| ≤ 1. If 𝑥′ = 𝑢 with |𝑢| ≤ 1, then we cannot satisfy boundary conditions
```
𝑥(0) = 0 and 𝑥(1) = 2 (∗ why not? ∗).
```
Specified boundary conditions are attainable if there is some allowed control 𝑢 ∈
𝒰 that can match those boundary conditions. We need attainable solutions before we
can begin to optimize.
Example 4.6: King Tiny’s Restrictions
```
King Tiny (Example 4.4) has 𝑥′ = .2𝑥 − 𝑢 and must have 𝑢 ≥ 0; otherwise he
```
would be taking money away from people and they do not like that at all. Suppose
```
that instead of doubling the economy in ten years, he would like 𝑥(10) = 𝐵.
```
```
Starting with 𝑥(0) = 1, which values of 𝐵 would be attainable?
```
```
With 𝑥′ = .2𝑥 − 𝑢 ≤ .2𝑥, the maximum value for 𝑥(10) would be attained by
```
```
a constant 𝑢 = 0 yielding 𝑥(10) = 𝑒2 and so he can only attain 𝐵 ≤ 𝑒2 = 7.389 . . . .
```
Note that, as formulated, there is no prohibition on King Tiny attaining neg-
```
ative values for his economy 𝑥, whatever that might mean (bankruptcy?). We can
```
```
attain any 𝐵 ≤ 𝑒2 and this includes negative values. For example 𝑥(10) = −1,000
```
can be attained by a constant 𝑢 = 31.53 . . . . It is important that the formulation
of a problem matches all real-world constraints and expectations of the problem.
60 Chapter 4. First Principle
Example 4.7: Integrator
```
For 𝑥′ = 𝑢 with |𝑢| ≤ 1, what values for 𝐴 and 𝐵 are attainable with 𝑥(0) = 𝐴,
```
```
𝑥(𝑇) = 𝐵 given a fixed time 𝑇?
```
```
We have −1 ≤ 𝑥′ ≤ 1, and so with 𝑥(0) = 𝐴 we have
```
```
𝐴 − 𝑡 ≤ 𝑥(𝑡) ≤ 𝐴 + 𝑡.
```
```
For a given 𝑇 and 𝑥(𝑇) = 𝐵, the attainable values of 𝐴 and 𝐵 are characterized by
```
𝐴 − 𝑇 ≤ 𝐵 ≤ 𝐴 + 𝑇 or |𝐴 − 𝐵| ≤ 𝑇.
4.3.2 Sequences Going Nowhere. Endpoint conditions might be attainable
given a set of allowable controls 𝒰, but an optimal solution may not exist in 𝒰. There
could be a sequence of allowed controls where each subsequent control has better per-
formance, but the sequence has a limit that is not in the set 𝒰 of allowed controls.
Example 4.8: Bitter Medicine
You have to drink a bottle of medicine within a one-hour period, and it tastes
```
really bad. The amount of medicine in the bottle at time 𝑡 is 𝑥(𝑡) and we require
```
```
𝑥(0) = 1 and 𝑥(1) = 0. You drink it at rate 𝑢 so 𝑥′ = −𝑢, and your gastrointestinal
```
fortitude is such that we may assume 𝑢 ≥ 0. Your displeasure at drinking this
stuff is modeled by the concave downward function √𝑢 to capture the saturation
```
effect: drinking it twice as fast isn’t quite twice as bad. Your total displeasure is
```
then 𝐽 = ∫10 √𝑢 𝑑𝑡, which you want to minimize. Suppose you consume it as
```
𝑢𝜅(𝑡) = {
```
1
𝜅 for 0 ≤ 𝑡 < 𝜅,
0 for 𝜅 ≤ 𝑡 ≤ 1
for 0 < 𝜅 ≤ 1, where lower values of 𝜅 means you drink the medicine more
quickly.
```
This satisfies the boundary conditions 𝑥(0) = 1 and 𝑥(1) = 0 and has
```
𝐽 = ∫
𝜅
0
√1/𝜅 𝑑𝑡 = √𝜅.
Taking the medicine quickly is better, and in fact 𝐽 → 0 as 𝜅 → 0. So there are
allowable solutions with your displeasure as close to zero as you want.
However, if we assume 𝑢 is a piecewise continuous function, then there are
no allowable solutions with zero displeasure: to consume the bottle, you need
```
∫10 𝑢 𝑑𝑡 = 1 which implies that 𝑢 is positive on some open interval (or more
```
```
generally, some positive measure set), which forces some displeasure ∫10 √𝑢 𝑑𝑡
```
> 0.
4.3. Can We Solve It? 61
```
The reader may be familiar with the Dirac delta function, 𝛿(𝑡), a rather ab-
```
stract concept from real analysis which places a unit mass at 𝑡 = 0 and is zero
everywhere else. This can be thought of as a formal limit of the functions 𝑢𝜅 as
𝜅 → 0, and it would represent taking the medicine instantly all at once. So if our
set of allowable controls contains Dirac delta functions, we actually can attain
zero displeasure.
In the previous example, we minimized displeasure by drinking the medicine as
quickly as possible. The following example demonstrates the opposite effect when you
want to maximize enjoyment.
Example 4.9: Spending Money
You have $100 to spend in 𝑇 time units. Suppose that if you spend at a rate 𝑢,
your enjoyment is modeled by
𝐽 = ∫
𝑇
0
√𝑢 𝑑𝑡.
```
Here again we use the concave downwards function 𝑔(𝑢) = √𝑢 to reflect the
```
diminishing returns of higher consumption rates.
```
Let 𝑥(𝑡) be the amount of money you have at time 𝑡, so 𝑥(0) = 100 and 𝑥′ =
```
```
−𝑢 where you control the spending rate 𝑢(𝑡). It stands to reason that we will want
```
```
to spend all the money, so take 𝑥(𝑇) = 0.
```
```
Using Principle I, we can conclude that 𝑢 will be a constant (see Exercise
```
```
4.11). Matching the endpoints yields 𝑢(𝑡) = 100/𝑇, 𝑥(𝑡) = 100(1 − 𝑡/𝑇), and
```
𝐽 = 10√𝑇.
What happens as we are given more and more time to spend our $100? Say,
𝑇 → ∞? For one thing we would have 𝐽 → ∞. However, our spending rate
would go to zero 𝑢 → 0. So in the limit it seems we would spend nothing and
be overjoyed. But this doesn’t work, as in the limit we have 𝑢 ≡ 0 making 𝐽 =
∫∞0 0 𝑑𝑡 = 0.
4.3.3 Topology and Existence. In calculus, we know that a continuous function
```
𝑓(𝑥) over a closed and bounded interval [𝑎, 𝑏] must attain a maximum and a minimum
```
value. For a differentiable function such an extreme value must be attained at a point in
the interior of the interval where the derivative is zero or at an endpoint of the interval.
Real analysis extends the concepts of “interior”, “closed and bounded”, and “local”
to sets that are more abstract than intervals on the real line. It is beyond the scope of
this text to take a deep dive into these real analytic concepts, but we briefly touch upon
the ideas in this section for the benefit of those who have studied real analysis and to
whet the appetite of those who may do so in the near future.
62 Chapter 4. First Principle
We have a collection of allowable controls 𝒰, and we need some idea of when
two controls are near one another. Since our concern is performance measured by an
integral, a natural approach would be the 𝐿1 metric, which says that two controls 𝑢1
and 𝑢2 on an interval 𝐼 are within 𝜖 > 0 of each other if
∫
𝐼
```
|𝑢1(𝑡) − 𝑢2(𝑡)| 𝑑𝑡 < 𝜖.
```
We could also use the more intuitive 𝐶0 metric, which states that two functions are 𝜖
close if
```
max𝑡∈𝐼 |𝑢1(𝑡) − 𝑢2(𝑡)| < 𝜖.
```
For a bounded interval 𝐼, if two functions are close in the 𝐶0 metric, they must be close
in the 𝐿1 metric. The converse is not true, so 𝐶0 induces a stronger topology. We’ll
simplify things later on by using the stronger 𝐶0 metric in our proofs, but keep in mind
that the 𝐿1 metric is more natural for the theory.
A control 𝑢 is in the interior of the allowable set of controls 𝒰 if for some 𝜖 > 0,
every control within 𝜖 of 𝑢 is also in 𝒰. So a control 𝑢 is locally optimal if it is in the
interior of the allowable set 𝒰 and there is an 𝜖 > 0 such that no other control within 𝜖 of
𝑢 in 𝒰 can do better. This concept is central to Euler’s method for proving Pontryagin’s
```
principles (see Section 6.3 for a proof of Principle III).
```
It is entirely possible that the endpoint conditions are attainable in the set 𝒰, but
there are no locally optimal solutions in 𝒰. This can arise in a way similar to the max-
imum of a function being at the boundary of an open interval, like looking for the
maximum of 𝑦 = 𝑥2 over the interval 0 < 𝑥 < 1: there are points inside the interval
that produce higher and higher values of the function, but no point in the open interval
produces a maximum. The Bitter Medicine and Spending Money examples in the pre-
vious section show sequences of increasingly better controls that fail to converge to an
allowable control, and they are cases where the set 𝒰 was not closed in the 𝐿1 topology
and 𝒰 does not contain the limits of convergent sequences.
Fortunately, the calculus ideas for the existence of a maximum or minimum extend
to functional spaces in optimal control. The abstract formulation for knowing that a
solution exists is:
If the set 𝒰 is closed and bounded in the 𝐿1 topology and if the endpoint
conditions are attainable in 𝒰, then 𝒰 must contain a solution to the opti-
mization problem. This solution must be either a locally optimal solution
in the interior of 𝒰 or a solution on the boundary of 𝒰.
These real analysis considerations are essential for a deeper understanding of this
material, but we will avoid wading too deep into the abstract underpinnings, so don’t
```
worry (too much) if this is all feeling a bit esoteric.
```
For now, we will focus on techniques to find locally optimal controls in the interior
of the allowable set. Principles I–VI will be stated in terms of finding necessary condi-
tions for a locally optimal control in the interior of 𝒰. With Principle VII in Chapter
10 we consider controls at the boundary of the allowable set 𝒰.
Exercises 63
The control theory literature contains a variety of more specific theorems that ad-
dress specific conditions and contexts that guarantee the existence of a globally opti-
mum solution. For a broader and more in-depth treatment of sufficiency theorems, see
[9, 23, 24].
Key Points
In this chapter we introduced the basic Pontryagin technique presented as Principles
I and II. This establishes necessary conditions for a control to be optimal in a one-
```
dimensional system 𝑥′ = 𝑓(𝑥, 𝑢) with fixed boundaries and time period 𝑥(0) = 𝐴,
```
```
𝑥(𝑇) = 𝐵 and performance function 𝐽 = ∫𝑇0 𝑔(𝑥, 𝑢) 𝑑𝑡. Following the structure pre-
```
sented in Chapter 3 for the discrete case, we solve this one-dimensional problem by
examining a two-dimensional state-costate system of differential equations formed by
introducing dynamic Lagrange multipliers and solving a two-point boundary problem.
The steps for applying Principles I and II are:
• Determine whether Principle I or II applies, and identify 𝑓, 𝑔, 𝐴, 𝐵, 𝑇, and 𝐽.
• Construct the Hamiltonian, 𝐻. Solve for the optimal 𝑢 in terms of 𝜆 and 𝑥, and
verify if maximizing or minimizing is appropriate.
• Substitute the optimal 𝑢 to construct the state-costate system of ODEs. Solve the
system to match the boundary values.
• Reflect and conclude.
Locally optimal controls must be critical points of the Hamiltonian function, and
in fact optimize the Hamiltonian at all times. The Hamiltonian is constant on optimal
solutions in the time-independent case.
We extended the technique to time-dependent systems, such as allowing for dis-
```
counted future payoffs; note that the Hamiltonian may no longer be constant on opti-
```
mal trajectories.
We examined questions of attainability and explored cases where an optimal con-
trol does not exist by taking a real analytic view of our set of controls.
These are the foundational elements of optimal control in continuous systems,
examined in their most basic form, and they set the format of methods in subsequent
chapters.
Exercises
```
Exercise 4.1(s). Maximize ∫10 √𝑢 𝑑𝑡 for the system 𝑥′ = 𝑢−𝑥 with 𝑢 ≥ 0 and endpoint
```
```
conditions 𝑥(0) = 0 and 𝑥(1) = 1.
```
```
Exercise 4.2(s). Consider 𝑥′ = 𝑥 + 𝑢 with 𝑢 > 0. Maximize ∫10 ln 𝑢 𝑑𝑡 for 𝑥(0) = 1
```
```
and 𝑥(1) = 3.
```
```
Exercise 4.3(s). Minimize ∫10 (𝑥 + 𝑢) 𝑑𝑡 for the system 𝑥′ = ln(𝑢) with 𝑥(0) = 1 and
```
```
𝑥(1) = 2 ln(2). Plug your solutions back into 𝐻 and show that 𝐻 is a constant.
```
64 Chapter 4. First Principle
```
Exercise 4.4(s). Minimize ∫20 𝑢𝑡 𝑑𝑡 for the system 𝑥′ = 𝑢2, 𝑢 ≥ 0, with 𝑥(0) = 1 and
```
```
𝑥(2) = 9. Plug your solutions back into 𝐻 and show that 𝐻 is a not constant.
```
```
Exercise 4.5(s). Minimize ∫10 𝑒2𝑡𝑢2 𝑑𝑡 subject to 𝑥′ = 𝑢, 𝑥(0) = 0, 𝑥(1) = 𝐵. Plug your
```
solutions back into 𝐻 and show that 𝐻 is not a constant.
```
Exercise 4.6(s). Consider the controlled system 𝑥′ = 𝑥 + 𝑢 with 𝑥(0) = 1.
```
```
(a) What values for 𝐵 are attainable as 𝑥(1) = 𝐵 assuming 𝑢 ≥ 0?
```
```
(b) What values for 𝐵 are attainable as 𝑥(1) = 𝐵 assuming |𝑢| ≤ 1?
```
```
Exercise 4.7(s). Consider the controlled system 𝑥′ = 𝑥 + 𝑢 (as in Exercise 4.2) with
```
```
𝑥(0) = 𝐴 and 𝑥(1) = 𝐵.
```
```
(a) If we require 𝑢 > 0, what pairs of endpoint values 𝐴, 𝐵, with 𝐴 ≥ 0 and 𝐵 ≥ 0,
```
are possible?
```
(b) Compute the solution that maximizes ∫10 ln 𝑢 𝑑𝑡 for allowed pairs 𝐴, 𝐵.
```
Exercise 4.8. Suppose you want to minimize 𝐽 = ∫10 𝑥 𝑢 𝑑𝑡 with 𝑥′ = 𝑢2, endpoints
```
𝑥(0) = 0, 𝑥(1) = 1, and 𝑢 ≥ 0. Verify that the control
```
```
𝑢(𝑡) = {1/√𝜅 for 0 ≤ 𝑡 < 𝜅,0 for 𝜅 ≤ 𝑡 ≤ 1
```
will satisfy the endpoint conditions on 𝑥 for 0 < 𝜅 < 1. Show that 𝐽 → 0 as 𝜅 → 0.
Argue that there is no control 𝑢 ≥ 0 that will satisfy the endpoint conditions and have
𝐽 = 0.
```
Exercise 4.9. In the Bitter Medicine case (Example 4.8), the solution is to drink the
```
```
medicine instantly all at once. Evaluate the same example with 𝐽 = ∫10 𝑔(𝑢) 𝑑𝑡 and the
```
following payoff functions. In which cases would you still want to drink the medicine
as quickly as possible?
```
(a) 𝑔(𝑢) = log(1 + 𝑢).
```
```
(b) 𝑔(𝑢) = 𝑢.
```
```
(c) 𝑔(𝑢) = 𝑢2.
```
```
Exercise 4.10. In the Bitter Medicine case (Example 4.8), the solution is to drink the
```
medicine instantly all at once, but it really doesn’t matter when you do that. Argue that
in the case where you discount the future 𝐽 = ∫10 𝑒−𝛼𝑡√𝑢 𝑑𝑡 for 𝛼 > 0, you would wait
for the last possible moment to down the stuff.
```
Exercise 4.11(h). Consider the Spending Money case (Example 4.9) where we have
```
```
𝑥′ = −𝑢 with 𝑥(0) = 100 and 𝑥(𝑇) = 0 and we want to maximize 𝐽 = ∫𝑇0 √𝑢 𝑑𝑡.
```
```
(a) Verify that the optimal solution would have 𝑢 as a constant and derive 𝐽 =
```
10√𝑇.
Exercises 65
```
(b) Suppose that instead of the square root function we want to maximize 𝐽 =
```
```
∫𝑇0 ln(1 + 𝑢)𝑑𝑡. Show that 𝑢 would still be a constant. Would 𝐽 → ∞ as 𝑇 → ∞?
```
```
(c) Suppose that 𝑔(𝑢) ≥ 0 is any concave downwards function defined on 0 ≤
```
```
𝑢 < ∞ with continuous second derivative and 𝑔(0) = 0, and suppose that you want to
```
```
maximize 𝐽 = ∫𝑇0 𝑔(𝑢) 𝑑𝑡. Show that 𝑢 must be a constant to maximize 𝐽.
```
```
(d) Would it be possible to have a function 𝑔 satisfying conditions from part (c)
```
that would make 𝐽 → 0 as 𝑇 → ∞? What can you say about the limit of 𝐽 as 𝑇 → ∞?
```
Exercise 4.12(s). Suppose that King Tiny (Example 4.4) decides to use a linear func-
```
tion to model his constituent’s pleasure: it is twice as much fun to spend twice as much
money. So overall fun is now measured as
𝐽 = ∫
10
0
𝑢 𝑑𝑡
```
which he wants to maximize with 𝑥(0) = 1, 𝑥(10) = 2, and 𝑥′ = .2𝑥 − 𝑢. He plans to
```
do this by saving all the money until towards the end of the ten-year period and then
having a huge blow-out party.
```
Suppose that for some value 𝑝, with 0 ≤ 𝑝 < 10, King Tiny takes 𝑢𝑝(𝑡) = 0 for
```
```
0 < 𝑡 < 𝑝 and 𝑢𝑝(𝑡) = 𝑢party for 𝑝 ≤ 𝑡 < 10.
```
```
(a) Find the value of 𝑢party that will match the end condition 𝑥(10) = 2.
```
```
(b) Compute the payoff 𝐽(𝑝) as a function of 𝑝.
```
```
(c) Show that 𝐽(𝑝) is increasing with 𝐽(𝑝) → (𝑒2 − 2) as 𝑝 → 10.
```
This exercise demonstrates how economic models can fall apart without the satu-
ration effect of a concave utility function.
```
Exercise 4.13(hs). In Example 4.1 we improved our initial proposed solution by spend-
```
ing time at 𝑥 = 0. Expand on this idea as follows.
For 𝐾 ≥ 1/3 consider the control
```
𝑢(𝑡) =
```
⎧
⎨
⎩
𝐾 for 0 ≤ 𝑡 < 1𝐾 ,
0 for 13 ≤ 𝑡 < 6 − 1𝐾 ,
𝐾 for 6 − 1𝐾 ≤ 𝑡 ≤ 6.
```
(a) Show that this control will match the endpoint conditions for any value 𝐾 ≥
```
1/3. What would the resulting plots of 𝑥 and 𝑢 look like?
```
(b) Compute 𝐽 as a function of 𝐾. Show that 𝐽 → ∞ as 𝐾 → ∞.
```
This shows that 𝐽 can be made arbitrarily large, and so if we wanted to maximize
instead of minimize, there would be no solution.
```
Exercise 4.14. What if King Tiny (Examples 4.2 and 4.4) were replaced by his evil twin,
```
```
who wanted to minimize the enjoyment of his subjects? What could he do? (Assume
```
```
you’d still have 𝑥(0) = 1, 𝑥(10) = 2, and 𝑢 ≥ 0.)
```
66 Chapter 4. First Principle
```
Exercise 4.15(hs). This is a simplified economic model for life-cycle savings.
```
An individual has a predetermined lifespan of 𝑇 years, earns fixed wages 𝑤, and
has access to an interest rate 𝑟 for savings. The individual increases their net worth by
working and receiving interest on savings and decreases their net worth by spending.
The individual’s net worth is modeled by
𝑥′ = 𝑤 + 𝑟𝑥 − 𝑢
where 𝑢 is the consumption.
```
Modeling the utility of consumption by the concave downwards function ln(𝑢) to
```
reflect diminished returns of higher levels of consumption, we posit that the individual
wants to maximize
𝐽 = ∫
𝑇
0
```
ln(𝑢) 𝑑𝑡
```
```
over a lifetime of fixed length 𝑇. Assuming no inheritance or bequests, 𝑥(0) = 𝑥(𝑇)
```
= 0.
These are quite simplified assumptions, but it makes an interesting basic model.
```
(a) Solve for optimal consumption.
```
```
(b) Show that consumption increases in time, with consumption less than wages,
```
𝑢 < 𝑤, for early life and consumption greater than wages, 𝑢 > 𝑤, for later life.
5
Unpacking Pontryagin
Pontryagin’s principle is a huge idea. There is much to unpack. Chapters 1–3 laid out
the basic framework of the principle in the discrete case, and Chapter 4 stated the more
complete principles for the continuous case.
In this chapter we fill out our understanding of the continuous case by exploring
three topics: how optimization creates a Hamiltonian system, the fundamental Princi-
ple of Optimality, and the nature of costates. We then conclude with an illuminating
example applying control techniques to a geometric optimization problem.
5.1 Hamilton and Pontryagin
In the last chapter we stated that the Hamiltonian is conserved on optimal trajectories
```
for an autonomous (time-independent) system. In fact, a distinguishing property of
```
an optimal control is that it makes the state-costate system into what is known as a
Hamiltonian system.
```
5.1.1 Hamiltonian Systems. Given a differentiable function 𝐻(𝑥, 𝑦), consider
```
the system of two ODEs:
```
𝑥′(𝑡) = 𝜕𝐻𝜕𝑦 (𝑥, 𝑦),
```
```
𝑦′(𝑡) = − 𝜕𝐻𝜕𝑥 (𝑥, 𝑦).
```
```
Then any solution (𝑥(𝑡), 𝑦(𝑡)) of this system will induce a constant value for
```
```
𝐻(𝑥(𝑡), 𝑦(𝑡)):
```
𝑑
𝑑𝑡 𝐻 =
𝜕𝐻
𝜕𝑥 𝑥′ +
𝜕𝐻
𝜕𝑦 𝑦′ =
𝜕𝐻
𝜕𝑥
𝜕𝐻
𝜕𝑦 −
𝜕𝐻
𝜕𝑦
𝜕𝐻
𝜕𝑥 = 0.
Thus trajectories of this system are level curves for 𝐻. Systems with this property are
Hamiltonian systems, and the function 𝐻 is the Hamiltonian.
67
68 Chapter 5. Unpacking Pontryagin
```
The more general form of a Hamiltonian system for 𝐱 = (𝑥1, . . . , 𝑥𝑛), 𝐲 = (𝑦1, . . . , 𝑦𝑛)
```
is
```
𝑥′𝑖 = 𝜕𝐻𝜕𝑦𝑖(𝐱, 𝐲),
```
```
𝑦′𝑖 = − 𝜕𝐻𝜕𝑥𝑖(𝐱, 𝐲).
```
This concept is used extensively in physics and dynamical systems and is closely re-
lated to the Hamiltonian idea in Section 2.10. The following are examples based on
conservation of energy.
Example 5.1
In the harmonic oscillator or mass-spring system 𝑥″ = −𝑥 we have position 𝑥
with velocity 𝑦 = 𝑥′ and acceleration 𝑦′ = −𝑥. This is a Hamiltonian system
with energy as the Hamiltonian function 𝐻 = 12 𝑦2 + 12 𝑥2:
```
𝑥′ = 𝜕𝐻𝜕𝑦 (𝑥, 𝑦) = 𝑦,
```
```
𝑦′ = − 𝜕𝐻𝜕𝑥 (𝑥, 𝑦) = −𝑥,
```
and we note that 𝐻 is conserved by this system:
𝑑
𝑑𝑡 𝐻 =
𝜕𝐻
𝜕𝑥 𝑥′ +
𝜕𝐻
𝜕𝑦 𝑦′
```
= (𝑥)(𝑦) + (𝑦)(−𝑥)
```
= 0.
Example 5.2
A pendulum of mass 𝑚 on a rod of length 𝑟 is at rest when 𝜃 = 0. The potential
```
energy is 𝑃 = 𝑚𝑔𝑟(1 − cos 𝜃) and the kinetic energy is 𝐾 = 12 𝑚𝑟 (𝜃′)2. Taking
```
angular velocity 𝑦 = 𝜃′ and using total energy as the Hamiltonian,
```
𝐸 = 𝑃 + 𝐾 = 𝑚𝑔𝑟(1 − cos 𝜃) + 12 𝑚𝑟𝑦2,
```
we can derive the equations of motion for the pendulum:
𝜃′ = 𝜕𝐸𝜕𝑦 = 𝑚𝑟𝑦,
𝑦′ = − 𝜕𝐸𝜕𝜃 = −𝑚𝑔𝑟 sin 𝜃.
These are standard examples of basic conservative systems. Readers unfamiliar
with these examples may wish to look them up.
5.1.2 Pontryagin’s Hamiltonian. Principle I applies to autonomous cases where
```
𝑓 and 𝑔 are independent of time; they are functions only of state and control. This leads
```
to the conclusion that 𝐻 is constant on optimal trajectories, as follows.
5.1. Hamilton and Pontryagin 69
The state and costate equations are
𝑥′ = 𝜕𝐻𝜕𝜆 ,
𝜆′ = − 𝜕𝐻𝜕𝑥 .
This kind of looks like a Hamiltonian system, but not quite, because 𝐻 has 𝑢 as an
```
additional independent variable: 𝐻(𝑥, 𝜆, 𝑢). The magic here is that the choosing of 𝑢
```
in terms of 𝑥 and 𝜆 to make 𝜕𝐻𝜕ᵆ = 0 creates the Hamiltonian system.
```
Take 𝑢(𝑥, 𝜆) as our solution for 𝜕𝐻𝜕ᵆ = 0 and consider
```
```
˜𝐻(𝑥, 𝜆) = 𝐻(𝑥, 𝜆, 𝑢(𝑥, 𝜆)).
```
Pay attention to the scope of the derivatives in the following. Note the difference in
the derivative of a function with respect to an independent variable, 𝜕𝐻𝜕𝜆 , and the full
```
derivative using the chain rule to account for dependencies, 𝜕𝜕𝜆 (𝐻). It can be tricky;
```
see Section 2.2.
With 𝜕𝐻𝜕ᵆ = 0 we have
𝜕 ˜𝐻
```
𝜕𝜆 (𝑥, 𝜆) =
```
𝜕
```
𝜕𝜆 (𝐻(𝑥, 𝜆, 𝑢(𝑥, 𝜆)))
```
```
= 𝜕𝐻𝜕𝜆 (𝑥, 𝜆, 𝑢(𝑥, 𝜆)) + 𝜕𝐻𝜕ᵆ (𝑥, 𝜆, 𝑢(𝑥, 𝜆)) 𝜕ᵆ𝜕𝜆 (𝑥, 𝜆)
```
```
= 𝜕𝐻𝜕𝜆 (𝑥, 𝜆, 𝑢(𝑥, 𝜆))
```
= 𝑥′,
𝜕 ˜𝐻
```
𝜕𝑥 (𝑥, 𝜆) =
```
𝜕
```
𝜕𝑥 (𝐻(𝑥, 𝜆, 𝑢(𝑥, 𝜆)))
```
```
= 𝜕𝐻𝜕𝑥 (𝑥, 𝜆, 𝑢(𝑥, 𝜆)) + 𝜕𝐻𝜕ᵆ (𝑥, 𝜆, 𝑢(𝑥, 𝜆)) 𝜕ᵆ𝜕𝑥 (𝑥, 𝜆)
```
```
= 𝜕𝐻𝜕𝑥 (𝑥, 𝜆, 𝑢(𝑥, 𝜆))
```
= −𝜆′.
It follows that ˜𝐻 is constant on optimal trajectories.
𝑑
```
𝑑𝑡 ( ˜𝐻(𝑥(𝑡), 𝜆(𝑡))) =
```
𝜕 ˜𝐻
𝜕𝑥 𝑥′ +
𝜕 ˜𝐻
𝜕𝜆 𝜆′
= 𝜕 ˜𝐻𝜕𝑥𝜕 ˜𝐻𝜕𝜆 − 𝜕 ˜𝐻𝜕𝜆𝜕 ˜𝐻𝜕𝑥
= 0.
```
In other words, our optimal control precisely forces 𝐻(𝑥, 𝜆, 𝑢) to be constant. This
```
```
means that optimal solutions produce curves (𝑥(𝑡), 𝜆(𝑡)) in state-costate space that are
```
level curves of the Hamiltonian, ˜𝐻, and this can help use visualize these solutions.
70 Chapter 5. Unpacking Pontryagin
Example 5.3: King Tiny
```
In Example 4.4 we maximized 𝐽 = ∫100 √𝑢 𝑑𝑡 subject to 𝑥′ = .2𝑥−𝑢 with 𝑥(0) = 1,
```
```
𝑥(10) = 2 using optimal control 𝑢 = 1/(4𝜆2) where 𝜆′ = −.2𝜆.
```
```
Substituting the optimal control into the Hamiltonian 𝐻 = √𝑢 + 𝜆(.2𝑥 − 𝑢)
```
and simplifying yields
𝐻 = .2𝜆𝑥 + .25𝜆−1.
This is the Hamiltonian function for the equations
𝑥′ = .2𝑥 − .25 𝜆−2,
𝜆′ = −.2𝜆
```
and is constant on optimal trajectories (Figure 5.1):
```
𝐶 = .2𝜆𝑥 + .25𝜆−1.
Figure 5.1. Optimal solution in state-costate space, with level
curves of the Hamiltonian.
Note that this can be used as a shortcut for solving the differential equations.
We can solve 𝜆′ = −.2𝜆 as 𝜆 = 𝜆0𝑒−.2𝑡, and then plug this into 𝐶 = .2𝜆𝑥 + .25𝜆−1
to get directly to the form 𝑥 = 𝐶1𝑒.2𝑡 +𝐶2𝑒.4𝑡 without having to solve a differential
equation for 𝑥.
5.2. The Principle of Optimality 71
Example 5.4: Integrator
In Example 4.3 we minimized 𝐽 = ∫𝑇0 𝑥2 + 𝑢2 𝑑𝑡 subject to 𝑥′ = 𝑢 by using a
control 𝑢 = −𝜆/2 which generated the linear state-costate system
𝑥′ = −𝜆/2,
𝜆′ = −2𝑥.
```
For 𝑇 = 6, 𝑥(0) = −1, and 𝑥(6) = 1, we derived solutions
```
𝑥 = 𝑒
𝑡 − 𝑒6−𝑡
𝑒6 − 1 ,
𝜆 = −2 𝑒
𝑡 + 𝑒6−𝑡
𝑒6 − 1 .
The Hamiltonian for this example was 𝐻 = 𝑥2 + 𝑢2 + 𝜆𝑢. Substituting 𝑢 =
−𝜆/2 this simplifies to
𝐻 = 𝑥2 − 14 𝜆2
which is the Hamiltonian function for the state-costate system. In fact, the opti-
mal control −𝜆/2 is exactly the control that makes this a Hamiltonian system.
We can verify directly that 𝐻 is constant on the above trajectory by substitut-
```
ing and simplifying (∗ check this ∗):
```
```
𝐻 = ( 𝑒
```
𝑡 − 𝑒6−𝑡
```
𝑒6 − 1 )
```
2
```
− 14 (−2 𝑒
```
𝑡 + 𝑒6−𝑡
```
𝑒6 − 1 )
```
2
= −4𝑒
6
```
(𝑒6 − 1)2 .
```
Knowing that the Hamiltonian is constant on optimal trajectories leads to an
alternate method for solving these systems. Setting the Hamiltonian equal to a
constant, 𝑥2 − 𝜆2/4 = 𝐶, and solving for 𝜆 = ±2√𝑥2 − 𝐶, we can take
𝑥′ = − 12 𝜆 = ±√𝑥2 − 𝐶.
```
This is a separable differential equation and can be solved directly for 𝑥(𝑡). This
```
approach turns out to be more difficult than solving the linear state-costate sys-
tem, but hey, it’s an option.
5.2 The Principle of Optimality
The Principle of Optimality is:
If the optimal path from A to C goes through B, then it is also the optimal
path from A to B and the optimal path from B to C.
This is actually fairly deep.
72 Chapter 5. Unpacking Pontryagin
As you traverse an optimal path, the path is always optimal from where you are.
At any point and time along the path, the same path continues to be optimal for the
remaining time from that point forward.
It is important to recognize that this principle applies to paths in state-costate
space, and it only applies to autonomous systems. In Chapter 8 we will see how the
principle applies directly to the state space for time optimal systems.
Example 5.5: Integrator
In Examples 4.3 and 5.4 we minimized 𝐽 = ∫𝑇0 𝑥2 + 𝑢2 𝑑𝑡 subject to 𝑥′ = 𝑢 by
using a control 𝑢 = −𝜆/2 which generated the linear state-costate system
𝑥′ = −𝜆/2,
𝜆′ = −2𝑥.
```
We can solve this system for any 𝑇 > 0 and any endpoint conditions 𝑥(0) = 𝐴,
```
```
𝑥(𝑇) = 𝐵 to get the general solution:
```
```
𝑥 = (𝐵𝑒𝑇 −𝐴) 𝑒𝑡+(𝐴𝑒𝑇 −𝐵) 𝑒𝑇−𝑡𝑒2𝑇 −1 ,
```
```
𝜆 = −2 (𝐵𝑒𝑇 −𝐴) 𝑒𝑡−(𝐴𝑒𝑇 −𝐵) 𝑒𝑇−𝑡𝑒2𝑇 −1 .
```
```
For example, 𝑇 = 2 with 𝑥(0) = −1 and 𝑥(2) = 1 yields (with simplification)
```
```
𝑥(𝑡) = (𝑒𝑡 − 𝑒2−𝑡)/(𝑒2 − 1) and 𝜆(𝑡) = −2(𝑒𝑡 + 𝑒2−𝑡)/(𝑒2 − 1). In Figure 5.2 we
```
plot this trajectory in the state-costate plane as a level curve of the Hamiltonian
𝐻 = 𝑥2 − 14 𝜆2.
Figure 5.2. Optimal solution in state-costate space, with level
curves of the Hamiltonian.
5.3. Costates 73
```
Note that at the halfway point this trajectory has 𝑥(1) = 0. The following are
```
left as an exercise for the reader:
```
(a) Solving this system for 𝑇 = 1 with endpoints 𝑥(0) = −1 and 𝑥(1) = 0
```
```
produces the same solution 𝑥 = (𝑒𝑡 − 𝑒2−𝑡)/(𝑒2 − 1).
```
```
(b) Solving this system for 𝑇 = 1 with endpoints 𝑥(0) = 0 and 𝑥(1) = 1
```
```
produces 𝑥 = (𝑒1+𝑡 − 𝑒1−𝑡)/(𝑒2 − 1), which is our first solution 𝑥 = (𝑒𝑡 − 𝑒2−𝑡)/
```
```
(𝑒2 − 1) shifted by one time unit.
```
These solutions are seen in Figure 5.3 as segments of our prior solution plot-
ted as level curves of the Hamiltonian.
Figure 5.3. Optimal solution with midway point in state-
costate space.
The Principle of Optimality is a key observation that will be important as we con-
tinue our journey through this material.
5.3 Costates
Costates are mysterious.
```
Abstractly, in a controlled system modeled by 𝑥′ = 𝑓(𝑥, 𝑢) one is trying to find the
```
control function 𝑢 to optimize some measure 𝐽 of performance.
Pontryagin’s principle creates this curious extra differential equation in a so-called
costate variable, 𝜆, and defines potentially optimizing controls as functions of the
costate.
But what are these costate thingies? They arise from the theory of Lagrange multi-
pliers, and they tell us something about how performance depends on the constraints,
as covered in Section 2.9. Specifically:
The costates are the derivative of performance with respect to position.
Let’s see how this works.
74 Chapter 5. Unpacking Pontryagin
Example 5.6: Integrator
```
Consider the integrator system 𝑥′ = 𝑢 with endpoints 𝑥(0) = 0, 𝑥(1) = 𝐵, and
```
we want to minimize
```
𝐽(𝐵) = ∫
```
1
0
𝑥2 + 𝑢2 𝑑𝑡
which is a function of the prescribed endpoint 𝐵. How will 𝐽 depend on 𝐵? In-
creasing/decreasing? Can you guess concavity?
As in Example 4.3, we have 𝐻 = 𝑥2 + 𝑢2 + 𝜆𝑢, 0 = 𝜕𝐻𝜕ᵆ = 2𝑢 + 𝜆, 𝑢 = −𝜆/2
and so
𝑥′ = −𝜆/2,
𝜆′ = −2𝑥.
```
Solving these with boundary conditions 𝑥(0) = 0 and 𝑥(1) = 𝐵 yields
```
𝑥 = 𝐵 𝑒
1+𝑡 − 𝑒1−𝑡
𝑒2 − 1 ,
𝜆 = −2𝐵 𝑒
1+𝑡 + 𝑒1−𝑡
𝑒2 − 1 ,
𝑢 = 𝐵 𝑒
1+𝑡 + 𝑒1−𝑡
𝑒2 − 1 ,
and performance
```
𝐽(𝐵) = 𝐵2 𝑒
```
2 + 1
𝑒2 − 1
```
and we see that 𝐽(𝐵) is quadratic in 𝐵.
```
In particular, and this is the point, we have
```
𝐽′(𝐵) = 𝑑𝐽𝑑𝐵 = 2𝐵 𝑒
```
2 + 1
```
𝑒2 − 1 = −𝜆(1).
```
```
That is, 𝜆(1) is the decrease in cost per change in final location 𝐵. Note that
```
```
𝜆(1) < 0 and we are trying to minimize 𝐽(𝐵). Consistent with our analysis in
```
Section 2.9, an increase in 𝐵 will increase the minimum.
Dimensional analysis also applies here. In order to add 𝑔 and 𝜆𝑓 in the Hamilton-
ian 𝐻 = 𝑔 + 𝜆𝑓, they must have the same units. The units for 𝑔 are performance-units
per time. The units for 𝑓 are state-units per time. So 𝜆 must be performance-units per
state-units, which is consistent with 𝜆 being the change in performance per change in
state.
The whole bit about 𝜆 being marginal performance holds at any point along the
path, consistent with the Principle of Optimality. If we operate the optimal control
```
for 0 < 𝑡 < 1, and at some time 𝑡 = 𝛽 for 0 < 𝛽 < 1 we are at location 𝑥(𝛽) with
```
```
accumulated payoff 𝐽𝛽 = ∫𝛽0 𝑔(𝑥, 𝑢) 𝑑𝑡, then 𝜆(𝛽) is the rate of change of accumulated
```
payoff with respect to current position under the assumption of optimal control.
5.4. Minimal Surfaces 75
If your head is spinning, you are not alone and it is a good sign. We will delve
into these ideas more as we go along. For now, rest assured that you can totally work
all exercises and solve optimal control problems without having a lot of confidence in
understanding the more abstract context.
5.4 Minimal Surfaces
Pontryagin’s principles are extremely flexible and apply to a wide variety of problems.
The following example demonstrates an application to a geometric problem and is a
case where taking 𝐻 to be constant on optimal trajectories leads to a more tractable so-
lution to the differential equations. This example also demonstrates a technique where
instead of solving for control 𝑢 in terms of costate 𝜆, we formulate the solution by ex-
pressing the costate 𝜆 in terms of 𝑢.
Example 5.7
```
Consider the system 𝑅′(𝑧) = 𝑢 with control 𝑢 and endpoint conditions 𝑅(−𝐿) =
```
```
𝑅(𝐿) = 1. We want to find a control that minimizes
```
𝐽 = ∫
𝐿
−𝐿
𝑅√1 + 𝑢2 𝑑𝑧.
Here 𝑅 is our state variable, and 𝑧 is taking the place of the time variable.
```
Figure 5.4. A possible solution curve 𝑦 = 𝑅(𝑧).
```
Note that the cost function is monotone increasing in 𝑅 and in |𝑢|. So we
want to reduce 𝑅 values without incurring too steep of a slope for 𝑅, while still
```
hitting endpoints of 𝑅(±𝐿) = 1. One possible solution is plotted in Figure 5.4.
```
The Hamiltonian is
```
𝐻(𝑅, 𝑢, 𝜆) = 𝑅√1 + 𝑢2 + 𝜆𝑢.
```
76 Chapter 5. Unpacking Pontryagin
Setting 𝜕𝐻𝜕ᵆ = 0 yields
```
𝑅𝑢(1 + 𝑢2)−1/2 + 𝜆 = 0.
```
Typically, we would solve this for 𝑢 in terms of 𝜆. In this case we will do the
```
opposite and solve for 𝜆 = −𝑅𝑢(1 + 𝑢2)−1/2 in terms of 𝑢. Substituting this back
```
into the Hamiltonian we get
```
𝐻 = 𝑅(1 + 𝑢2)1/2 − 𝑅𝑢2(1 + 𝑢2)−1/2
```
```
= 𝑅(1 + 𝑢2)−1/2.
```
We know that for an optimal solution, the Hamiltonian must be a constant,
```
𝐻 = 𝐶, and we have that 𝑢 = 𝑅′(𝑧). Combining these produces a differential
```
equation
```
𝐶 = 𝑅(1 + (𝑅′)2)−1/2.
```
With some challenging finagling, we can find a symmetric solution to this equa-
tion as
```
𝑅(𝑧) = 12 𝐶 (𝑒𝐿/𝐶 + 𝑒−𝐿/𝐶 ) = 𝐶 cosh(𝐿/𝐶).
```
```
To match the boundary conditions, we need 𝑅(±𝐿) = 1. Solving this condition
```
for 𝐿 yields
```
𝐿 = 𝐶 ln((1 + √1 − 𝐶2)/𝐶) = 𝐶 cosh−1(1/𝐶).
```
Here’s where things get interesting. There are two solutions to this equation if
0 < 𝐿 < .6627 . . . and no solutions if 𝐿 > .6627 . . . , as we can see by plotting
```
the function 𝐿 = 𝐹(𝐶) = 𝐶 cosh−1(1/𝐶). This is a concave downward function
```
```
defined on 0 < 𝐶 ≤ 1 with a maximum of 𝐿 = .6627 . . . at 𝐶 = 0.5524 . . . (Figure
```
```
5.5).
```
```
Figure 5.5. 𝐹(𝐶) = 𝐿 has two solutions for 𝐿 < 0.6627 . . . , one
```
solution for 𝐿 = 0.6627 . . . , and no solutions for 𝐿 > .6627 . . . .
What’s going on? Are there two minimal solutions for small 𝐿 and no solu-
tions for larger 𝐿? How does that work?
5.4. Minimal Surfaces 77
A catenoid is the shape formed by a soap film spanning two circles held par-
allel and aligned. A property of soap films is that they minimize surface area,
and we just solved for this shape using Pontryagin’s principle. The soap film is
```
modeled as a surface formed by revolving the function 𝑦 = 𝑅(𝑧) around the hor-
```
izontal 𝑧-axis. The area of this surface is ∫𝐿−𝐿 𝑅√1 + 𝑢2 𝑑𝑧 and is minimized by
the action of surface tension in the soap film. The unit radius ring boundary is
```
satisfied by 𝑅(±𝐿) = 1:
```
Why are there two solutions for 0 < 𝐿 < .6627 . . . ? Because there is actually
a third solution to the soap film problem, which is a flat disk of film on each ring.
These three solutions are two stable solutions with a third solution in the middle
that doesn’t know which way to go, like a pendulum balanced in the perfectly
upright position. A film in this middle configuration will stay in that configura-
tion, but any tiny perturbation would cause it to spring back to a stable catenoid
or pinch off to form two disks:
For 𝐿 > .6627 . . . , the two rings are simply too far apart to be spanned by a
stable soap film, and Pontryagin’s approach doesn’t produce a minimizing solu-
tion.
78 Chapter 5. Unpacking Pontryagin
Key Points
The previous chapter introduced the main format for analyzing optimal control prob-
lems in continuous systems. In this chapter we took some time to more carefully ex-
amine some of the ideas of the method:
• The fact that the Hamiltonian is constant on optimal trajectories for time-indepen-
dent problems means that we can understand trajectories as level curves of the
Hamiltonian function.
• The Principle of Optimality is a fundamental concept and states that every segment
of an optimal trajectory in state-costate space is itself optimal.
• Costates represent marginal payoffs.
• Pontryagin’s principles are flexible and can apply to geometric constructs.
Exercises
Exercise 5.1. Suppose
```
𝑥′ = 𝑓(𝑥, 𝑦),
```
```
𝑦′ = 𝑔(𝑥, 𝑦)
```
is a Hamiltonian system. Show that
𝜕𝑓
𝜕𝑥 = −
𝜕𝑔
𝜕𝑦 .
```
Exercise 5.2(h). Under what conditions is the linear system
```
𝑥′ = 𝑎𝑥 + 𝑏𝑦,
𝑦′ = 𝑐𝑥 + 𝑑𝑦
```
a Hamiltonian system? Are the conditions necessary and sufficient (that is, are your
```
```
conditions “if and only if”)? What is the Hamiltonian 𝐻(𝑥, 𝑦)? How does the shape of
```
```
𝐻 determine the behavior of the system near the fixed point (0, 0)?
```
```
Exercise 5.3(hs). Suppose 𝑥(𝑡) = 𝛼𝑒𝑡 + 𝛽𝑒−𝑡 is a time minimizing solution for some
```
optimal control problem, where the parameters 𝛼 and 𝛽 are chosen to match endpoint
conditions.
```
(a) Solve for 𝛼 and 𝛽 to match 𝑥(0) = 0 and 𝑥(2) = 1.
```
```
(b) Show that for your solution to (a), you have 𝑥(1) = 1/(𝑒 + 𝑒−1).
```
```
(c) Solve for 𝛼 and 𝛽 to match 𝑥(0) = 1/(𝑒 + 𝑒−1) and 𝑥(1) = 1.
```
```
(d) Show that your solution in part (c) is the same trajectory as your solution in
```
```
part (a), shifted by one time unit.
```
Exercises 79
Exercise 5.4. Consider the system 𝑥′ = 𝑥 + 𝑢 with performance 𝐽 = ∫𝑇0 𝑢2/2 𝑑𝑡.
```
(a) Show that the minimizing solution for fixed time 𝑇 and endpoints 𝑥(0) = 𝐴
```
```
and 𝑥(𝑇) = 𝐵 is
```
```
𝑥(𝑡) = 𝑒
```
−𝑡
```
𝑒2𝑇 − 1 (𝐵𝑒
```
```
𝑇 (𝑒2𝑡 − 1) + 𝐴(𝑒2𝑇 − 𝑒2𝑡)) .
```
```
(b) Construct the solution for 𝑇 = 2, 𝑥(0) = 0, and 𝑥(2) = 𝑒 + 𝑒−1. Show that this
```
```
solution has 𝑥(1) = 1.
```
```
(c) Construct the solution for 𝑇 = 1, 𝑥(0) = 0, and 𝑥(1) = 1. Show that this
```
```
solution is algebraically equivalent to the solution from part (b).
```
```
(d) Construct the solution for 𝑇 = 1, 𝑥(0) = 1, and 𝑥(1) = 𝑒 + 𝑒−1. Show that this
```
```
solution is algebraically equivalent to the solutions from parts (a) and (b), shifted by
```
one time unit.
```
(e) Explain parts (a)–(d) using level curves of the Hamiltonian.
```
```
Exercise 5.5(hs). Consider the system 𝑥′ = 2𝑢 with performance 𝐽 = ∫𝑇012 𝑥2 −2𝑢2 𝑑𝑡.
```
```
(a) Solve for the control 𝑢, in terms of 𝑥 and 𝜆, that maximizes 𝐽.
```
```
(b) Substitute back into the Hamiltonian and sketch some level curves in the (𝑥, 𝜆)-
```
plane.
```
(c) Solve the 𝑥′, 𝜆′ system to get the general solution 𝑥(𝑡) = 𝛼 cos 𝑡 + 𝛽 sin 𝑡 for 𝑥.
```
```
(d) Solve for boundary conditions 𝑥(0) = −1, 𝑥(𝜋/2) = 1. Sketch the trajectory in
```
```
the (𝑥, 𝜆)-plane and verify that 𝑥(𝜋/4) = 0.
```
```
(e) Solve for the boundary conditions 𝑥(0) = −1 and 𝑥(𝜋/4) = 0. Show that you
```
```
get the same trajectory as in part (d).
```
```
(f) Solve for boundary conditions 𝑥(0) = 0, 𝑥(𝜋/4) = 1. Show that this produces
```
```
the same trajectory as in part (b), but shifted by 𝜋/4 time units.
```
```
Exercise 5.6(s). Consider the system 𝑥′ = 2𝑥+𝑢 with performance 𝐽 = ∫𝑇0 𝑥2− 14 𝑢2 𝑑𝑡.
```
```
(a) Solve for the control 𝑢, in terms of 𝑥 and 𝜆, that maximizes 𝐽.
```
```
(b) Substitute back into the Hamiltonian and conclude that 𝑥 + 𝜆 is constant on
```
optimal trajectories.
```
(c) Substitute for 𝑢 in 𝑥′ = 2𝑥 + 𝑢 and conclude that 𝑥′ is constant.
```
```
Exercise 5.7(s). Consider the system 𝑥′ = 𝑢𝑥 with performance 𝐽 = ∫𝑇014 𝑥𝑢2 𝑑𝑡.
```
```
(a) Solve for the control 𝑢, in terms of 𝑥 and 𝜆, that maximizes 𝐽.
```
```
(b) Substitute back into the Hamiltonian and sketch some level curves in the (𝑥, 𝜆)-
```
plane.
80 Chapter 5. Unpacking Pontryagin
```
(c) Derive the equation for 𝜆′ and substitute for 𝑢 to get 𝜆′ = 𝜆2. Solve to conclude
```
```
𝜆 = 1/(𝐶 − 𝑡).
```
```
(d) Substitute 𝜆 = 1/(𝐶 − 𝑡) back into the Hamiltonian, and use the fact that the
```
Hamiltonian is constant on optimal trajectories to solve for 𝑥.
Note that you were able to solve for 𝑥 without solving the differential equation for
𝑥, as in Examples 5.3 and 5.4.
```
Exercise 5.8(s). Analyze 𝐽 = ∫𝜋/4012 𝑥2 −2𝑢2 𝑑𝑡 for 𝑥′ = 2𝑢 (same system as in Exercise
```
```
5.5) with 𝑥(0) = 0, 𝑥(𝜋/4) = 𝐵.
```
```
(a) For any 𝐵, compute the maximum performance 𝐽(𝐵).
```
```
(b) Verify 𝐽′(𝐵) = −𝜆(𝜋/4).
```
```
Exercise 5.9(s). Consider the system 𝑥′ = 𝑥+𝑢 with 𝑢 > 0 and performance ∫10 ln 𝑢 𝑑𝑡,
```
as in Exercises 4.2 and 4.7.
```
(a) For 𝑥(0) = 𝐴 and 𝑥(1) = 𝐵, solve for the maximum performance 𝐽(𝐴, 𝐵).
```
```
(b) Show that 𝜕𝐽𝜕𝐵 = −𝜆(1) and 𝜕𝐽𝜕𝐴 = 𝜆(0).
```
```
Exercise 5.10(s). Consider the controlled system 𝑥′ = 𝑢 with performance index 𝐽 =
```
```
∫1012 (𝑢2 − 𝜋2𝑥2) 𝑑𝑡 and endpoint conditions 𝑥(0) = 𝐴 and 𝑥(1) = 𝐵.
```
```
(a) Find the control 𝐽(𝐴, 𝐵) that minimizes performance.
```
```
(b) Verify 𝜕𝐽𝜕𝐴 (𝐴, 𝐵) = 𝜆(0) and 𝜕𝐽𝜕𝐵 (𝐴, 𝐵) = −𝜆(1).
```
```
(c) For optimal control 𝑢, show that the control̃ 𝑢 = 𝑢 + 𝛿 cos(𝑛𝜋𝑡), where 𝑛 is an
```
```
integer, would still match the endpoint conditions 𝑥(0) = 𝐴 and 𝑥(1) = 𝐵.
```
```
(d) Show that 𝐽 is strictly greater using any such control̃ 𝑢.
```
```
Parts (c) and (d) and some Fourier theory will imply directly that 𝑢 is a locally
```
optimal control.
```
Exercise 5.11. Consider the controlled system 𝑅′(𝑧) = 𝑢 with endpoint conditions
```
```
𝑅(𝑎) = 𝐴 and 𝑅(𝑏) = 𝐵, 𝑎 < 𝑏. Find the control that minimizes 𝐽 = ∫𝑏𝑎 √1 + 𝑢2 𝑑𝑧.
```
Solve this exercise using steps similar to those in Example 5.7: set up the Hamil-
tonian, set 𝜕ᵆ𝐻 = 0, solve for 𝜆 in terms of 𝑢, and substitute back into the Hamiltonian.
Then use the fact that the Hamiltonian must be constant on optimal solutions to con-
clude that 𝑢 must be constant.
```
Then use the fact that ∫𝑏𝑎 √1 + (𝑅′)2 𝑑𝑧 is arclength to argue that the shortest dis-
```
```
tance between two points (𝑎, 𝐴) and (𝑏, 𝐵) on a plane is a straight line.
```
6
Easing the Restrictions
Principles I and II considered fixed endpoints and a fixed time duration. We ease these
restrictions in this chapter and allow for end time and terminal location to be free and
therefore subject to optimization. This typically includes payoff functions based on
terminal location, as in the Bocce ball examples.
Freeing up the endpoint conditions can cause issues. We will explore more cases
like those in Section 4.3 where there is no valid solution to the optimization problem.
We will conclude this chapter with a proof of Pontryagin’s principle. The classic
proof we present requires the free terminal location.
6.1 One Dimension, Free Ends
Consider the controlled system
```
𝑥′ = 𝑓(𝑥, 𝑢, 𝑡)
```
```
where 𝑥 is state, 𝑢 is control, and 𝑡 is time. Suppose we have a starting conditions 𝑥(0) =
```
```
𝐴 but may or may not have a specified end time 𝑇 and/or end condition 𝑥(𝑇) = 𝐵. We
```
want to optimize
```
𝐽(𝐵, 𝑇, 𝑢) = 𝐺(𝐵, 𝑇) + ∫
```
𝑇
0
```
𝑔(𝑥, 𝑢, 𝑡) 𝑑𝑡,
```
where we allow a payoff/cost 𝐺 for the ending location 𝐵 and total time 𝑇. The follow-
ing more general optimal principle provides necessary conditions for optimization in
this expanded scope.
81
82 Chapter 6. Easing the Restrictions
OPTIMAL PRINCIPLE III
Local optimum, free duration, free endpoint, time dependent, one dimension
Consider the controlled system
```
𝑥′ = 𝑓(𝑥, 𝑢, 𝑡), 𝑥, 𝑡 ∈ ℝ, 𝑢 ∈ 𝒰,
```
```
starting at 𝑥(0) = 𝐴 and objective function
```
```
𝐽 = 𝐺(𝐵, 𝑇) + ∫
```
𝑇
0
```
𝑔(𝑥, 𝑢, 𝑡) 𝑑𝑡
```
```
where 𝐵 = 𝑥(𝑇).
```
Define the Hamiltonian
```
𝐻(𝑥, 𝜆, 𝑢, 𝑡) = 𝑔(𝑥, 𝑢, 𝑡) + 𝜆𝑓(𝑥, 𝑢, 𝑡)
```
and costate equation
𝜆′ = − 𝜕𝐻𝜕𝑥 .
Then a locally optimal control must satisfy
𝜕𝐻
𝜕𝑢 = 0
and the control 𝑢 that optimizes 𝐽 will optimize 𝐻 at all times.
```
The ending location 𝑥(𝑇) = 𝐵 may be prescribed. Otherwise, the optimal
```
ending location will satisfy
𝜕𝐺
```
𝜕𝐵 (𝐵, 𝑇) − 𝜆(𝑇) = 0.
```
The ending time 𝑇 may be prescribed. Otherwise, the optimal ending time will
satisfy
𝜕𝐺
```
𝜕𝑇 (𝐵, 𝑇) + 𝐻(𝑇) = 0.
```
Furthermore, if 𝑓 and 𝑔 are independent of time 𝑡, then 𝐻 is constant on optimal
trajectories.
This principle allows us to consider time dependence, free endpoint conditions,
free endtime conditions, or any combination thereof.
The next example is a continuous version of the Bocce ball examples, where costs
accrue during the game with a payoff at the end determined by how far down the 𝑥-axis
the ball has been moved.
Example 6.1: Continuous Bocce
Consider using control
𝑥′ = 𝑢
to maximize
```
𝐽 = 𝑥(𝑇) − ∫
```
𝑇
0
𝑢2
𝑥 𝑑𝑡
6.1. One Dimension, Free Ends 83
```
with given starting position 𝑥(0) = 𝑥0 and end time 𝑇. We have
```
```
𝐻(𝑥, 𝜆, 𝑢) = − 𝑢
```
2
𝑥 + 𝜆 𝑢
and costate equation
𝜆′ = − 𝜕𝐻𝜕𝑥 = − 𝑢
2
𝑥2 .
Setting
𝜕𝐻
𝜕𝑢 = −
2𝑢
𝑥 + 𝜆 = 0
leads to 𝑢 = 12 𝜆𝑥. Using this control yields the state-costate system
𝑥′ = 12 𝜆𝑥,
𝜆′ = − 14 𝜆2.
```
We have one initial condition 𝑥(0) = 𝑥0, but in order to define a unique tra-
```
jectory in this system we need an additional condition. The endtime 𝑇 is speci-
```
fied, but the end location 𝑥(𝑇) is free. Therefore we look for a control that satisfies
```
𝜕𝐺
```
𝜕𝐵 (𝐵, 𝑇) − 𝜆(𝑇) = 0.
```
```
With 𝐺(𝐵, 𝑇) = 𝐵 this yields 𝜆(𝑇) = 1
```
We solve this system by first solving the second equation 𝜆′ = −𝜆2/2 as a
```
separable equation with endpoint condition 𝜆(𝑇) = 1 to get 𝜆 = 4/(4 + 𝑡 − 𝑇)
```
```
(∗ verify this ∗). Substituting this result into the first equation and solving with
```
```
boundary condition 𝑥(0) = 𝑥0 produces optimal trajectory (∗ check this ∗)
```
```
𝑥 = 𝑥0 (1 + 𝑡4 − 𝑇 )
```
2
.
```
Substituting 𝑥(𝑡) and 𝜆(𝑡) back into the Hamiltonian we can verify that 𝐻 does
```
```
not depend upon 𝑡 (∗ verify ∗), so trajectories are level curves of 𝐻 = 14 𝜆2𝑥.
```
Solving this with 𝑥0 = 12 and 𝑇 = 2 produces the following trajectories for 𝑥
```
and 𝑢 in time (Figure 6.1) and for 𝑥 and 𝜆 in the state-costate space (Figure 6.2).
```
Figure 6.1. State and control plotted against time, optimal control.
84 Chapter 6. Easing the Restrictions
Figure 6.2. Optimal solution in state-costate space, with level
curves of the Hamiltonian.
Example 6.2: Ninety-Nine Bottles of Beer
We have ninety-nine bottles of a favored beverage arranged on shelving along a
wall. Every night one of the bottles mysteriously falls and breaks. No one can
figure out why. It just happens.
```
We have a diminishing resource 𝑥(𝑡) that starts at 𝑥(0) = 100 that naturally
```
loses one unit per day. We can withdraw 𝑢 units per day from this resource and
consume it, making
𝑥′ = −1 − 𝑢.
We want to draw from this resource in such a way to maximize our enjoyment
𝐽 = ∫
𝑇
0
√𝑢 𝑑𝑡.
Here we use the concave downwards function √𝑢 to model the saturation effect
of our enjoyment.
Consuming the resources quickly is not a good strategy because of the di-
minished returns at high levels of consumption. However, if we consume too
slowly, we also miss out because the resources naturally disappear so we don’t
get to consume them. So what is the perfect balance?
Our end time 𝑇 is not predetermined but is taken to be when our resources
```
run out, 𝑥(𝑇) = 0.
```
The Hamiltonian is
```
𝐻 = √𝑢 − 𝜆(1 + 𝑢)
```
and 𝜕𝐻𝜕𝑥 = 0, so 𝜆 is constant.
6.1. One Dimension, Free Ends 85
We require
0 = 𝜕𝐻𝜕𝑢 = 1
2√𝑢
− 𝜆
```
and so 𝑢 = 1/(4𝜆2) is also constant. We check that 𝜕2𝐻𝜕ᵆ2 < 0, and maximizing is
```
appropriate.
Knowing that the control is constant, we could solve the problem directly by
```
setting 𝑢 = 𝐾, solving for 𝑇, computing 𝐽, and maximizing over 𝐾 (∗ try it ∗).
```
```
Sticking to Principle III, we substitute 𝑢 = 1/(4𝜆2) into 𝐻 and get
```
𝐻 = 14𝜆 − 𝜆.
```
Our endtime 𝑇 is free, so we look for the condition 𝐻(𝑇) + 𝜕𝐺𝜕𝑇 = 0. In this case
```
𝜕𝐺
```
𝜕𝑇 = 0, so 𝐻(𝑇) = 0.
```
```
We know that 𝐻 is constant on optimal trajectories, so 𝐻(𝑇) = 0 means that
```
𝐻 is identically zero, 𝐻 ≡ 0. This implies 𝜆 = ±1/2 and 𝑢 = 1. Our optimal
```
trajectory is then 𝑥(𝑡) = 100 − 2𝑡 with final time 𝑇 = 50 days (Figure 6.3).
```
Figure 6.3. State and consumption plotted against time, opti-
mal control.
Should we ever find ourselves in this situation, and having these powerful op-
timization techniques in hand, we can confidently relax and consume one bever-
age every evening in full knowledge that we are optimizing our enjoyment under
the given circumstances.
The previous example resulted in linear consumption. However, if we discount
```
future rewards, as in King Tiny (Example 4.5), we get a slightly different result.
```
86 Chapter 6. Easing the Restrictions
Example 6.3: Ninety-Nine Bottles of Beer, Discounted
We repeat the previous example with a discounted future. Specifically, we have
```
a diminishing resource 𝑥(𝑡) that starts at 𝑥(0) = 100 that naturally loses one unit
```
per day, and we can draw 𝑢 units per day from this resource, making
𝑥′ = −1 − 𝑢.
How can we draw from this resource in such a way as to maximize
𝐽 = ∫
𝑇
0
𝑒−𝛼𝑡√𝑢 𝑑𝑡?
We can assume there will be nothing left of the resource when we are done, mak-
```
ing 𝑥(𝑇) = 0.
```
Our Hamiltonian is
```
𝐻 = 𝑒−𝛼𝑡√𝑢 − 𝜆(1 + 𝑢)
```
and 𝜕𝐻𝜕𝑥 = 0, so 𝜆′ = − 𝜕𝐻𝜕𝑥 = 0 implying 𝜆 is constant.
We require
```
0 = 𝜕𝐻𝜕𝑢 = 𝑒−𝛼𝑡/(2√𝑢) − 𝜆,
```
```
and so 𝑢 = 𝑒−2𝛼𝑡/(4𝜆2). Substituting this into our system,
```
𝑥′ = −1 − 𝑒
−2𝛼𝑡
4𝜆2
with general solution
𝑥 = −𝑡 + 𝑒
−2𝛼𝑡
```
8𝛼𝜆2 + 𝐶. (6.1)
```
We currently have three unknown constants, 𝜆, 𝑇, and the integration con-
```
stant 𝐶. We have two endpoint conditions 𝑥(0) = 100 and 𝑥(𝑇) = 0. We get a
```
```
third condition from 𝐻(𝑇) + 𝜕𝐺𝜕𝑇 = 0 and since 𝜕𝐺𝜕𝑇 = 0, we have 𝐻(𝑇) = 0. Note
```
that in this case, 𝐻 is a function of 𝑡 and is not constant on optimal trajectories.
```
Substituting 𝑢 = 𝑒−2𝛼𝑡/(4𝜆2) into 𝐻 and solving 𝐻(𝑇) = 0 yields 𝑒−𝛼𝑇 = 2𝜆.
```
```
So we have equation (6.1) with 𝑥(0) = 100, 𝑥(𝑇) = 0, and 𝑒−𝛼𝑇 = 2𝜆. Elimi-
```
```
nating 𝜆 yields 𝑥(𝑡) = −𝑡+𝑒2𝛼(𝑇−𝑡)/(2𝛼)+𝐶. Resolving 𝑥(0) = 100 yields (∗ check
```
```
these steps ∗)
```
```
𝑥(𝑡) = 100 − 𝑡 + 12𝛼 (𝑒2𝛼(𝑇−𝑡) − 𝑒2𝛼𝑇 )
```
```
for 0 ≤ 𝑡 ≤ 𝑇. To find the final time, we set 𝑥(𝑇) = 0 and solve for 𝑇. For
```
example, a 1% discount, 𝛼 = 0.01, yields a numerically approximated final time
```
of 𝑇 = 39.60 . . . days (Figure 6.4).
```
6.2. When Things Go Wrong 87
Figure 6.4. State and consumption plotted against time, opti-
mal control, discounted future.
With a future discount we initially consume at a higher rate, over two bev-
erages an evening, tapering off to little over one beverage an evening when our
supply is depleted at time 𝑇 = 39.62 . . . , about 10 days earlier than in the nondis-
counted model.
6.2 When Things Go Wrong
Allowing for a free end time in the previous two examples lead to a unique solution
with finite 𝑇 in each case. This doesn’t always happen.
As we have seen in Section 4.3, the set of possible solutions may not be closed.
There may be a sequence of controls that satisfy the properties we want, and the se-
quence may converge, but the limiting control does not satisfy the same properties.
This was the case in Example 4.9 where we had $100 to spend with payoff 𝐽 = ∫𝑇0 √𝑢 𝑑𝑡,
```
which increases as 𝑇 increases. So if time 𝑇 were free (and there is no future discount),
```
we would wind up not spending any of it.
The following is another example of how this problem arises where 𝑇 is free.
Example 6.4: Integrator
For the integrator 𝑥′ = 𝑢 we want to minimize
𝐽 = ∫
𝑇
0
𝑥2 + 𝑢2 𝑑𝑡
```
with endpoint conditions 𝑥(0) = −1, 𝑥(𝑇) = 1 and a free endtime 𝑇.
```
88 Chapter 6. Easing the Restrictions
```
Solving this for any fixed time 𝑇, as in Example 5.5, leads to solutions (∗ check
```
```
these ∗)
```
```
𝑥𝑇 (𝑡) = 𝑒𝑡−𝑒𝑇−𝑡𝑒𝑇 −1 ,
```
```
𝑢𝑇 (𝑡) = 𝑒𝑡+𝑒𝑇−𝑡𝑒𝑇 −1 .
```
Performance 𝐽 as a function of allowed time 𝑇 is computed as
```
𝐽(𝑇) = 2 𝑒
```
𝑇 + 1
𝑒𝑇 − 1
and is plotted in Figure 6.5.
Figure 6.5. Plot of performance 𝐽 as a function of allowed time 𝑇.
Note that 𝐽 → ∞ as 𝑇 → 0 as it becomes very expensive to move from 𝑥 = −1
to 𝑥 = 1 in very short periods of time.
On the other hand, as 𝑇 → ∞ this cost function monotonically decreases to
```
𝐽 = 2, and trajectories 𝑥𝑇 (𝑡), plotted in Figure 6.6, spend increasingly more time
```
near 𝑥 = 0.
```
Figure 6.6. Sequence of optimal solutions 𝑥(𝑡) for increasing
```
values of 𝑇.
```
The limiting control is 𝑢𝑇 (𝑡) → 𝑒−𝑡. However, using the control 𝑢(𝑡) = 𝑒−𝑡
```
```
with 𝑥(0) = −1 produces a trajectory 𝑥(𝑡) = −𝑒−𝑡 < 0, which never attains the
```
required endpoint of 𝑥 = 1. It doesn’t even get close.
A sequence of better and better controls and trajectories fails to converge to a
controlled system that will match the endpoint conditions. There is no optimiz-
ing solution for a free endtime.
```
This lack of a solution is the result of there being no upper bound on time;
```
we can always spend a bit more time and save a bit more cost, but the limit of
spending infinite time does not achieve the required end conditions.
6.3. Proving Pontryagin 89
6.3 Proving Pontryagin
We conclude this chapter with a proof of Pontryagin’s method. This classic proof relies
```
on end time and location being free (Principle III). The proof is pretty awesome but
```
may be skipped by those whose primary interest is applications.
We will walk through a basic treatment of the proof, highlighting the key ideas.
For a more in-depth treatment, see [5, 10, 13, 15, 16].
6.3.1 A Basic Case. To introduce the structure of the proof, we start with a very
simplified version of a control problem without time dependence, and therefore with-
out the compounding complexity of multistep controls, and which can be solved di-
rectly with calculus-level optimization methods.
Suppose you have a system you want to control and the state of this system is rep-
resented as a single real variable 𝑥. You can influence this system by choosing a value
for a control variable 𝑢.
We assume the relationship between the state 𝑥 and the control 𝑢 is defined im-
```
plicitly by 0 = 𝑓(𝑥, 𝑢). That is, as we operate our control 𝑢, the state 𝑥 changes to keep
```
```
𝑓(𝑥, 𝑢) = 0.
```
```
We assume our payoff is given as a performance function 𝑔(𝑥, 𝑢) that we want to
```
maximize. So we want to find a value for 𝑢 that gives the highest possible value for
```
𝑔(𝑥, 𝑢) under the restriction 𝑓(𝑥, 𝑢) = 0.
```
```
This basic control scenario is thus cast as a problem of maximizing 𝑔(𝑥, 𝑢) subject
```
```
to 𝑓(𝑥, 𝑢) = 0, and this is a situation for using Lagrange multipliers. Here is precisely
```
the point where Lagrange multipliers come into play in optimal control. Lagrange
meets Pontryagin. We analyze the problem as in Section 2.10 by looking for critical
points for the Hamiltonian
```
𝐻(𝑥, 𝑢, 𝜆) = 𝑔(𝑥, 𝑢) + 𝜆𝑓(𝑥, 𝑢).
```
That is, we look for points where
0 = 𝜕𝐻𝜕𝑥 = 𝜕𝐻𝜕𝑢 = 𝜕𝐻𝜕𝜆 .
Setting 𝜕𝐻𝜕𝑥 = 0 yields
0 = 𝜕𝑔𝜕𝑥 + 𝜆 𝜕𝑓𝜕𝑥 and so 𝜆 = − 𝜕𝑔𝜕𝑥 / 𝜕𝑓𝜕𝑥 .
```
Setting 𝜕𝐻𝜕𝜆 = 0 recaptures the constraint 0 = 𝑓(𝑥, 𝑢). Differentiating this with respect
```
to 𝑢 yields
```
0 = 𝑑𝑑ᵆ 𝑓(𝑥, 𝑢) = 𝜕𝑓𝜕𝑥𝑑𝑥𝑑ᵆ + 𝜕𝑓𝜕ᵆ
```
or
𝑑𝑥
𝑑ᵆ = −
𝜕𝑓
𝜕ᵆ /
𝜕𝑓
𝜕𝑥 .
To be clear, 𝑑𝑥𝑑ᵆ is the derivative of 𝑥 with respect to 𝑢 determined by the relation 0 =
```
𝑓(𝑥, 𝑢). This is an application of implicit differentiation.
```
90 Chapter 6. Easing the Restrictions
Now analyze the rate of change of our payoff 𝑔 per change in 𝑢 under this setup.
A key step is from line 2 to line 3 where we exchange the positions of 𝜕𝑓𝜕ᵆ and 𝜕𝑔𝜕𝑥 :
𝑑
```
𝑑ᵆ 𝑔(𝑥, 𝑢) =
```
𝜕𝑔
𝜕𝑥
𝑑𝑥
𝑑ᵆ +
𝜕𝑔
𝜕ᵆ
```
= 𝜕𝑔𝜕𝑥 (− 𝜕𝑓𝜕ᵆ / 𝜕𝑓𝜕𝑥 ) + 𝜕𝑔𝜕ᵆ
```
```
= 𝜕𝑓𝜕ᵆ (− 𝜕𝑔𝜕𝑥 / 𝜕𝑓𝜕𝑥 ) + 𝜕𝑔𝜕ᵆ
```
= 𝜕𝑓𝜕ᵆ 𝜆 + 𝜕𝑔𝜕ᵆ
```
= 𝜕𝐻𝜕ᵆ (𝑥, 𝑢, 𝜆).
```
```
Here we can see the key insight that 𝜕𝐻𝜕ᵆ (𝑥, 𝑢, 𝜆) is the rate of change of the payoff
```
```
𝑔(𝑥, 𝑢) with respect to changes in control 𝑢 under the restrictions 𝑓(𝑥, 𝑢) = 0 and
```
𝜕𝐻
𝜕𝑥 = 0.
In order for 𝑢 to be a local optimum, this rate of change 𝜕𝐻𝜕ᵆ must be zero. Putting
this all together, we have that optimal controls occur at critical points of the Hamilton-
```
ian 𝐻(𝑥, 𝑢, 𝜆) where 𝜕𝐻𝜕𝑥 , 𝜕𝐻𝜕ᵆ , and 𝜕𝐻𝜕𝜆 are all zero. This is pretty cool.
```
Mathematics relies on precise language. The following definition and theorem are
a careful statement of the result for the proof outlined above. The reader is encouraged
to carefully consider the definition and how each assumption in the premise of the
theorem is required for the result.
```
Definition: For open sets 𝑃, 𝑄 ⊂ ℝ and real-valued functions 𝑓(𝑥, 𝑢), 𝑔(𝑥, 𝑢)
```
which are defined and continuous for 𝑥 ∈ 𝑃, 𝑢 ∈ 𝑄, we say a local maximum for
```
𝑔(𝑥, 𝑢) subject to 𝑓(𝑥, 𝑢) = 0 occurs at (̃𝑥,̃ 𝑢) if there are open intervals 𝑀, 𝑁 with
```
```
̃𝑥 ∈ 𝑀 ⊂ 𝑃,̃ 𝑢 ∈ 𝑁 ⊂ 𝑄 such that 𝑔(̃𝑥,̃ 𝑢) ≥ 𝑔(𝑥, 𝑢) for all 𝑥 ∈ 𝑀, 𝑢 ∈ 𝑁 that
```
```
satisfy 𝑓(𝑥, 𝑢) = 0.
```
```
Theorem: For open sets 𝑃, 𝑄 ⊂ ℝ and real-valued functions 𝑓(𝑥, 𝑢), 𝑔(𝑥, 𝑢) which
```
```
are defined and differentiable for 𝑥 ∈ 𝑃, 𝑢 ∈ 𝑄, define 𝐻(𝑥, 𝑢, 𝜆) = 𝑔(𝑥, 𝑢) +
```
```
𝜆𝑓(𝑥, 𝑢) for 𝜆 ∈ ℝ. If a local maximum for 𝑔(𝑥, 𝑢) subject to 𝑓(𝑥, 𝑢) = 0 occurs at
```
```
(̃𝑥,̃ 𝑢), then there exists̃ 𝜆 ∈ ℝ such that
```
```
0 = 𝜕𝐻𝜕𝑥 (̃𝑥,̃ 𝑢,̃ 𝜆) = 𝜕𝐻𝜕𝜆 (̃𝑥,̃ 𝑢,̃ 𝜆) = 𝜕𝐻𝜕ᵆ (̃𝑥,̃ 𝑢,̃ 𝜆).
```
Note that the condition is necessary, not sufficient, for the control to be a local
maximum. These conditions must hold in order for a local maximum to exist, but
which by themselves do not guarantee a local maximum.
6.3.2 Euler’s Technique. We sketch the standard proof of Pontryagin’s principle
in the autonomous case of Principle III, using a technique developed by Euler. We
begin with a careful statement of exactly what we are proving. Note how the following
definitions and theorems mirror those of the previous section and how the concepts
are elevated to function spaces.
6.3. Proving Pontryagin 91
```
Definition: Let 𝒫 be a set of real-valued functions 𝑥(𝑡) that are continuous for
```
𝑡 ∈ [0, 𝑇]. Then 𝒫 is open in the 𝐶0 topology if for all̃ 𝑥 ∈ 𝒫 there is an 𝜖 > 0 such
```
that every real-valued continuous function 𝑥(𝑡) with |̃𝑥(𝑡) − 𝑥(𝑡)| < 𝜖 for 𝑡 ∈ [0, 𝑇]
```
is also in 𝒫.
```
Definition: Let 𝒫 be a set of real-valued functions that are continuous on [0, 𝑇]
```
```
and differentiable on (0, 𝑇), and let 𝒬 be a set of real-valued functions continuous
```
on [0, 𝑇]. Suppose that both 𝒫, 𝒬 are open in the 𝐶0 topology. For real-valued
```
functions 𝑓(𝑥, 𝑢), 𝑔(𝑥, 𝑢), 𝐺(𝑥) continuous for all values for the functions 𝑥 ∈ 𝒫,
```
```
𝑢 ∈ 𝒬, we say a local maximum for 𝐽(𝑥, 𝑢) = 𝐺(𝑥(𝑇)) + ∫𝑇0 𝑔(𝑥, 𝑢) 𝑑𝑡 subject
```
```
to 𝑥′ = 𝑓(𝑥, 𝑢) and 𝑥(0) = 𝐴 occurs at (̃𝑥,̃ 𝑢) if there are open sets ℳ, 𝒩 with
```
```
̃𝑥 ∈ ℳ ⊂ 𝒫,̃ 𝑢 ∈ 𝒩 ⊂ 𝒬 such that 𝐽(̃𝑥,̃ 𝑢) ≥ 𝐽(𝑥, 𝑢) for all 𝑥 ∈ ℳ, 𝑢 ∈ 𝒩 that
```
```
satisfy 𝑥′ = 𝑓(𝑥, 𝑢) and 𝑥(0) = 𝐴.
```
```
Theorem: Let 𝒫 be a set of real-valued functions continuous on [0, 𝑇] and differ-
```
```
entiable on (0, 𝑇), and let 𝒬 be a set of real-valued functions continuous on [0, 𝑇],
```
```
with both 𝒫, 𝒬 open in the 𝐶0 topology. For real-valued functions 𝑓(𝑥, 𝑢), 𝑔(𝑥, 𝑢),
```
```
𝐺(𝑥) continuous for all values for the functions 𝑥 ∈ 𝒫, 𝑢 ∈ 𝒬, define
```
```
𝐻(𝑥, 𝑢, 𝜆) = 𝑔(𝑥, 𝑢) + 𝜆𝑓(𝑥, 𝑢).
```
If a local maximum for
```
𝐽(𝑥, 𝑢) = 𝐺(𝑥(𝑇)) + ∫
```
𝑇
0
```
𝑔(𝑥, 𝑢) 𝑑𝑡
```
```
subject to 𝑥′ = 𝑓(𝑥, 𝑢) and 𝑥(0) = 𝐴 occurs at (̃𝑥,̃ 𝑢), then there exists a real-valued
```
```
functioñ 𝜆(𝑡) defined on [0, 𝑇] and differentiable on (0, 𝑇) such that
```
𝜕𝐻
```
𝜕𝜆 (̃𝑥(𝑡),̃ 𝑢(𝑡),̃ 𝜆(𝑡)) =̃ 𝑥′(𝑡),
```
𝜕𝐻
```
𝜕𝑥 (̃𝑥(𝑡),̃ 𝑢(𝑡),̃ 𝜆(𝑡)) = −̃𝜆′(𝑡),
```
𝜕𝐻
```
𝜕ᵆ (̃𝑥(𝑡),̃ 𝑢(𝑡),̃ 𝜆(𝑡)) = 0
```
```
for all 𝑡 ∈ (0, 𝑇).
```
That was a lot of technical details. It is important in mathematics to be able to state
precisely what you are doing.
```
The steps of the proof are as follows. For the controlled system 𝑥′ = 𝑓(𝑥, 𝑢) with
```
```
initial condition 𝑥(0) = 𝐴 we want to optimize
```
```
𝐽(𝑢) = 𝐺(𝑥(𝑇)) + ∫
```
𝑇
0
```
𝑔(𝑥, 𝑢) 𝑑𝑡
```
```
over all allowable control functions 𝑢 = 𝑢(𝑡). We assume the allowable controls is the
```
set of continuous functions on the closed interval [0, 𝑇], and we’ll use the 𝐶0 topology:
```
two functions are close together if |𝜇(𝑡) − 𝜙(𝑡)| is small for all 0 ≤ 𝑡 ≤ 𝑇.
```
92 Chapter 6. Easing the Restrictions
We assume there is a local optimum in this allowable set. That is, there is a well-
```
defined continuous control functioñ 𝑢(𝑡) that performs better than any other nearby
```
```
control starting from 𝑥(0) = 𝐴. We’d like to set up conditions that this local optimal
```
```
control 𝑢(𝑡) must satisfy.
```
Motivated by Lagrange multipliers and Hamiltonians, we define
```
𝐻(𝑥, 𝑢, 𝜆) = 𝑔(𝑥, 𝑢) + 𝜆 𝑓(𝑥, 𝑢)
```
and consider
```
𝐽∗(𝑥, 𝑢, 𝜆) = 𝐺(𝑥(𝑇)) + ∫
```
𝑇
0
```
𝑔(𝑥, 𝑢) + 𝜆 (𝑓(𝑥, 𝑢) − 𝑥′) 𝑑𝑡
```
```
for general functions 𝑥 = 𝑥(𝑡), 𝑢 = 𝑢(𝑡), and 𝜆 = 𝜆(𝑡). Under the restriction 𝑥′ =
```
```
𝑓(𝑥, 𝑢) this is exactly the performance function we seek to optimize.
```
Euler’s method proceeds with integration by parts:
```
𝐽∗(𝑥, 𝑢, 𝜆) = 𝐺(𝑥(𝑇)) + ∫
```
𝑇
0
```
𝑔(𝑥, 𝑢) + 𝜆(𝑓(𝑥, 𝑢) − 𝑥′) 𝑑𝑡
```
```
= 𝐺(𝑥(𝑇)) + ∫
```
𝑇
0
```
𝐻(𝑥, 𝑢, 𝜆) 𝑑𝑡 − ∫
```
𝑇
0
𝜆𝑥′ 𝑑𝑡
```
= 𝐺(𝑥(𝑇)) + ∫
```
𝑇
0
```
𝐻(𝑥, 𝑢, 𝜆) 𝑑𝑡 − 𝜆(𝑡)𝑥(𝑡)||𝑇𝑡=0 + ∫
```
𝑇
0
𝜆′𝑥 𝑑𝑡
```
= 𝐺(𝑥(𝑇)) + −𝜆(𝑇)𝑥(𝑇) + 𝜆(0)𝐴 + ∫
```
𝑇
0
```
(𝐻(𝑥, 𝑢, 𝜆) + 𝜆′𝑥) 𝑑𝑡.
```
Now we investigate what happens to this expression as we add some variation to
```
the control 𝑢(𝑡). That is, we take a very small continuous perturbation 𝜇1(𝑡) and re-
```
```
place 𝑢(𝑡) witĥ 𝑢(𝑡) = 𝑢(𝑡) + 𝜇1(𝑡). Under 𝑥′ = 𝑓(𝑥, 𝑢) this will cause a very small
```
```
perturbation in 𝑥(𝑡) creating a new trajectorŷ 𝑥(𝑡) = 𝑥(𝑡) + 𝜇2(𝑡). Consider how this
```
may change 𝐽∗, where we use the linear approximation ideas from Section 2.3:
```
Δ𝐽∗ = 𝐽∗(̂𝑥,̂ 𝑢, 𝜆) − 𝐽∗(𝑥, 𝑢, 𝜆)
```
```
= 𝐺(̂𝑥(𝑇)) − 𝐺(𝑥(𝑇)) − 𝜆(𝑇)̂𝑥(𝑇) + 𝜆(𝑇)𝑥(𝑇)
```
- ∫𝑇0 𝐻(̂𝑥,̂ 𝑢, 𝜆) − 𝐻(𝑥, 𝑢, 𝜆) + 𝜆′̂ 𝑥 − 𝜆′𝑥 𝑑𝑡
```
= 𝐺′(𝑥(𝑇))𝜇2(𝑇) − 𝜆(𝑇)𝜇2(𝑇)
```
- ∫𝑇0𝜕𝐻𝜕ᵆ (𝑥, 𝑢, 𝜆) 𝜇1 + 𝜕𝐻𝜕𝑥 (𝑥, 𝑢, 𝜆) 𝜇2 + 𝜆′𝜇2 𝑑𝑡
```
+𝑜(|𝜇1|, |𝜇2|)
```
```
= (𝐺′(𝑥(𝑇)) − 𝜆(𝑇)) 𝜇2(𝑇)
```
- ∫𝑇0𝜕𝐻𝜕ᵆ (𝑥, 𝑢, 𝜆) 𝜇1 + ( 𝜕𝐻𝜕𝑥 (𝑥, 𝑢, 𝜆) + 𝜆′) 𝜇2 𝑑𝑡
```
+𝑜(|𝜇1|, |𝜇2|).
```
```
(6.2)
```
Key Points 93
```
At this point the function 𝜆(𝑡) is arbitrary, and we can arbitrarily restrict our atten-
```
tion to those functions that are solutions to the differential equation
```
𝜆′ = − 𝜕𝐻𝜕𝑥 (𝑥, 𝑢, 𝜆) with 𝜆(𝑇) = 𝐺′(𝑥(𝑇)).
```
```
This one weird trick of taking 𝜆′ = − 𝜕𝐻𝜕𝑥 forces ∫𝑇0 ( 𝜕𝜕𝑥 𝐻(𝑥, 𝑢, 𝜆) + 𝜆′) 𝜇2 𝑑𝑡 = 0 and
```
```
𝜆(𝑇) = 𝐺′(𝑥(𝑇)) = 0 for all possible 𝜇2(𝑡). So equation (6.2) becomes
```
Δ𝐽∗ = ∫
𝑇
0
𝜕𝐻
```
𝜕ᵆ (𝑥, 𝑢, 𝜆) 𝜇1 𝑑𝑡 + 𝑜(|𝜇1|, |𝜇2|). (6.3)
```
Supposing an optimal control 𝑢 and trajectory 𝑥, if there were any time at which 𝜕𝐻𝜕ᵆ ≠
0, we could exploit this with a carefully chosen function 𝜇1 that would make Δ𝐽∗ ≠ 0.
```
Thus, in order for a given pair 𝑥(𝑡), 𝑢(𝑡) to optimize 𝐽∗, under the restrictions 𝜆′ =
```
```
− 𝜕𝐻𝜕𝑥 (𝑥, 𝑢, 𝜆) and 𝜆(𝑇) = 𝐺′(𝑥(𝑇)) we must have Δ𝐽∗ = 0 for all perturbations 𝜇1(𝑡).
```
This requires
𝜕𝐻
```
𝜕ᵆ (𝑥, 𝑢, 𝜆) = 0
```
```
for all 𝑡. This is the condition we use to find the optimal control 𝑢(𝑡).
```
The arbitrary assignment of 𝜆 in this proof may seem unsatisfying. In fact, a more
careful approach would reveal that for Δ𝐽∗ to be zero for all perturbations 𝜇1 and 𝜇2
```
forces 𝜆′ = − 𝜕𝐻𝜕𝑥 and 𝜆(𝑇) = 𝐺′(𝑥(𝑇)). We take the more direct route of simply assign-
```
ing these restrictions, which suffices to prove the result.
We have omitted the more delicate proof that 𝐻 must be a local maximum or min-
```
imum on optimal trajectories, but one can see the crux of the argument: equation (6.3)
```
is basically saying
𝜕
𝜕𝑢 𝐽 ≈ ∫
𝑇
0
𝜕𝐻
```
𝜕𝑢 (𝑥, 𝑢, 𝜆) 𝑑𝑡
```
which a handwaving leap of faith leads to
𝜕2
𝜕𝑢2 𝐽 ≈ ∫
𝑇
0
𝜕2𝐻
```
𝜕𝑢2 (𝑥, 𝑢, 𝜆) 𝑑𝑡
```
which must be positive for a minimum, negative for a max. This is achieved by 𝜕2𝐻𝜕ᵆ2
being positive for a minimum, negative for a max. There are lots of holes in this part
of the proof, but enough of this for now.
```
We also omit proofs for fixed end times and locations (Principles I and II), which
```
get a bit more involved.
An expanded treatment of proofs associated with optimal control can be found in
[5, 10, 13, 15, 16].
Key Points
In this chapter we generalize the optimal control techniques to allow for a free endpoint
```
𝑥(𝑇) and/or a free time 𝑇, with an added payoff function 𝐺(𝑥(𝑇), 𝑇) depending on
```
the end location and time used. For a control to be optimal, Principle III specifies
```
necessary conditions on 𝑥(𝑇) and 𝑇 in terms of terminal values of the costates and
```
partial derivatives of the Hamiltonian.
94 Chapter 6. Easing the Restrictions
This allows additional ways to view solutions as level curves of the Hamiltonian
and new ways that solutions can fail to exist. It also allows additional insight into
costates as representing marginal payoffs.
The standard proof for Pontryagin’s method applies to the form of Principle III. We
made mathematically careful definitions and stated Principle III as a formal theorem,
and we walked through a proof of the theorem using real analytic concepts.
Exercises
Exercise 6.1. Free B. In Exercise 5.9 we used Principle I to analyze the system 𝑥′ = 𝑥+𝑢
```
and performance 𝐽 = ∫10 ln 𝑢 𝑑𝑡 for 𝑢 > 0. For 𝑥(0) = 𝐴 and 𝑥(1) = 𝐵 we derived
```
```
maximal performance 𝐽(𝐴, 𝐵) = ln(𝐵 − 𝐴𝑒) − 12
```
```
(a) Use this to conclude that for the system 𝑥′ = 𝑥 + 𝑢 and performance
```
```
𝐽 = −𝑥(1) + ∫
```
1
0
ln 𝑢 𝑑𝑡
```
for prescribed 𝑥(0) = 1 and 𝑥(1) = 𝐵 we have maximal performance 𝐽(𝐵) = −𝐵 +
```
```
ln(𝐵 − 𝑒) − 12 .
```
```
(b) Show that this performance attains a maximum at 𝐵 = 𝑒 + 1.
```
```
(c) Show that applying Principle III to this problem with free endpoint 𝑥(1) = 𝐵
```
will produce the same conclusion.
Exercise 6.2. Free B. In Exercise 5.10 we used Principle I to analyze the system 𝑥′ = 𝑢
```
and performance 𝐽 = ∫10 𝑢2 − ( 𝜋2 )2𝑥2 𝑑𝑡 with endpoint conditions 𝑥(0) = 𝐴 and 𝑥(1) =
```
𝐵 to get minimal performance 𝐽 = −𝜋𝐴𝐵.
```
(a) Use this to conclude that for the system 𝑥′ = 𝑢 and performance
```
```
𝐽 = (𝑥(1))2 + ∫
```
1
0
ln 𝑢 𝑑𝑡
```
for 𝑥(0) = 𝐴 and 𝑥(1) = 𝐵 we have minimal performance 𝐽(𝐵) = 𝐵2 − 𝜋𝐴𝐵.
```
```
(b) Show that this performance attains a minimum at 𝐵 = 𝜋𝐴/2.
```
```
(c) Show that applying Principle III to this problem with free endpoint 𝑥(1) = 𝐵
```
will produce the same conclusion.
```
Exercise 6.3. Free T. Consider 𝑥′ = 𝑥 + 2𝑢 with 𝑥(0) = 0, 𝑥(𝑇) = 𝐵, 𝑇 > 0 is free, with
```
performance
𝐽 = 𝑇 + ∫
𝑇
0
2𝑥2 + 𝑢2 𝑑𝑡.
```
(a) Show that a minimizing solution is of the form 𝑥(𝑡) = 𝐾 sinh(3𝑡) for some 𝐾
```
```
(where sinh is the hyperbolic sine).
```
Exercises 95
```
(b) Using Principle III, conclude that 𝐻 must be constant and equal to −1. Use
```
```
this to conclude 𝜆(0) = ±1.
```
```
(c) Use parts (a) and (b) to conclude 𝐾 = 2/3 if 𝐵 > 0 and 𝐾 = −2/3 if 𝐵 < 0.
```
```
(d) Note that we have not used the end location 𝑥(𝑇) = 𝐵. Use the end location
```
to solve for end time 𝑇 in terms of 𝐵.
```
(e) Sketch the solution trajectory in the (𝑥, 𝜆)-plane as a level curve of 𝐻.
```
```
(f) Comment on how this demonstrates the Principle of Optimality covered in
```
Section 5.2.
```
Exercise 6.4(s). Canoe I: Free B. You are practicing for the canoeing competition in the
```
upcoming Summer Olympics, and you hope to bring home a gold medal for the newly
created Optimal Control event. A straight river flows at one unit of distance per one
unit of time. You start at position 𝑥 = 0 on the stream in your canoe. You can paddle
your canoe either with or against the current, so your equation of motion is 𝑥′ = 1 + 𝑢.
Your goal is to get close to position 𝑥 = 2 at exactly time 𝑇. Your end location payoff is
```
𝑥(𝑇)(4 − 𝑥(𝑇)) which has a maximum payoff of 2 at position 𝑥 = 2.
```
Paddling a canoe is hard work and incurs a cost of 𝑢2. So your net payoff is
```
𝐽 = 𝑥(𝑇) (4 − 𝑥(𝑇)) − ∫
```
𝑇
0
𝑢2 𝑑𝑡.
```
Your end location 𝐵 = 𝑥(𝑇) is free. Suppose you have a fixed time 𝑇 = 1. What is your
```
optimal solution? Where is your endpoint? Suppose your fixed end time is 𝑇 = 3. Now
what is your optimal solution and endpoint?
What is the solution and end location for a general fixed end time 𝑇? Solve for 𝐽 as
a function of 𝑇 and plot. What value of 𝑇 would produce maximum payoff? Explain
why this makes intuitive sense.
```
Exercise 6.5(s). Canoe II: Free T. You are back in your canoe, with 𝑥′ = 1 + 𝑢 and
```
```
𝐽 = 𝑥(𝑇) (4 − 𝑥(𝑇)) − ∫𝑇0 𝑢2 𝑑𝑡.
```
```
Suppose your starting location 𝑥(0) = 𝐴 and end location 𝑥(𝑇) = 𝐵 are both fixed,
```
but now 𝑇 is free.
What is your optimal control? Consider the three cases 𝐴 < 𝐵, 𝐴 > 𝐵, and 𝐴 = 𝐵.
96 Chapter 6. Easing the Restrictions
```
Exercise 6.6(h). Canoe III: Free B & T. You are in the canoe again, with 𝑥′ = 1 + 𝑢
```
```
and 𝐽 = 𝑥(𝑇) (4 − 𝑥(𝑇)) − ∫𝑇0 𝑢2 𝑑𝑡.
```
```
Your starting location is fixed at 𝑥(0) = 𝐴 but your end location 𝐵 = 𝑥(𝑇) and end
```
time 𝑇 are both free.
```
(a) If 𝐴 < 2, argue that your optimal control is to drift 𝑢 = 0 until 𝑥 = 2 and then
```
stop.
```
(b) If 𝐴 > 4, argue that your optimal control is to paddle upstream at 𝑢 = −2 until
```
𝑥 = 4 and then stop.
```
(c) What if 2 ≤ 𝐴 ≤ 4? Argue that 𝑇 = 0 is a legitimate solution to Principle III
```
and that it performs better than 𝑢 = 0 or 𝑢 = −2 when 2 ≤ 𝐴 ≤ 4.
```
(d) Argue that 𝑇 = 0 does not perform as well as 𝑢 = 0 for 𝐴 < 2 and does not
```
perform as well as 𝑢 = −2 for 𝐴 > 4.
Exercise 6.7. Time is money, but it doesn’t matter if you collect it at the end or as you
go. The following two performance functions are equivalent. Show that they lead to
the same results in Principle III.
```
𝐽1 = 𝐺(𝐵, 𝑇) + ∫𝑇0 1 + 𝑔(𝑥, 𝑢) 𝑑𝑡,
```
```
𝐽2 = 𝑇 + 𝐺(𝐵, 𝑇) + ∫𝑇0 𝑔(𝑥, 𝑢) 𝑑𝑡.
```
```
Exercise 6.8(s). Good equations can sometimes go bad. Suppose you are given 𝑇 and
```
```
want to optimize ∫𝑇0 𝑔(𝑢) 𝑑𝑡 for 𝑥′ = 𝑢 with 𝑥(0) = 0 and 𝑥(𝑇) = 1.
```
```
(a) Show that Pontryagin’s principle would require 𝑢 to be constant for an optimal
```
control.
```
(b) Take 𝑔(𝑢) = √𝑢 and solve. What happens to 𝐽 as 𝑇 → 0? What happens to 𝐽
```
as 𝑇 → ∞? What is the optimal control if 𝑇 is free?
```
(c) Take 𝑔(𝑢) = 𝑢2 and solve. What happens to 𝐽 as 𝑇 → 0? What happens to 𝐽 as
```
𝑇 → ∞? What is the optimal control if 𝑇 is free?
```
(d) Take 𝑔(𝑢) = 𝑢𝛼 and analyze. What happens at 𝛼 = 1?
```
```
Exercise 6.9(hs). Free T. Growth of the population size of an invasive pest is modeled
```
```
by the normalized logistic equation 𝑥′ = 𝑥(1 − 𝑥). You can control this pest by appli-
```
```
cation of a pesticide at rate 𝑢 resulting in 𝑥′ = 𝑥(1 − 𝑥) − 𝑥𝑢. You want to reduce this
```
```
population from 𝑥(0) = 0.9 to 𝑥(𝑇) = 0.1 while minimizing the environmental impact
```
of the pesticide, measured as 𝐽 = ∫𝑇012 𝑢2 𝑑𝑡. End time 𝑇 is unspecified and should be
chosen as part of the minimization. Solve. Sketch your solution as a level curve of 𝐻
```
in the (𝑥, 𝜆)-plane.
```
Exercises 97
```
Exercise 6.10(s). Free B. Consider the life-cycle savings model in Exercise 4.15, 𝑥′ =
```
```
𝑤 + 𝑟𝑥 − 𝑢, with wages 𝑤, interest rate 𝑟, lifespan 𝑇, and 𝑥(0) = 0. Suppose 𝑥(𝑇) is free
```
and performance is
```
𝐽 = 𝛽 ln(𝐵) + ∫
```
𝑇
0
```
ln(𝑢) 𝑑𝑡
```
```
where 𝛽 ln(𝐵) now represents the utility of bequeathing amount 𝐵. Solve for the opti-
```
mal 𝐵 in terms of 𝑤, 𝑟, 𝑇, and 𝛽. Show that 𝑢 → 0 as 𝛽 → ∞.
```
Exercise 6.11(hs). Free B,T. You work in a lab that cultures a beneficial yeast. The
```
yeast culture grows exponentially, and you can influence the growth rate with nutri-
```
ents, temperature, Mozart, etc., resulting in a growth rate of 𝑥′ = (𝑟 + 𝑢) 𝑥 where 𝑟 is
```
fixed and you control 𝑢 ≥ 0.
Assume that you start with 𝑥0 = 1 unit of yeast and you want to produce 𝐵 ≥ 1
units by time 𝑇.
```
Running costs are 𝑢2/2 and the end payoff is 𝐺(𝐵, 𝑇), so you want to maximize
```
```
𝐽 = 𝐺(𝐵, 𝑇) − ∫
```
𝑇
0
1
2 𝑢2 𝑑𝑡.
```
(a) Show that for a solution satisfying Principle III, 𝑢 will be a constant.
```
```
(b) Suppose 𝐺(𝐵, 𝑇) = 𝐵 − 𝑇 with 𝐵 fixed, say, 𝐵 = 10, and 𝑇 free. Set 𝑟 = 1/2
```
and solve for the optimal solution. Repeat for a general fixed value of 𝐵 and find the
optimal time 𝑇 as a function of 𝐵.
```
(c) With 𝐺(𝐵, 𝑇) = 𝐵 − 𝑇, show that 𝐽 can be made arbitrarily large if 𝑇 and
```
```
𝑥(𝑇) = 𝐵 are free.
```
```
Exercise 6.12(s). Free B,T. You are creating a startup to deliver an amount of product
```
```
𝑥(𝑇) in 𝑇 time units by expending effort (measured in dollars) 𝑢. You start with 𝑥(0) =
```
0 and effort has a saturation effect:
𝑥′ = 𝛼√𝑢.
At the end of 𝑇 time units you sell your product for a fixed price 𝑃, and you have dis-
count rate 𝑟, so your performance is measured as
```
𝐽 = 𝑃 𝑥(𝑇)𝑒−𝑟𝑇 − ∫
```
𝑇
0
𝑢𝑒−𝑟𝑡 𝑑𝑡.
```
(a) Suppose 𝑥(𝑇) = 𝐵 is free and 𝑇 is fixed. What is your optimal payoff 𝐽(𝑇)?
```
Show that this function attains a maximum when 𝑒𝑟𝑇 = 2.
```
(b) Suppose 𝑥(𝑇) = 𝐵 and 𝑇 are both free. Apply Principle III to show that the
```
optimal stopping time is when 𝑒𝑟𝑇 = 2.
7
Linear-Quadratic Systems
Linear-quadratic systems have linear differential models and quadratic costs/payoffs
and are a basic class of optimal control problems that exhibit a wide variety of phenom-
ena. Strict local optimums require convexity, and these are the simplest systems with
the necessary convexity to produce interesting examples. Linear-quadratic systems can
also be used as local approximations of more complicated nonlinear and nonquadratic
problems.
A nice property of these systems is that they generate linear state-costate dynamics,
making them more accessible to study. Our current tools are fully sufficient to explore
these systems, and doing so will help solidify understanding of optimal control.
This section will rely on understanding a two-dimensional system of linear au-
tonomous equations, which is an important topic in differential equations. We worked
```
with such systems in the Integrator examples; see Examples 4.3 and 5.4 in particular.
```
While computer algebra systems handle these cases well, it is important to have a good
theoretical understanding of these systems and the basic matrix algebra involved in
order to work with them efficiently. The reader is encouraged to review the topic as
needed, and Appendix B contains a brief check of techniques.
We start by defining and analyzing the general two-dimensional linear-quadratic
case, and we follow up with several examples and specific solutions.
7.1 Linear-Quadratic with Fixed Ends
Consider the linear case
𝑥′ = 𝑚𝑥 + 𝑢
with quadratic performance
𝐽 = ∫
𝑇
0
𝑎𝑥2 + 𝑏𝑢2 𝑑𝑡.
The coefficients that determine the system are 𝑚, 𝑎, 𝑏, and 𝑇. The coefficient of 𝑢
in the dynamic 𝑥′ = 𝑚𝑥 + 𝑢 is normalized to one: any nonzero coefficient could be
99
100 Chapter 7. Linear-Quadratic Systems
absorbed into the control, and it would make no sense for the coefficient to be zero.
Other coefficients could be normalized, but this choice will suite our purposes.
Applying Principle III, the Hamiltonian is
```
𝐻 = (𝑎𝑥2 + 𝑏𝑢2) + 𝜆(𝑚𝑥 + 𝑢)
```
and
0 = 𝜕𝐻𝜕𝑢 = 2𝑏𝑢 + 𝜆
implies that an optimal control must satisfy
𝑢 = − 12𝑏 𝜆
```
which reduces the Hamiltonian to (∗ check this ∗)
```
𝐻 = 𝑎𝑥2 + 𝑚𝑥𝜆 − 14𝑏 𝜆2.
Note 𝜕2𝐻𝜕ᵆ2 = 2𝑏, and so the sign of 𝑏 determines whether maximizing or minimizing is
appropriate.
With the costate equation 𝜆′ = − 𝜕𝐻𝜕𝑥 we have
𝑥′ = 𝑚𝑥 − 12𝑏 𝜆,
𝜆′ = −2𝑎𝑥 − 𝑚𝜆.
This is a two-dimensional linear system, and a brief review of working with such
systems can be found in Appendix B. We express the system in matrix form:
```
(
```
𝑥
𝜆
```
)
```
′
= [
𝑚 − 12𝑏
−2𝑎 −𝑚
```
] (
```
𝑥
𝜆
```
) .
```
The coefficient matrix has zero trace, which is both necessary and sufficient for it
```
to be a Hamiltonian system (see Exercise 5.2), and trajectories are level curves of the
```
quadric surface
𝐻 = 𝑎𝑥2 + 𝑚𝑥𝜆 − 14𝑏 𝜆2.
For positive determinant/discriminant −𝑚2 − 𝑎𝑏 > 0 the system is a center. For neg-
ative determinant/discriminant −𝑚2 − 𝑎𝑏 < 0 the system is a saddle with eigenvalues
±√𝑚2 + 𝑎𝑏 .
For initial state 𝐴, fixed final state 𝐵, and fixed end time 𝑇, we look for solutions
```
that will satisfy boundary conditions 𝑥(0) = 𝐴 and 𝑥(𝑇) = 𝐵.
```
7.1. Linear-Quadratic with Fixed Ends 101
Example 7.1
Consider the controlled exponential growth 𝑥′ = 14 𝑥 + 𝑢 and suppose we want a
control which minimizes a quadratic expense ∫𝑇0 𝑢2 𝑑𝑡.
The Hamiltonian is
```
𝐻 = 𝑢2 + 𝜆 ( 14 𝑥 + 𝑢).
```
Setting 0 = 𝜕𝐻𝜕ᵆ = 2𝑢 + 𝜆 yields 𝑢 = − 12 𝜆. Check that 𝜕2𝐻𝜕ᵆ2 > 0, so minimizing is
appropriate. With 𝜕𝐻𝜕𝑥 = 14 𝜆 we have
𝑥′ = 14 𝑥 − 12 𝜆,
𝜆′ = − 14 𝜆
with general solution
𝑥 = 𝐶1 𝑒−𝑡/4 + 𝐶2 𝑒𝑡/4,
𝜆 = 𝐶1 𝑒−𝑡/4
```
corresponding to the eigenvalues ±1/4 and eigenvectors (1, 1) and (1, 0) for the
```
```
coefficient matrix (see Appendix B).
```
Substituting 𝑢 = − 12 𝜆 into 𝐻, we have that trajectories are level curves of the
hyperbolic paraboloid
```
𝐻 = 14 𝜆(𝑥 − 𝜆).
```
```
We can satisfy the boundary conditions 𝑥(0) = 𝐴 and 𝑥(𝑇) = 𝐵 with 𝐶1 =
```
```
(𝐴𝑒𝑇/4 − 𝐵)/(𝑒𝑇/4 − 𝑒−𝑇/4) and 𝐶2 = (−𝐴𝑒−𝑇/4 + 𝐵)/(𝑒𝑇/4 − 𝑒−𝑇/4) (∗ check this ∗).
```
```
For example, 𝑥(0) = −1 and 𝑥(4) = 1 yields (with some simplification)
```
𝑥 = − 𝑒1−𝑡/4𝑒−1 + 𝑒𝑡/4𝑒−1 ,
𝜆 = − 𝑒1−𝑡/4𝑒−1 .
```
Figure 7.1 displays trajectories for the following endpoint conditions (∗ match
```
```
them ∗):
```
𝐴 𝐵 𝑇
−1 1 4
1 −1 4
0 2 2
1 2 2
1 2 8
102 Chapter 7. Linear-Quadratic Systems
Figure 7.1. Optimal trajectories in state-costate space, with
level curves of the Hamiltonian.
Example 7.2: Integrator
```
The integrator case (Example 4.3) is linear-quadratic: 𝑥′ = 𝑢 and cost 𝐽 = ∫𝑇0 𝑥2 +
```
𝑢2 𝑑𝑡. With optimal control 𝑢 = −𝜆/2 we get the state-costate system
𝑥′ = − 12 𝜆,
𝜆′ = −2𝑥
and trajectories are level curves of the hyperbolic paraboloid
```
𝐻(𝑥, 𝜆) = 𝑥2 − 14 𝜆2.
```
```
In Example 6.4 we solved this system with endpoints 𝑥(0) = −1 and 𝑥(𝑇) = 1 for
```
```
a general allowed time 𝑇. We saw that performance 𝐽(𝑇) = 2(𝑒𝑇 − 1)/(𝑒𝑇 + 1)
```
```
was a decreasing function of 𝑇, with 𝐽 → 2 as 𝑇 → ∞ and with solutions 𝑥(𝑡)
```
spending more and more time near 𝑥 = 0 as shown in Figure 6.6.
We can now interpret those results as trajectories of a linear system in two-
dimensional state-costate space that are level curves of 𝐻, as shown in Figure
7.2.
7.1. Linear-Quadratic with Fixed Ends 103
```
Figure 7.2. Plots of (𝑥(𝑡), 𝜆(𝑡)) as 𝑇 → ∞.
```
```
Allowing increasing total time 𝑇 → ∞ the optimal solutions (𝑥(𝑡), 𝜆(𝑡)) ap-
```
```
proach the incoming and outgoing eigendirections in the (𝑥, 𝜆)-plane, spending
```
```
more and more time in the slow-moving region near the origin (0, 0).
```
Example 7.3
```
Consider the controlled system 𝑥′ = 𝑢 with endpoint conditions 𝑥(0) = 1 and
```
```
𝑥(𝑇) = 2, and suppose we want a control which maximizes
```
𝐽 = ∫
𝑇
0
1
```
2 (𝑥2 − 𝑢2) 𝑑𝑡.
```
The Hamiltonian is
```
𝐻 = 12 (𝑥2 − 𝑢2) + 𝜆𝑢.
```
We have 0 = 𝜕𝐻𝜕ᵆ = −𝑢 + 𝜆 making 𝑢 = 𝜆. Note 𝜕2𝐻𝜕ᵆ2 < 0, which is consistent
with maximizing. With 𝜕𝐻𝜕𝑥 = 𝑥 we have the state-costate system
𝑥′ = 𝜆,
𝜆′ = −𝑥
with solutions
```
𝑥 = 𝑥0 cos(𝑡) + 𝜆0 sin(𝑡),
```
```
𝜆 = −𝑥0 sin(𝑡) + 𝜆0 cos(𝑡).
```
Trajectories are level curves of the elliptic paraboloid
```
𝐻 = 12 (𝑥2 + 𝜆2).
```
104 Chapter 7. Linear-Quadratic Systems
```
We can satisfy the boundary conditions 𝑥(0) = 1 and 𝑥(𝑇) = 2 with
```
𝑥0 = 1,
```
𝜆0 = 2−cos(𝑇)sin(𝑇) .
```
```
(7.1)
```
```
For instance, if 𝑇 = 1/2, we get 𝜆0 = (2 − cos(1/2))/ sin(1/2) = 2.341 . . . and
```
the trajectory is on the level curve 𝐻 = 3.241 . . . as seen in Figure 7.3.
Figure 7.3. Optimal trajectory in state-costate space, with level
curves of the Hamiltonian.
As we did in Example 6.4 we can keep the same initial and final condi-
```
tions, 𝑥(0) = 1, 𝑥(𝑇) = 2, and consider what the solutions look like for a va-
```
```
riety of terminal times 𝑇. From equation (7.1), this is accomplished with 𝜆0 =
```
```
(2 − cos(𝑇))/ sin(𝑇) plotted in Figure 7.4.
```
```
Figure 7.4. Initial costate 𝜆0 = (2 − cos(𝑇))/ sin(𝑇) as a func-
```
tion of allowed time 𝑇.
7.1. Linear-Quadratic with Fixed Ends 105
Representative trajectories for 0 < 𝑇 < 𝜋 are plotted in the state-costate
plane in Figure 7.5.
For small 𝑇 > 0 we have very little time to transition from 𝑥 = 1 to 𝑥 = 2.
```
This is accomplished with very large 𝜆0 so the trajectory in the (𝑥, 𝜆)-plane sweeps
```
from 𝑥 = 1 to 𝑥 = 2 very quickly. Starting values 𝜆0 decrease to a minimum of
```
𝜆0 = √3 = 1.732 . . . as 𝑇 increases to 𝑇 = 𝜋/3 = 1.047 . . . . The trajectory 𝑥(𝑡) is
```
monotone increasing for the region 0 < 𝑇 ≤ 𝜋/3.
If we are allowed a bit more time and 𝑇 increases past 𝑇 = 𝜋/3, then we get
```
increasing values for 𝜆0 and the trajectory 𝑥(𝑡) overshoots the end value 𝑥(𝑇) = 2
```
before returning. Initial values 𝜆0 increase back towards ∞ as 𝑇 approaches 𝜋.
Figure 7.5. Optimal solution in state-costate space, with level
curves of the Hamiltonian, for various allowed times 𝑇.
With some work, we can calculate performance as a function of allowed time
```
𝑇 (Figure 7.6),
```
```
𝐽(𝑇) = 4 − 5 cos(𝑇)2 sin(𝑇) .
```
For small 𝑇 > 0 our maximal payoff is extremely negative. For such small al-
lowed time 𝑇 we are forced to use large values of 𝑢 to attain the required end-
points, and this creates large negative values in our payoff function 𝑔 = 𝑥2 − 𝑢2.
These negative performance values are simply the best we can do under the cir-
cumstances.
The optimal payoff increases with more allowed time, eventually becoming
positive. For 𝑇 values just below 𝜋 we have sufficient time to travel far beyond
our endpoint value 𝑥 = 2 before returning, thereby accumulating positive values
in the payoff function 𝑔 = 𝑥2 − 𝑢2. In fact, the payoff increases without bound as
𝑇 increases towards 𝜋. We could perhaps get an infinite payoff at 𝑇 = 𝜋 by going
all the way to infinity and back, but that probably wouldn’t be allowed. No one
ever lets you go to infinity and back. You might see something.
106 Chapter 7. Linear-Quadratic Systems
```
Figure 7.6. Optimal payoff 𝐽 = (4 − 5 cos(𝑇))/(2 sin(𝑇)) as a
```
```
function of allowed time 𝑇.
```
Having payoffs become unbounded as 𝑇 → 𝜋 brings up some subtle points
regarding the existence of solutions and the topology of the space of solutions,
as we discussed in Section 4.3.3, and we will revisit this in Chapter 10. It turns
out that for any allowed time 𝑇 > 𝜋 we can attain arbitrarily large payoffs, as we
work out later in Exercise 10.8.
7.2 Linear-Quadratic with Free Ends
We can apply Principle III to linear-quadratic systems, allowing for free end conditions.
```
7.2.1 Free Endpoint. If we have a free condition 𝑥(𝑇) = 𝐵 with an associated pay-
```
```
off 𝐺(𝐵), our performance would be
```
```
𝐽 = 𝐺(𝐵) + ∫
```
𝑇
0
𝑎𝑥2 + 𝑏𝑢2 𝑑𝑡
as discussed in Section 6.1. This leads to a two-point boundary problem in state and
costate variables according to Principle III:
```
𝑥(0) = 𝐴,
```
```
𝜆(𝑇) = 𝜕𝐺𝜕𝐵 (𝐵).
```
```
For 𝐺(𝐵) zero or constant, we have 𝜆(𝑇) = 0.
```
7.2. Linear-Quadratic with Free Ends 107
Example 7.4: Integrator
```
Returning to the Integrator (Example 7.2) we have 𝑥′ = 𝑢, cost 𝐽 = ∫𝑇0 𝑥2 + 𝑢2 𝑑𝑡,
```
optimal control 𝑢 = −𝜆/2, and state-costate system
𝑥′ = − 12 𝜆,
𝜆′ = −2𝑥
```
with trajectories being level curves of the hyperbolic paraboloid 𝐻(𝑥, 𝜆) =
```
𝑥2 − 14 𝜆2.
```
Suppose we have a starting location 𝑥(0) = 4 and a fixed time 𝑇, but our end
```
```
location 𝑥(𝑇) is free.
```
```
Here 𝐺(𝐵) is the zero function, so our endpoint condition is 𝜆(𝑇) = 0. Solv-
```
```
ing this for 𝑇 = 1 we have boundary values 𝑥(0) = 4 and 𝜆(1) = 0, and we get
```
```
a solution 𝑥(𝑡) = 4 (𝑒1−𝑡 + 𝑒𝑡−1)(𝑒 + 𝑒−1) and 𝜆(𝑡) = −8 (𝑒1−𝑡 − 𝑒𝑡−1)(𝑒 + 𝑒−1).
```
Solutions for 𝑇 = 2, 𝑇 = 1, and 𝑇 = 1/2 are plotted in Figure 7.7.
Figure 7.7. Optimal solution for a free endpoint, with level
curves of the Hamiltonian.
Other values for initial position 𝑥0 and fixed end time 𝑇 are accommodated
with appropriate starting values for 𝜆0 as
```
𝜆0(𝑇) = 2𝑥0𝑒
```
𝑇 − 𝑒−𝑇
```
𝑒𝑇 + 𝑒−𝑇 = 2𝑥0 tanh(𝑇).
```
Note that 𝜆0 → 2𝑥0 as 𝑇 → ∞, with trajectories approaching the incoming
eigendirection. For shorter time periods, 𝜆0 → 0 as 𝑇 → 0.
108 Chapter 7. Linear-Quadratic Systems
Example 7.5
```
Returning to Example 7.3 with a free endpoint and terminal cost 𝐺(𝐵) = −𝐵2/2,
```
we have performance
```
𝐽 = − 12 𝑥(𝑇)2 + ∫
```
𝑇
0
1
```
2 (𝑥2 − 𝑢2) 𝑑𝑡.
```
For 𝑥′ = 𝑢 our solutions are the same:
```
𝑥 = 𝑥0 cos(𝑡) + 𝜆0 sin(𝑡),
```
```
𝜆 = −𝑥0 sin(𝑡) + 𝜆0 cos(𝑡)
```
```
which are contained in level curves of 𝐻 = (𝑥2 + 𝜆2)/2.
```
Our endpoint conditions are now an initial value for 𝑥, a fixed time 𝑇, and a
terminal value for 𝜆 given by Principle III:
```
𝜆(𝑇) = 𝐺′(𝐵) = −𝐵 = −𝑥(𝑇).
```
That is, trajectories must terminate on the line 𝑥 = −𝜆. To find the trajectory for
```
a given 𝑇, we solve 𝜆(𝑇) = −𝑥(𝑇) for 𝜆0.
```
```
Solutions starting at 𝑥(0) = 1 for 𝑇 = 0.5, 𝑇 = 1.0, and 𝑇 = 3.0 are depicted
```
in Figure 7.8.
Figure 7.8. Optimal solution for a free endpoint, for various
values of allowed time 𝑇.
```
7.2.2 Free End Time. If 𝑥(𝑇) is fixed, but 𝑇 is free,
```
```
𝐽 = 𝐺(𝑇) + ∫
```
𝑇
0
𝑎𝑥2 + 𝑏𝑢2 𝑑𝑡,
```
we would look for solutions where 𝐻(𝑇) = − 𝜕𝐺𝜕𝑇 . As 𝐻 is conserved by the state-costate
```
systems, 𝐻 is constant at this value. If 𝐺 is zero or constant, solutions are zero-level
curves of 𝐻.
7.2. Linear-Quadratic with Free Ends 109
Example 7.6
As in Example 7.1, consider controlled exponential growth 𝑥′ = 14 𝑥 + 𝑢 with
```
endpoint conditions 𝑥(0) = −1 and 𝑥(4) = 1.
```
Suppose that instead of fixing 𝑇 = 4, we allow 𝑇 to be free and we introduce
a term that imposes a penalty for 𝑇 deviating from 4. We seek to minimize:
```
𝐽 = 𝛼(𝑇 − 4)2 + ∫
```
𝑇
0
𝑢2 𝑑𝑡.
Here 𝛼 adjusts the severity of the penalty, and we anticipate that as 𝛼 → ∞ our
solutions will converge to that of fixing 𝑇 = 4.
By Principle III, the optimal end time must satisfy
```
𝐻(𝑇) = −𝐺′(𝑇) = −2𝛼(𝑇 − 4).
```
As before, we have 𝑢 = − 12 𝜆 and state-costate system
𝑥′ = 14 𝑥 − 12 𝜆,
𝜆′ = − 14 𝜆
with solutions
```
𝑥 = 𝑥0𝑒𝑡/4 − 𝜆0(𝑒𝑡/4 − 𝑒−𝑡/4),
```
𝜆 = 𝜆0𝑒−𝑡/4
that are level curves of
```
𝐻 = 14 𝜆(𝑥 − 𝜆). (7.2)
```
So how does this all come together? We have three free parameters 𝑥0, 𝜆0, 𝑇, and
```
three endpoint conditions 𝑥(0) = −1, 𝑥(𝑇) = 1, and 𝐻(𝑇) = −2𝛼(𝑇 − 4).
```
```
First, match 𝑥(0) = −1 and 𝑥(𝑇) = 1 to yield (as in Example 7.1, and with
```
```
some simplification)
```
𝜆0 = − 𝑒
𝑇/4
```
𝑒𝑇/4 − 1 . (7.3)
```
```
Next, we solve for 𝑇 using 𝐻(𝑇) = −2𝛼(𝑇 − 4). We use the fact that 𝐻
```
```
is constant on optimal trajectories (this is a cool trick!), so 𝐻(𝑇) = 𝐻(0) =1
```
```
4 𝜆0(𝑥0 − 𝜆0) from equation (7.2), and we get
```
1
```
4 𝜆0(−1 − 𝜆0) = −2𝛼(𝑇 − 4).
```
```
Keep in mind that 𝜆0 is dependent on 𝑇 (equation (7.3)), and so the full hideous
```
expression is
1
```
4 (−
```
𝑒𝑇/4
```
𝑒𝑇/4 − 1 ) (−1 +
```
𝑒𝑇/4
```
𝑒𝑇/4 − 1 ) = −2𝛼(𝑇 − 4)
```
which simplifies to
𝑒𝑇/4
```
8(𝑒𝑇/4 − 1)2 = 𝛼(𝑇 − 4).
```
The optimal value for 𝑇 is where the transcendental expression on the left
```
side of the equality intersects the line 𝛼(𝑇 − 4) on the right. Solving for 𝑇 directly
```
110 Chapter 7. Linear-Quadratic Systems
```
won’t work (transcendentals and polynomials don’t mix very well), so we numer-
```
ically approximate. For example, when 𝛼 = 1 the intersection is approximately
```
𝑇 = 4.109 . . . (Figure 7.9).
```
Figure 7.9. Intersection of line and transcendental function,
with close-up.
Here the solution balances the end penalty against the running costs to take
a bit more time and reach the end condition a little later than the optimal 𝑇 = 4
in order to save on running costs.
As 𝛼 → ∞ the penalty increases, the slope of the line increases, the value
for the optimal 𝑇 converges to 𝑇 = 4, and our solution converges to that found
in Example 7.1. As 𝛼 → 0 we get 𝑇 → ∞ and the limiting trajectory is the
straight line trajectory 𝑥 = −𝑒−𝑡/4, 𝜆 = −𝑒−𝑡/4 that approaches the origin along
```
the incoming eigendirection (see Figure 7.1) and never reaches 𝑥 = 1.
```
Key Points
Linear-quadratic systems are the simplest form of control problem to have enough con-
vexity to produce meaningful locally optimal controls and apply to a broad array of
control problems.
These systems produce state-costate dynamics that are linear systems of differen-
tial equations, and thus they allow solutions for hands-on study and geometric inter-
pretations.
Exercises 111
Exercises
```
Exercise 7.1(s). Consider the controlled exponential decay system 𝑥′ = −𝑥 + 𝑢 with
```
quadratic cost on control 𝐽 = ∫𝑇012 𝑢2 𝑑𝑡.
```
(a) Find the minimum cost for 𝑥(0) = 1 and 𝑥(1) = −1. Plot the trajectory as a
```
level curve of 𝐻 in state-costate space.
```
(b) Find the minimum cost for 𝑥(0) = 1 and 𝑥(𝑇) = −1 for a fixed 𝑇 > 0. Plot
```
some representative trajectories in state-costate space for various values of 𝑇.
```
(c) Find the minimum cost for 𝑥(0) = 2 and 𝑥(𝑇) = 1 for a fixed 𝑇. Plot some
```
representative trajectories in state-costate space. Explain solutions for very small and
very large values of 𝑇. Do any solutions have zero cost?
```
Exercise 7.2(s). As in the previous exercise, consider the system 𝑥′ = −𝑥 + 𝑢 with
```
```
running costs 𝑔(𝑢) = 12 𝑢2. Suppose we have a fixed starting point 𝑥(0) = 2, a fixed
```
```
time 𝑇 > 0,and free end location 𝑥(𝑇).
```
```
(a) For 𝐽 = 𝑥(𝑇)2 + ∫𝑇012 𝑢2 𝑑𝑡, find the minimizing solution for 𝑇 = 1. Describe
```
the minimizing solution for very small and very large values of 𝑇. Use level curves of
𝐻 in the state-costate space to explain your findings.
```
(b) For 𝐽 = (𝑥(𝑇) − 1)2 + ∫𝑇012 𝑢2 𝑑𝑡, find the minimizing solution for 𝑇 = 1.
```
Describe the minimizing solution for very small and very large values of 𝑇. Use level
curves of 𝐻 in the state-costate space to explain your findings.
```
Exercise 7.3. Consider the system 𝑥′ = 𝑢, starting location 𝑥(0) = 1, and performance
```
```
𝐽 = ∫𝑇012 (𝑥2 − 𝑢2) 𝑑𝑡 (as in Example 7.3).
```
```
What is the optimal control if 𝑇 = 1 is fixed, but 𝑥(𝑇) is free? What is the optimal
```
```
control for any fixed 𝑇 with 𝑥(𝑇) free? Explain using level curves of 𝐻 in the (𝑥, 𝜆)-
```
plane. Plot representative trajectories for 0 < 𝑇 < 𝜋/2, for 𝜋/2 < 𝑇 < 𝜋, and for
𝜋 < 𝑇 < 3𝜋/2.
```
Exercise 7.4. Consider the system 𝑥′ = 𝑢, starting location 𝑥(0) = 1, end location
```
```
𝑥(𝑇) = 2, and performance 𝐽 = ∫𝑇012 (𝑥2 − 𝑢2) 𝑑𝑡 (as in Example 7.3).
```
```
(a) Verify that 𝐽(𝑇) = (4 − 5 cos(𝑇))/(2 sin(𝑇)).
```
```
(b) Verify that 𝐻 = (5 − 4 cos(𝑇))/(2 sin2(𝑇)).
```
Now suppose the payoff is
```
𝐽 = −10(𝑇 − 1)2 + ∫
```
𝑇
0
1
```
2 (𝑥2 − 𝑢2) 𝑑𝑡.
```
```
(c) Compute 𝐽(𝑇) for any given 𝑇. Numerically approximate any local maxima for
```
0 < 𝑇 < 𝜋.
```
(d) For 𝑇 free, use Principle III to numerically approximate values for 𝑇 that pro-
```
```
duce local maxima for 0 < 𝑇 < 𝜋. Does this confirm your result in part (c)?
```
```
(e) Is there a global maximum?
```
112 Chapter 7. Linear-Quadratic Systems
```
Exercise 7.5(s). Consider the system from Example 7.3 with 𝑥′ = 𝑢 and performance
```
```
𝐽 = ∫𝑇012 (𝑥2 − 𝑢2)𝑑𝑡. Set the endpoint conditions to be 𝑥(0) = −1, 𝑥(𝑇) = 1.
```
```
(a) Find the maximal solution for a given 𝑇. Plot 𝐽(𝑇) as a function of 𝑇. Over
```
what range of values 𝑇 > 0 does this approach appear to be valid?
```
(b) The solution in part (a) breaks down for 𝑇 = 𝜋. Show that 𝑥(𝑡) = − cos(𝑡) +
```
```
𝜆0 sin(𝑡) with control 𝑢 = sin(𝑡) + 𝜆0 cos(𝑡) satisfies the boundary conditions at 𝑇 = 𝜋,
```
satisfies Principle III, and produces 𝐽 = 0 for all values of 𝜆0. Plot a few trajectories for
various values of 𝜆0 on the state-costate space. Why did this solution not show up in
```
part (a)?
```
```
Exercise 7.6(h). Consider the system from Example 7.3 with 𝑥′ = 𝑢 and performance
```
```
𝐽 = 4𝑇(2−𝑇)+∫𝑇012 (𝑥2 −𝑢2)𝑑𝑡. Set the endpoint conditions to be 𝑥(0) = −1, 𝑥(𝑇) = 1.
```
```
(a) Solve this assuming a fixed value for 𝑇 in the range 0 < 𝑇 < 𝜋 and plot the
```
payoff 𝐽 as a function of time 𝑇. What is the approximate maximum payoff in this
range?
```
(b) Now assume 𝑇 is free. Show that you get the same maximum payoff applying
```
Principle III with free 𝑇.
Exercise 7.7. Consider the general linear case 𝑥′ = 𝑚𝑥 + 𝑢 with 𝐽 = ∫𝑇0 𝑎𝑥2 + 𝑏𝑢2 𝑑𝑡.
```
What happens when 𝑏 = 0? Argue that there are no optimal solutions; 𝐽 can be as
```
large, positive or negative, as you want.
```
Exercise 7.8(hs). Consider the case 𝑥′ = 𝑢 with 𝐽 = 𝐺(𝑇, 𝑥(𝑇))+∫𝑇0 𝑢2 𝑑𝑡 for a general
```
```
differentiable function 𝐺. Taking 𝑥(0) = 0, describe the solution for all combinations
```
```
(fixed or free) of endpoint conditions 𝑇, 𝑥(𝑇).
```
Exercise 7.9. Show that discounting the future in a linear-quadratic system can be
simplified with a change of variables.
Consider
𝑥′ = 𝑚𝑥 + 𝑢
with performance
𝐽 = ∫
𝑇
0
```
𝑒−𝛾𝑡(𝑎𝑥2 + 𝑏𝑢2) 𝑑𝑡.
```
```
(a) Introduce variableŝ 𝑥 and̂ 𝑢 with
```
̂𝑥 = 𝑒−𝛾𝑡/2 𝑥,̂
𝑢 = 𝑒−𝛾𝑡/2 𝑢
Exercises 113
and convert the system to a linear-quadratic system
```
̂𝑥′ = (𝑚 − 𝛾2 )̂𝑥 +̂ 𝑢
```
with performance
𝐽 = ∫
𝑇
0
𝑎̂𝑥2 + 𝑏̂𝑢2 𝑑𝑡.
```
(b) Is 𝑚 = 𝛾/2 special? Why?
```
8
Two Dimensions
In this chapter we generalize the optimization principle to higher dimensions, where
the state of the system is described by a vector of state variables, extending the scope of
our tools to a wider variety of models. Our main focus will be two-dimensional state
spaces which allows us to model acceleration caused by physical forces. By generaliz-
ing to two dimensions, it becomes clearer how the theory would apply to any number
of dimensions.
Many problems involve minimizing time, so our first higher-dimensional principle
will allow free endtime. Higher-dimensional state spaces also allow for more general
endpoint conditions, which can be a bit trickier, and this will be addressed in the next
chapter.
115
116 Chapter 8. Two Dimensions
8.1 Optimal Control in Two Dimensions
OPTIMAL PRINCIPLE IV
Local optimum, free duration, fixed endpoint, time dependent, two dimensions
Consider the controlled system
```
( 𝑥
```
′1
```
𝑥′2) = (
```
```
𝑓1(𝑥1, 𝑥2, 𝑢, 𝑡)
```
```
𝑓2(𝑥1, 𝑥2, 𝑢, 𝑡) ) , 𝑥1, 𝑥2, 𝑡 ∈ ℝ, 𝑢 ∈ 𝒰,
```
with fixed endpoint conditions
```
𝑥1(0) = 𝐴1, 𝑥1(𝑇) = 𝐵1,
```
```
𝑥2(0) = 𝐴2, 𝑥2(𝑇) = 𝐵2
```
and objective function
```
𝐽 = 𝐺(𝑇) + ∫
```
𝑇
0
```
𝑔(𝑥1, 𝑥2, 𝑢, 𝑡) 𝑑𝑡.
```
Define the Hamiltonian
```
𝐻(𝑥1, 𝑥2, 𝜆1, 𝜆2, 𝑢, 𝑡) = 𝑔 + 𝜆1𝑓1 + 𝜆2𝑓2
```
and costate equations
𝜆′1 = − 𝜕𝐻𝜕𝑥1,
𝜆′2 = − 𝜕𝐻𝜕𝑥2.
Then a locally optimal control must satisfy
𝜕𝐻
𝜕𝑢 = 0
and the control 𝑢 that optimizes 𝐽 will optimize 𝐻 at all times.
The ending time 𝑇 may be prescribed. Otherwise, the optimal ending time
will satisfy
𝜕𝐺
```
𝜕𝑇 (𝑇) + 𝐻(𝑇) = 0.
```
Furthermore, if 𝐻 does not explicitly depend on 𝑡, it is constant on optimal trajec-
tories.
This two-dimensional principle is stated using numerical subscripts 𝑥1, 𝑥2, 𝜆1, 𝜆2
to more clearly see the effect of dimension and how the principle would generalize to
any finite number of dimensions. In practice we will focus on applying the principle
```
in two dimensions. The examples will be phrased in terms of (𝑥, 𝑦)-coordinates and
```
corresponding symbolic subscripts 𝜆𝑥, 𝜆𝑦 for ease and clarity.
8.2 Thrust Programming and Rocket Sleds
8.2.1 Thrust Programming. Lots of models incorporate second derivatives, with
accelerations and forces being natural objects for examination. Taking control 𝑢 to be
8.2. Thrust Programming and Rocket Sleds 117
thrust, here are some scenarios for control:
```
System: Model for:
```
𝑥″ = −𝑟𝑥′ + 𝑢 Linear motion
𝑥″ = −𝜅 − 𝑟𝑥′ + 𝑢 Vertical motion in constant gravity
𝑥″ = −𝑥 − 𝑟𝑥′ + 𝑢 Oscillator
```
Any of these can be taken as frictionless by taking 𝑟 = 0; otherwise we assume a positive
```
coefficient of friction 𝑟 > 0.
Typical choices for performance 𝐽 = ∫ 𝑔 𝑑𝑡 include:
𝐠: Optimize for:
1 time
|𝑢| net thrust
𝑢2 cost
Performance may also depend on position by augmenting one of the above with a func-
tion of 𝑥. For example, 𝑔 = 𝑢2 +𝑥2 represents a need to conserve thrust but also remain
close to 𝑥 = 0.
Future payoffs can also be discounted by including a time-dependent 𝑒−𝛼𝑡 term.
One class of problems referred to as “soft-landing” problems are where the task is
to bring the system to rest 𝑥′ = 0 at the origin 𝑥 = 0.
Second-order differential equations with state variable 𝑥 are analyzed by convert-
ing to a system of two first-order differential equations with the introduction of a ve-
locity variable 𝑦 = 𝑥′, making a two-dimensional state space.
8.2.2 Rocket Sleds. We will cover a number of examples and exercises for a sim-
ple thrust control system that we refer to as Rocket Sleds. Acceleration of the sled is
modeled as
𝑥″ = −𝑟𝑥′ + 𝑢
where our control 𝑢 is the thrust. For the Rocket Sled examples, we standardize the
coefficient of friction 𝑟 = 1, which produces exponential solutions. For exercises we
```
consider the frictionless case 𝑟 = 0 (Rocket Sled on Ice), which has polynomial solu-
```
```
tions (easier to work with!).
```
We will consider three possibilities for performance: cost of the thrust 𝐽 = ∫𝑇0 𝑢2 𝑑𝑡,
time of travel 𝐽 = 𝑇, or a combination of both 𝐽 = ∫𝑇0 1 + 𝑢2 𝑑𝑡. This gives us quite a
few possibilities to consider.
The Rocket Sled problems and exercises will create a template that directly applies
to a wide variety of problems from robotic control to adjusting satellite orbits.
118 Chapter 8. Two Dimensions
Example 8.1: Rocket Sled
We have the one-dimensional thrust system with viscous friction
𝑥″ = −𝑟𝑥′ + 𝑢
where we control thrust 𝑢. In one unit of time, 𝑇 = 1, we want to move this
```
system from rest, 𝑥′(0) = 0, at location 𝑥(0) = −1 to rest, 𝑥′(1) = 0, at location
```
```
𝑥(1) = 0 while minimizing
```
𝐽 = ∫
1
0
𝑢2 𝑑𝑡.
With 𝑦 = 𝑥′ and taking 𝑟 = 1 we have the system
𝑥′ = 𝑦,
𝑦′ = −𝑦 + 𝑢.
The Hamiltonian is
```
𝐻 = 𝑢2 + 𝜆𝑥𝑦 + 𝜆𝑦(−𝑦 + 𝑢)
```
which will be constant on optimal trajectories. Optimal control must satisfy
0 = 𝜕𝐻𝜕𝑢 = 2𝑢 + 𝜆𝑦
making 𝑢 = − 12 𝜆𝑦. Note 𝜕2𝐻𝜕ᵆ2 < 0 so minimizing is appropriate. We have the
following set of state and costate equations:
𝑥′ = 𝑦,
𝑦′ = −𝑦 − 12 𝜆𝑦,
𝜆′𝑥 = 0,
𝜆′𝑦 = −𝜆𝑥 + 𝜆𝑦.
We solve this system of differential equations by first solving for 𝜆𝑥 and 𝜆𝑦, then
```
solving for 𝑦, then 𝑥. We get (∗ verify this ∗)
```
𝑥 = − 12 𝑎𝑡 − 14 𝑏𝑒𝑡 − 𝑐𝑒−𝑡 + 𝑑,
𝑦 = − 12 𝑎 − 14 𝑏𝑒𝑡 + 𝑐𝑒−𝑡,
𝜆𝑥 = 𝑎,
𝜆𝑦 = 𝑎 + 𝑏𝑒𝑡
with four integration constants 𝑎, 𝑏, 𝑐, 𝑑.
Using boundary conditions
```
𝑥(0) = −1, 𝑦(0) = 0, 𝑥(1) = 0, 𝑦(1) = 0
```
8.2. Thrust Programming and Rocket Sleds 119
we have four linear equations in four unknowns 𝑎, 𝑏, 𝑐, 𝑑:
```
𝑥(0) = −1 = − 14 𝑏 − 𝑐 + 𝑑,
```
```
𝑦(0) = 0 = − 12 𝑎 − 14 𝑏 + 𝑐,
```
```
𝑥(1) = 0 = − 12 𝑎 − 14 𝑏𝑒 − 𝑐𝑒−1 + 𝑑,
```
```
𝑦(1) = 0 = − 12 𝑎 − 14 𝑏𝑒 + 𝑐𝑒−1.
```
These equations are linear in the unknowns and can be readily solved with
a symbolic processor. It is actually not too bad to solve this system by hand: one
could start by subtracting the second and fourth equations to get 𝑏 = −4𝑐/𝑒, and
subtracting the third and fourth equations to get 𝑑 = 2𝑐/𝑒, substituting these into
```
the first equation to get 𝑐 = −𝑒/(3 − 𝑒), and so on. This will lead to optimal
```
trajectory
𝑥 = 𝑒
```
1−𝑡 − 𝑒𝑡 + 𝑡(1 + 𝑒) − 2
```
3 − 𝑒
```
at a cost of 𝐽 = (1 + 𝑒)/(3 − 𝑒). Plots of state 𝑥(𝑡) and control 𝑢(𝑡) are shown in
```
Figure 8.1.
Figure 8.1. State and control for optimal solution plotted against time.
Different values of final time 𝑇 produce different solutions, as shown in Fig-
```
ure 8.2 plotted as trajectories (𝑥(𝑡), 𝑦(𝑡)) in the position/velocity plane.
```
120 Chapter 8. Two Dimensions
Figure 8.2. Optimal solutions in position-velocity state space
for various values of allowed time 𝑇.
For these endpoint conditions, the cost as a function of end time is
```
𝐽(𝑇) = 𝑒
```
𝑡 + 1
```
𝑇 + 2 + 𝑒𝑇 (𝑇 − 2) = (𝑇 − 2 tanh(
```
𝑇
```
2 ))
```
−1
.
```
This is monotonically decreasing (more time reduces cost) with 𝐽(𝑇) → 0 as
```
𝑇 → ∞. The limiting control would be 𝑢 ≡ 0, which gets you nowhere. So
if 𝑇 is allowed to be free in this example, we wouldn’t actually get a solution,
another case of a sequence of improving controls that do not converge to anything
```
meaningful (as in Example 7.2).
```
Allowing 𝑇 to be free in this example creates a meaningless situation, as is often
the case when 𝑇 is free and without any additional cost. If we add a cost for time, we
usually get reasonable solutions, as in the following examples.
Example 8.2: Rocket Sled, Free 𝑇
Consider the one-dimensional thrust system with viscous friction
𝑥″ = −𝑥′ + 𝑢
and performance
𝐽 = ∫
𝑇
0
1 + 𝑢2 𝑑𝑡
```
with 𝑥(0) = −1, 𝑥′(0) = 0, 𝑥(𝑇) = 0, 𝑥′(𝑇) = 0, and 𝑇 free.
```
```
Having the same end conditions 𝑥(0) = −1, 𝑦(0) = 0, 𝑥(𝑇) = 0, and
```
```
𝑦(𝑇) = 0 doesn’t change any of the initial calculations in the previous example
```
8.2. Thrust Programming and Rocket Sleds 121
```
(∗ check this ∗), so we still have
```
𝑥 = − 12 𝑎𝑡 − 14 𝑏𝑒𝑡 − 𝑐𝑒−𝑡 + 𝑑,
𝑦 = − 12 𝑎 − 14 𝑏𝑒𝑡 + 𝑐𝑒−𝑡,
𝜆𝑥 = 𝑎,
𝜆𝑦 = 𝑎 + 𝑏𝑒𝑡
with four integration constants 𝑎, 𝑏, 𝑐, 𝑑.
Final time 𝑇 is free, and so we have five free parameters 𝑎, 𝑏, 𝑐, 𝑑, 𝑇. We have
```
the four constraints 𝑥(0) = −1, 𝑦(0) = 0, 𝑥(𝑇) = 0, and 𝑦(𝑇) = 0. Principle
```
```
IV supplies 𝐻(𝑇) = 0 as the fifth constraint, allowing us to solve for the five
```
unknowns.
There are several approaches to implementing this fifth constraint. I think
the following is about as clean as it gets. We know that 𝐻 is constant on optimal
trajectories, and substituting control and costate into the Hamiltonian produces
```
(∗ verify ∗)
```
𝐻 = 1 − 14 𝑎2 − 𝑏𝑐 = 0.
Our five constraints are then
```
𝑥(0) = −1 = − 14 𝑏 − 𝑐 + 𝑑,
```
```
𝑦(0) = 0 = − 12 𝑎 − 14 𝑏 + 𝑐,
```
```
𝑥(𝑇) = 0 = − 12 𝑎𝑇 − 14 𝑏𝑒𝑇 − 𝑐𝑒−𝑇 + 𝑑,
```
```
𝑦(𝑇) = 0 = − 12 𝑎 − 14 𝑏𝑒𝑇 + 𝑐𝑒−𝑇 ,
```
𝐻 = 0 = 1 − 14 𝑎2 − 𝑏𝑐.
In the previous example, the solution involved solving four equations for four
unknowns 𝑎, 𝑏, 𝑐, 𝑑 which, for any given 𝑇, were linear in the unknowns and
could be solved directly. In this example 𝑇 is free and solving for the optimal 𝑇 is
part of the problem. This leads to the above five equations with five unknowns
𝑎, 𝑏, 𝑐, 𝑑, 𝑇, which are not linear: we have terms 𝑎2, 𝑒𝑇 , and 𝑒−𝑇 . This significantly
complicates the solution.
To tackle this problem, we recommend using a computer algebra system and
the following steps. Note that the first four equations are linear in 𝑎, 𝑏, 𝑐, 𝑑, and
so we solve these four equations for any given 𝑇 to get
```
𝑎 = −2(𝑒
```
```
𝑇 + 1)
```
```
𝑇(𝑒𝑇 + 1) − 2(𝑒𝑇 − 1) ,
```
```
𝑏 = 4𝑇(𝑒𝑇 + 1) − 2(𝑒𝑇 − 1) ,
```
𝑐 = −𝑒
𝑇
```
𝑇(𝑒𝑇 + 1) − 2(𝑒𝑇 − 1) ,
```
```
𝑑 = −𝑇(𝑒
```
```
𝑇 + 1) + 𝑒𝑇 − 1
```
```
𝑇(𝑒𝑇 + 1) − 2(𝑒𝑇 − 1) .
```
122 Chapter 8. Two Dimensions
```
From these we can derive (∗ check these steps ∗)
```
𝑢 = − 12 𝜆𝑦 = 1 − 2𝑒
𝑡 + 𝑒𝑇
```
𝑇(𝑒𝑇 + 1) − 2(𝑒𝑇 − 1)
```
and compute
𝐽 = ∫
𝑇
0
1 + 𝑢2 𝑑𝑡 = 𝑒
```
𝑇 (𝑇 − 1)2 + (𝑇 + 1)2
```
```
𝑒𝑇 (𝑇 − 2) + 𝑇 + 2 = 𝑇 + (𝑇 − 2 tanh(
```
𝑇
```
2 ))
```
−1
,
as plotted in Figure 8.3. This is the cost for any specified end time 𝑇.
Figure 8.3. Performance as a function of allowed time 𝑇.
We locate the minimum of this function by numerically approximating 𝑇 =
2.576 . . . as a solution to 𝜕𝐽𝜕𝑇 = 0. The minimizing solution is plotted in the posi-
tion/velocity plane in Figure 8.4.
Figure 8.4. Optimal solution for free time 𝑇 with associated
cost occurs at 𝑇 = 2.576 . . . .
8.2. Thrust Programming and Rocket Sleds 123
It is of interest to note that the condition 𝜕𝐽𝜕𝑇 = 0 is algebraically equivalent
```
to the fifth condition above, 0 = 1 − 𝑎2/4 − 𝑏𝑐 (this takes some work to show).
```
Recall that Pontryagin’s principles establish necessary, not sufficient, conditions
for optimality. In some cases, applying the principle produces several candidate so-
lutions, not all of which may be locally optimal, or even reasonable solutions to the
original problem.
Example 8.3: Rocket Sled, Free 𝑇, Multiple Solutions
Continuing with the Rocket Sled 𝑥″ = −𝑥′ + 𝑢 and 𝐽 = ∫𝑇0 1 + 𝑢2 𝑑𝑡 with free
```
endtime 𝑇 and soft-landing criteria 𝑥(0) = 𝑦(0) = 0, we consider a more general
```
```
starting point (𝑥0, 𝑦0).
```
```
If we take (𝑥0, 𝑦0) = (−2, 3) and use the methods of the previous example to
```
search for solutions that satisfy Principle IV, we find two, as plotted in Figure 8.5.
Figure 8.5. Two locally optimal trajectories in position-
velocity space, one in reverse time.
```
One of the solutions is in backward time (after all, we never required 𝑇 > 0).
```
This is the solution on the left in the graph and is actually the solution to traveling
```
from 𝑥(0) = 0, 𝑦(0) = 0, to 𝑥(𝑇) = −2, 𝑦(𝑇) = 3. So the whole loop is the solution
```
```
from the starting point, stopping at (0, 0) and then returning to the starting point.
```
```
If we take (𝑥0, 𝑦0) = (−1, 3) and search for solutions, we find four, plotted in
```
Figure 8.6, one in negative time and three in positive time.
124 Chapter 8. Two Dimensions
Figure 8.6. Four locally optimal trajectories in position-
velocity space, one in reverse time.
We know the optimal solution must satisfy the conditions that generated
these solutions, we know these are all the possible solutions that arise from those
conditions, and so the optimal solution must be one of these. We discard the neg-
ative time solution and then calculate performance for the remaining three solu-
```
tions (see Figure 8.7) and find that the optimal is the third (rightmost) solution.
```
Figure 8.7. Three locally optimal forward time trajectories in
```
position-velocity space; one is globally optimal.
```
How did these multiple solutions arise as we moved 𝑥0 from −2 to −1? Keep-
ing initial velocity at 𝑦0 = 3 and taking 𝑥0 closer to 0, it takes ever increasing
```
amounts of fuel to rocket the sled to the origin (0, 0) without changing directions.
```
At about 𝑥0 = −1.150 . . . a more efficient solution emerges that overshoots the
target and then comes back. This solution uses less fuel but takes a bit more time,
for a net savings in performance.
8.3. Zermelo onna Boat 125
The intermediary solution with 𝐽 = 6.023 . . . is not a local minimum. This
is significant: the solution satisfies all properties of Principle IV, including the
minimization condition 𝜕2𝐻𝜕2ᵆ > 0, and yet it is not a local minimum for the 𝑇 free
case. The Pontryagin conditions are necessary, not sufficient: they must be true
at a local optimum, but do not guarantee a local optimum.
Solving for the optimal solution for a range of fixed end time values 𝑇, we
plot the optimal performance 𝐽 as a function of 𝑇 in Figure 8.8.
Figure 8.8. Performance as a function of allowed time 𝑇.
This shows the two local minimum solutions. One is a fast solution that
conserves time and uses a lot of thrust to proceed monotonically to zero with
𝐽 = 5.720 . . . at 𝑇 = 0.892 . . . , and one is a slower solution that conserves thrust
but takes more time by overshooting and then returning to zero producing 𝐽 =
5.518 . . . at 𝑇 = 3.022 . . . .
If 𝐽 is a continuous function of 𝑇 and has minima at 𝑇 = 0.892 . . . and 𝑇 =
3.022 . . . , then there must be a local maximum between these times. The local
max in this plot appears at 𝑇 = 1.405 . . . with 𝐽 = 6.022 . . . and is at a cusp
between prioritizing thrust or prioritizing time. To be clear: if we were to specify
𝑇 = 1.405 . . . , then this is the optimal solution for that fixed value of 𝑇. The key is
that we could do better if we were given either a bit more or a bit less time. This is
similar to the multiple solutions we found in the soap film catenoid, Example 5.7,
where we had two clear minimizers with one unstable solution in the middle.
These examples indicate a rich structure of the solution space for Rocket Sled prob-
lems. Exercise 8.1 is formulated to explore this geometry in the easier no-friction case.
8.3 Zermelo onna Boat
Zermelo problems are classic navigational problems formulated as steering a boat un-
der conditions of variable wind and water current. Working with this formulation pro-
vides excellent insight into optimal control that extends well beyond navigational mod-
els. The following is a basic Zermelo navigation problem that leads to the linear tangent
law.
126 Chapter 8. Two Dimensions
Example 8.4: Zermelo
In the gathering dusk, the good Captain Zermelo is piloting a unit-speed boat
with no inertia on a sea with no name. Captain Zermelo’s sagely hand lay upon
```
the tiller, and in his keen eye glints the North Star. (His other eye don’t glint too
```
```
good.)
```
```
The water itself heaves at a shear. At location (𝑥, 𝑦) on the map, the water is
```
moving east at speed 𝜅𝑦, shown in Figure 8.9.
Figure 8.9. Zermelo navigation.
Captain Zermelo must navigate this vector field of moving water in a boat
which has constant unit speed relative to the water and can be pointed in any
```
direction he wishes. If Zermelo is at location (𝑥, 𝑦) and has his boat turned to an
```
angle 𝜃 from due east, his resulting velocity is then
𝑥′ = 𝜅𝑦 + cos 𝜃,
𝑦′ = sin 𝜃.
```
The good Captain Zermelo is charged to pilot his craft from location (𝑎, 𝑏) to
```
```
location (𝑐, 𝑑) in the very least amount of time. Pray tell: how does he do it?
```
```
Note that there is no acceleration in this model; it is a two-dimensional prob-
```
lem involving direction and speed.
```
The angle 𝜃 is our control variable. To minimize time we take 𝑔(𝑥, 𝑦, 𝜃, 𝑡) = 0
```
```
and 𝐺(𝑇) = 𝑇. Our Hamiltonian is then
```
```
𝐻 = 𝜆𝑥(𝜅𝑦 + cos 𝜃) + 𝜆𝑦 sin 𝜃.
```
8.3. Zermelo onna Boat 127
Our costate equations are
𝜆′𝑥 = 0,
𝜆′𝑦 = −𝜅𝜆𝑥.
```
Hence 𝜆𝑥 is constant and 𝜆𝑦 = 𝜆𝑥(𝐶 − 𝜅𝑡) for some constant 𝐶 (we chose this
```
```
form to make things come out cleaner later on).
```
The condition
0 = 𝜕𝐻𝜕𝜃 = −𝜆𝑥 sin 𝜃 + 𝜆𝑦 cos 𝜃
determines the control variable in terms of the costate variables
tan 𝜃 =
𝜆𝑦
𝜆𝑥= 𝐶 − 𝜅𝑡.
This is called the linear tangent law, and it shows up frequently in these types of
problems. Using some basic right-angle trigonometry, we get
```
sin(𝜃) = 𝐶 − 𝜅𝑡
```
```
±√1 + (𝐶 − 𝜅𝑡)2
```
```
, cos(𝜃) = 1
```
```
±√1 + (𝐶 − 𝜅𝑡)2
```
where the sign on the square root is either positive for both equations or negative
for both. We see that for optimal control, the horizontal component of steering,
```
cos(𝜃), never changes sign, while the vertical component, sin(𝜃), might.
```
The resulting differential equations
```
𝑥′ = 𝜅𝑦 ± (1 + (𝐶 − 𝜅𝑡)2)−1/2,
```
```
𝑦′ = ±(𝐶 − 𝜅𝑡)(1 + (𝐶 − 𝜅𝑡)2)−1/2
```
```
can be solved in closed form (a computer algebra system is recommended!). The
```
solution for positive square roots is
```
𝑥 = 𝐴 + 𝐵𝜅𝑡 + 𝜅2 (𝐶 − 𝜅𝑡)√1 + (𝐶 − 𝜅𝑡)2 + 𝜅−22 arcsinh(𝐶 − 𝜅𝑡),
```
```
𝑦 = 𝐵 − √1 + (𝐶 − 𝜅𝑡)2
```
and for negative square roots it is
```
𝑥 = 𝐴 + 𝐵𝜅𝑡 − 𝜅2 (𝐶 − 𝜅𝑡)√1 + (𝐶 − 𝜅𝑡)2 − 𝜅−22 arcsinh(𝐶 − 𝜅𝑡),
```
```
𝑦 = 𝐵 + √1 + (𝐶 − 𝜅𝑡)2.
```
The two constants of integration, 𝐴, 𝐵, together with the unknowns 𝐶 and 𝑇
```
can be used to match the endpoint conditions (𝑎, 𝑏) and (𝑐, 𝑑).
```
```
For example, with 𝜅 = 1 the optimal path from (−1, −1) to (2, 1) can be solved
```
using the positive square roots. The solution takes 𝑇 = 3.178 . . . time units and
is shown as in Figure 8.10.
128 Chapter 8. Two Dimensions
Figure 8.10. Optimal Zermelo trajectory in state space.
```
Another example with 𝜅 = 1 is an optimal path from (−5, 0) to (0, 0) taking
```
𝑇 = 3.572 . . . time units, shown in Figure 8.11.
```
Figure 8.11. Optimal trajectory from (−5, 0) to (0, 0).
```
The differential equations in the Zermelo example can be quite challenging
to solve. A simplifying change of variables and a more tractable version of the
problem are explored in the Exercises 8.5 and 8.6.
Note the similarity and differences between the Zermelo system and the Rocket
Sled system from Section 8.2.2 with zero friction. Both have the same underlying sys-
tem 𝑥′ = 𝑦, 𝑦′ = 0. The Rocket Sled system has a control 𝑢 that can be of any magnitude
but only operates in the 𝑦-direction, and the goal is to minimize fuel 𝐽 = ∫ 𝑢2 𝑑𝑡. The
Zermelo system has a control of fixed magnitude but can be pointed in any direction
𝜃, and the goal is to minimize time.
In Section 5.2 we explored how the Principle of Optimality applies in state-costate
space. For time minimizing problems, where our performance function was simply
𝐽 = 𝑇, the principle applies directly to state space: if a minimal time path from point 𝐴
8.3. Zermelo onna Boat 129
to point 𝐶 passes through point 𝐵, then it must be minimal time from point 𝐴 to point
𝐵 and minimal time from point 𝐵 to point 𝐶. The following example shows how we
can use this to interpret our state space trajectories.
Example 8.5
In the previous example, we constructed a time optimal trajectory from 𝐴 =
```
(−1, 1) to 𝐶 = (2, 1) which required 𝑇 = 3.178 . . . time units. If we take 𝐵 to
```
```
be any point on this path, say, 𝐵 = (𝑥(2), 𝑦(2)), then the same path is optimal
```
from 𝐴 to 𝐵 and from 𝐵 to 𝐶.
```
To be clear, computing 𝑥(𝑡), 𝑦(𝑡) as the optimal trajectory from (−1, 1) to
```
```
(2, 1), we find 𝑥(2) = −0.2126 . . . and 𝑦(2) = 0.7154 . . . , as shown in Figure
```
```
8.12. This (𝑥(𝑡), 𝑦(𝑡)) curve is also the optimal path from (−1, 1) to (−0.2126 . . . ,
```
```
0.7154 . . . ), which would require 2 time units, and the optimal path from
```
```
(−0.2126 . . . , 0.7154 . . . ) to (2, 1), which would require 𝑇 = 1.178 . . . time units.
```
Figure 8.12. Optimal trajectory from 𝐴 to 𝐶 passes through 𝐵.
We can also extrapolate this idea backwards in time and create a rather fas-
cinating structure for cases where the terminal location is fixed. For example, fix
```
the terminal location to be the origin. A minimal time trajectory (𝑥(𝑡), 𝑦(𝑡)) start-
```
```
ing at (1, 1) will reach (0, 0) in 𝑇 = 1.779 . . . time units and is shown in Figure
```
8.13. We can extend this trajectory backwards in time by plugging in negative
values of 𝑡, say, 𝑡 = −1. For values 𝑡 = −1, 0, 1.779 . . . we get
```
(𝑥(−1), 𝑦(−1)) = (−0.0448 . . . , 1.913 . . . ),
```
```
(𝑥(0), 𝑦(0)) = (1, 1),
```
```
(𝑥(1.779 . . . ), 𝑦(1.779 . . . )) = (0, 0).
```
130 Chapter 8. Two Dimensions
```
Figure 8.13. Trajectory from (1, 1) to (0, 0) extended back-
```
wards in time.
```
If we were to compute the minimum time trajectory from (−0.0448 . . . ,
```
```
1.913 . . . ) to (0, 0), we would find that it takes 𝑇 = 2.779 . . . time units to reach
```
```
the origin, and this trajectory passes through (1, 1) at time 𝑡 = 1. Continuing to
```
extend this trajectory backwards in time creates an infinite curve that contains
the forward minimal time trajectory to the origin for any starting point on the
curve.
```
Fixing the terminal location at the origin, each starting location (𝑥0, 𝑦0) gen-
```
```
erates a unique optimal trajectory terminating at (0, 0). The set of all minimum
```
time trajectories for all starting locations generates a set of curves that fills up the
plane and only intersect at the origin, as depicted in Figure 8.14.
```
Figure 8.14. A collection of minimal time trajectories to (0, 0).
```
This is a map Captain Zermelo could use to find the fastest route home from
any point on the plane.
8.4. The Brachistochrone Problem 131
8.4 The Brachistochrone Problem
```
The brachistochrone (in Greek brachistos = shortest, chronos = time) problem has a
```
```
rich mathematical history (check out the Wikipedia entry). In a vertical plane, what is
```
```
the shape of the curve down which a frictionless bead will slide from point (𝑥𝑎, 𝑦𝑎) to
```
```
point (𝑥𝑏, 𝑦𝑏) in minimal time?
```
There are several historical approaches to the solution. The earliest mention of
this problem seems to have been by Galileo in 1638, where he incorrectly stated that
it would be the arc of a circle. In June 1696, Johann Bernoulli posed the problem in
Acta Eruditorum. Several mathematicians responded with a solution, including New-
ton and Leibniz who then engaged in an extended quibble over who solved it first.
The brachistochrone concept is so iconic that it even earned a mention in Herman
Melville’s Moby Dick as the author described the motion of a piece of soapstone sliding
in a cauldron.
The surprise is that the solution curves are segments of cycloids: paths traced by a
point on a rolling circle. The following is a standard solution using the techniques we
have developed.
Example 8.6: Brachistochrone
```
Consider two given points (0, 0) and (𝑥𝑏, 𝑦𝑏), 𝑥𝑏 > 0, 𝑦𝑏 ≤ 0, on a vertical plane
```
```
and a path connecting them. We allow a bead to start at rest at (0, 0) and slide
```
down the path driven only by gravity and without friction. For what shape of the
```
path will the bead reach (𝑥𝑏, 𝑦𝑏) in minimal time (if such a minimal path exists)?
```
```
The optimal path from (0, 0) to (5, −1.5) is shown in Figure 8.15.
```
Figure 8.15. Brachistochrone trajectory.
We solve this problem using optimal control principles. Motivated by Zer-
```
melo’s boat, we take the angle of the curve 𝜃 = arctan(𝑦′/𝑥′) as our control vari-
```
able, and we assume − 𝜋2 ≤ 𝜃 ≤ 𝜋2 with 𝜃 = 0 being horizontal.
The solution begins by using conservation of energy 12 𝑚𝑠2 +𝑚𝑔𝑦 ≡ 0 to solve
```
for speed 𝑠 as only depending on the (negative) 𝑦-coordinate:
```
𝑠 = √−2𝑔𝑦.
132 Chapter 8. Two Dimensions
The equations of motion are then
𝑥′ = √−2𝑔𝑦 cos 𝜃,
𝑦′ = √−2𝑔𝑦 sin 𝜃.
```
With 𝜃 as our control we want to minimize 𝑇 subject to the restrictions 𝑥(𝑇) = 𝑥𝑏,
```
```
𝑦(𝑇) = 𝑦𝑏. Applying Principle IV with 𝑔(𝑥, 𝑦, 𝜃, 𝑡) = 0 and 𝐺(𝐴, 𝐵, 𝑇) = 𝑇, our
```
Hamiltonian is
𝐻 = 𝜆𝑥√−2𝑔𝑦 cos 𝜃 + 𝜆𝑦√−2𝑔𝑦 sin 𝜃
```
= √−2𝑔𝑦 (𝜆𝑥 cos 𝜃 + 𝜆𝑦 sin 𝜃) .
```
```
(8.1)
```
Our costate equations are
−𝜆′𝑥 = 0,
```
−𝜆′𝑦 = √− 𝑔2𝑦 (𝜆𝑥 cos 𝜃 + 𝜆𝑦 sin 𝜃)
```
making 𝜆𝑥 constant.
The stationarity condition
```
0 = 𝜕𝐻𝜕𝜃 = √−2𝑔𝑦 (−𝜆𝑥 sin 𝜃 + 𝜆𝑦 cos 𝜃)
```
determines the control variable 𝜃 in terms of the costate variables:
tan 𝜃 =
𝜆𝑦
```
𝜆𝑥. (8.2)
```
We could now try to solve our system of four differential equations with boundary
```
conditions 𝑥(0) = 0, 𝑦(0) = 0, 𝑥(𝑇) = 𝑥𝑏, and 𝑦(𝑇) = 𝑦𝑏. This gets really messy.
```
The following clever tricks make for a better approach. Keep in mind this is
a famous problem, worked over by mathematicians for many years. The solution
presented here may feel like it comes out of nowhere, but it is a method that has
evolved over time as a good approach through the complicated details.
Since 𝑇 is free, we have by Principle IV that 0 = 𝜕𝐺𝜕𝑇 + 𝐻. With 𝜕𝐺𝜕𝑇 = 1 and
𝐻 constant on optimal trajectories, we get 𝐻 ≡ −1 on optimal trajectories. Then
```
equation (8.1) yields
```
```
−1 = √−2𝑔𝑦 (𝜆𝑥 cos 𝜃 + 𝜆𝑦 sin 𝜃) . (8.3)
```
```
Clever Trick #1: From equation (8.2) we have 𝜆𝑦 = 𝜆𝑥 sin 𝜃/ cos 𝜃. Substi-
```
```
tute this into equation (8.3) to conclude (∗ check this ∗)
```
```
− cos(𝜃) = √−2𝑔𝑦 𝜆𝑥. (8.4)
```
```
This holds for all 𝑡. Taking 𝑡 = 0, 𝑦(0) = 0, we get 𝜃(0) = − 𝜋2 , so we al-
```
ways start off sliding straight down. This makes sense: we want to build up some
velocity as quickly as possible.
8.4. The Brachistochrone Problem 133
```
Clever Trick #2: Differentiate equation (8.4) with respect to time
```
```
sin(𝜃) 𝑑𝜃𝑑𝑡 = √− 𝑔2𝑦𝑑𝑦𝑑𝑡
```
```
and substitute the equation of motion 𝑦′ = √−2𝑔𝑦 sin 𝜃 to conclude (∗ check
```
```
this ∗)
```
𝑑𝜃
𝑑𝑡 = −𝑔𝜆𝑥.
From this and the fact that 𝜆′𝑥 = 0, we have that 𝜃 is linear in time. Rather
interesting. I don’t know why that should be the case, other than the fact that it
is.
```
This pretty much reveals our control function: 𝜃(𝑡) = −𝑡𝑔𝜆𝑥 − 𝜋/2. Now it’s
```
```
just a matter of finding the right value for the constant 𝜆𝑥 to connect start (0, 0)
```
```
to end (𝑥𝑏, 𝑦𝑏).
```
```
Taking 𝑡 = 𝑇 and writing 𝜃(𝑇) = 𝜃𝑇 in equation (8.4) we can solve for the
```
constant
𝜆𝑥 = − cos 𝜃𝑇
√−2𝑔𝑦𝑏
```
(8.5)
```
making
𝑑𝜃
𝑑𝑡 = √
𝑔
```
−2𝑦𝑏cos 𝜃𝑇 . (8.6)
```
```
Now substitute 𝜆𝑥 from equation (8.5) back into equation (8.4) and solve for
```
```
𝑦, yielding the succinct expression (∗ verify ∗)
```
𝑦 = 𝑦𝑏cos
```
2(𝜃)
```
```
cos2(𝜃𝑇 ) .
```
This expresses 𝑦 as a function of 𝜃, suggesting that we try to parameterize
the curve with respect to 𝜃 rather than 𝑡. We just need to get 𝑥 as a function of 𝜃,
which we can do by using. . .
Clever Trick #3: Express 𝑑𝑥/𝑑𝜃 as a function of 𝜃 using the equation of
```
motion 𝑥′ = √−2𝑔𝑦 cos 𝜃 and equation (8.6) to get
```
𝑑𝑥
𝑑𝜃 =
𝑑𝑥
𝑑𝑡
𝑑𝜃
𝑑𝑡
= √−2𝑔𝑦 cos 𝜃
√
𝑔
−2𝑦𝑏cos 𝜃𝑇
= −2𝑦𝑏 cos
2 𝜃
cos2 𝜃𝑇.
Now integrate this with respect to 𝜃 using the initial value of 𝑥 = 0 when 𝜃 =
```
−𝜋/2 to get (∗ verify ∗)
```
```
𝑥 = −𝑦𝑏𝜋+2𝜃+sin(2𝜃)2 cos2 𝜃𝑇,
```
```
𝑦 = 𝑦𝑏cos2(𝜃)cos2(𝜃𝑇 ) .
```
```
(8.7)
```
These expressions for 𝑥 and 𝑦 yield a cycloid—the curve traced by a point on
```
the perimeter of a rolling wheel (see Exercise 8.9).
```
Knowing that the optimal path is a cycloid provides a geometric interpreta-
```
tion of the solution: from the set of cycloids that start at (0, 0), choose the one
```
```
that passes through (𝑥𝑏, 𝑦𝑏) (see Figure 8.16.
```
134 Chapter 8. Two Dimensions
```
Figure 8.16. Cycloids originating from (0, 0) are brachis-
```
tochrone trajectories.
Key Points
In this chapter we vectorized our methods allowing for a multidimensional state space.
Our main focus was two-dimensional state spaces but the methods stated in Principle
IV generalize to any finite number of dimensions. Principle IV allows for a free end-
time. Free endpoint conditions will be explored in the next chapter.
Two dimensions allow for modeling forces and accelerations, and examples demon-
strate how the theory applies to thrust in physical systems. We examined cases of mul-
tiple local optimums.
We studied Zermelo navigation that involved steering a unit speed vehicle and saw
the linear tangent law, a form that often arises in such systems.
We took a careful look at the brachistochrone problem, a classic mathematical
construct with fascinating properties that has intrigued scholars for well over 300 years.
Exercises
```
Exercise 8.1(hs). Rocket Sled on Ice, Fixed T. Consider Example 8.1 in the case of no
```
```
friction: for 𝑥″ = 𝑢 and soft-landing endpoint conditions
```
```
(𝑥(0), 𝑦(0)) = (𝑥0, 𝑦0), (𝑥(𝑇), 𝑦(𝑇)) = (0, 0).
```
Find the control that minimizes
𝐽 = ∫
𝑇
0
𝑢2 𝑑𝑡
for a given fixed 𝑇.
```
(a) Plot some representative trajectories in the (𝑥, 𝑦)-plane. Perhaps choose a fixed
```
```
starting point (𝑥0, 𝑦0) and plot the trajectory for a few different values of 𝑇. Or fix 𝑇
```
and plot a few different starting points.
```
(b) Starting at 𝑥0 = −1 and 𝑦0 = 0, compute performance 𝐽(𝑇) as a function of
```
stopping time 𝑇. Does 𝐽 attain a local minimum value? What happens as 𝑇 → ∞?
Exercises 135
```
Exercise 8.2(hs). Rocket Sled on Ice, Free T. Consider Example 8.2 in the case of no
```
```
friction: minimize
```
𝐽 = ∫
𝑇
0
1 + 𝑢2 𝑑𝑡 = 𝑇 + ∫
𝑇
0
𝑢2 𝑑𝑡
with 𝑥″ = 𝑢 and specific endpoint conditions
```
(𝑥(0), 𝑦(0)) = (−1, 0), (𝑥(𝑇), 𝑦(𝑇)) = (0, 0).
```
```
(a) Compute performance 𝐽(𝑇) as a function of stopping time 𝑇. How does this
```
compare to the performance in Exercise 8.1? Does 𝐽 attain a local minimum value?
```
(b) Solve the problem assuming 𝑇 is free, using 𝜕𝐺𝜕𝑇 + 𝐻 = 0. Do you get the same
```
```
answer as in part (a)?
```
```
Exercise 8.3(hs). Rocket Sled on Ice, Free T, multiple solutions. Consider Example 8.3
```
in the case of no friction and a general starting point: minimize
𝐽 = ∫
𝑇
0
1 + 𝑢2 𝑑𝑡 = 𝑇 + ∫
𝑇
0
𝑢2 𝑑𝑡
with 𝑥″ = 𝑢 and specific endpoint conditions
```
(𝑥(0), 𝑦(0)) = (𝑥0, 𝑦0), (𝑥(𝑇), 𝑦(𝑇)) = (0, 0)
```
where 𝑇 is free.
```
(a) Derive performance 𝐽 as a function of 𝑇, 𝑥0, and 𝑦0 and compute the partial
```
derivative 𝜕𝐽𝜕𝑇 .
```
(b) Find conditions on (𝑥0, 𝑦0) under which 𝜕𝐽𝜕𝑇 = 0 will have multiple zeros in 𝑇.
```
```
(c) Identify the points in the second quadrant (𝑥0 < 0, 𝑦0 > 0) that have multiple
```
```
zeros with 𝑇 > 0 from part (b). These are the starting points where multiple positive
```
```
time solutions to Principle IV are possible. Plot the region in the (𝑥0, 𝑦0)-plane, plot
```
some representative trajectories, and determine the minimizing solution.
```
Exercise 8.4(s). Rocket Sled on Ice, geometry. Consider the frictionless Rocket Sled
```
system in Exercise 8.1, 𝑥″ = 𝑢, fixed 𝑇,
𝐽 = ∫
𝑇
0
𝑢2 𝑑𝑡.
```
(a) Solve for 𝑥(0) = −1, 𝑥′(0) = 1 to 𝑥(1) = 0, 𝑥′(1) = 0.
```
```
(b) Solve for 𝑥(0) = 0, 𝑥′(0) = 0 to 𝑥(1) = 1, 𝑥′(1) = 1. (Use what you have from
```
```
(a).)
```
```
(c) What value of 𝐵 would have the least cost for 𝑥(0) = 0, 𝑥′(0) = 1 to 𝑥(1) = 𝐵,
```
```
𝑥′(1) = 1? (Think of an easy solution.)
```
```
Exercise 8.5(h). Consider Zermelo onna Boat (Example 8.4), 𝑥′ = 𝜅𝑦 + cos(𝜃), 𝑦′ =
```
```
sin(𝜃) and with starting point 𝑥(0) = 𝑥0, 𝑦(0) = 𝑦0 and ending point 𝑥(𝑇) = 𝑥1,
```
```
𝑦(𝑇) = 𝑦1.
```
136 Chapter 8. Two Dimensions
Show that the change of variables
̃𝑥 = 𝑥 − 𝑥0 − 𝑦0𝜅𝑡,̃
𝑦 = 𝑦 − 𝑦0
```
satisfies the same differential equations̃ 𝑥′ = 𝜅̃𝑦 + cos(𝜃),̃ 𝑦′ = sin(𝜃) but with starting
```
```
conditions̃ 𝑦(0) = 0,̃ 𝑥(0) = 0 and ending conditions̃ 𝑥(𝑇) = 𝑥1 − 𝑥0 − 𝑦0𝜅𝑇,̃ 𝑦(𝑇) =
```
𝑦1 − 𝑦0.
While still challenging, this change makes the solution more tractable by standard-
izing on trajectories that start at the origin.
```
Exercise 8.6(s). Consider Zermelo onna Boat (Example 8.4), with a circular water flow
```
```
𝑥′ = −𝑦 + cos(𝜃),
```
```
𝑦′ = 𝑥 + sin(𝜃)
```
```
where we want to navigate from (𝑥0, 𝑦0) to (𝑥1, 𝑦1) in minimum time.
```
```
(a) Show that any optimal solution will have 𝜃 = 𝑡 + 𝛼 for some constant 𝛼.
```
```
(b) Find the optimal path from (0, 0) to (𝑥1, 𝑦1), and plot a few representative tra-
```
jectories.
```
(c) What is the general form of a solution starting at (𝑥0, 𝑦0)? Pick a starting point
```
and plot some representative trajectories.
```
(d) Would the optimal path from (1, 0) to (−1, 0) go outside the unit circle or cut
```
inside the unit circle? Find the optimal path and plot.
```
Exercise 8.7(h). How would you modify Principle IV to allow for two controls? Ana-
```
lyze the Zermelo example with vertical and horizontal controls:
𝑥′ = 𝑦 + 𝑢,
𝑦′ = 𝑣.
```
(a) Assume 𝑇 is fixed and performance is 𝐽 = ∫𝑇0 𝑢2 + 𝑣2 𝑑𝑡. Compute and plot
```
```
the optimal trajectory from (−1, −1) to (2, 1) for 𝑇 = 3.
```
```
(b) Assume 𝑇 is free and performance is 𝐽 = 𝑇 + ∫𝑇0 𝑢2 + 𝑣2 𝑑𝑡. Compute and plot
```
```
the optimal trajectory from (−1, −1) to (2, 1). What is the optimal time?
```
```
Exercise 8.8. The brachistochrone solution (Example 8.6) falls apart if 𝑦𝑏 = 0. What
```
```
is the solution in this case? How much time would it take to traverse from (0, 0) to
```
```
(𝑥𝑏, 0)?
```
Exercise 8.9. A cycloid is the curve traced by a point on the rim of a wheel as it rolls
```
down the 𝑥-axis. If the points starts at (0, 0) and the wheel has radius 𝑅, verify that the
```
```
curve is described by the parametric equations 𝑥(𝜏) = 𝑅(𝜏 − sin 𝜏), 𝑦(𝑡) = 𝑅(1 − cos 𝜏).
```
```
Use this to conclude that the solution to the brachistochrone problem (Example 8.6) is
```
a cycloid.
Exercises 137
```
Exercise 8.10(h). In solving the brachistochrone problem (Example 8.6), we assumed
```
speed was related to height by 𝑠 = √−2𝑔𝑦. If we instead assume speed is proportional
to height, 𝑠 = −𝜅𝑦 for some 𝜅 > 0, then the minimum time trajectories are arcs of
circles centered on the line 𝑦 = 0. These paths are geodesics in the hyperbolic half-
plane, so this is another deep connection between optimal control and geometry.
```
Demonstrate this result as follows: take 𝜅 = 1 and assume (𝑥(𝑡), 𝑦(𝑡)) is an optimal
```
```
trajectory with 𝑥(0) = 0, 𝑦(0) = −1, and 𝑦′(0) = 0. Use Principle IV to conclude that
```
```
(𝑥(𝑡), 𝑦(𝑡)) lies on the unit circle 𝑥2 + 𝑦2 = 1.
```
```
Exercise 8.11(hs). Inventory Scheduling. Let 𝐼(𝑡) be inventory level, let 𝑆(𝑡) be sales
```
```
rate, and we control production rate 𝑃(𝑡), so our inventory satisfies 𝐼′ = 𝑃 − 𝑆. We
```
```
assume the system has been operated in a stable configuration with 𝑃(𝑡) = 𝐼(𝑡) =
```
```
𝑆(𝑡) = 1. We also assume that sales will increase slightly if we overproduce and sales
```
```
will decrease slightly if we underproduce. We model this by 𝑆′ = 𝛼(𝑃 − 1). Suppose
```
```
𝛼 = 12 and that at time 𝑡 = 0 we have 𝑆(0) = 1 and 𝐼(0)=1. You need to double the
```
```
inventory in four years, 𝐼(4) = 2, while minimizing production costs ∫40 𝑃2 𝑑𝑡 and
```
```
returning sales to normal, 𝑆(4) = 1. Find and graph the optimal 𝑃(𝑡), 𝐼(𝑡), and 𝑆(𝑡).
```
Comment on your result. Is it what you expected?
9
Targets
Similar to the one-dimensional case, we can extend the two-dimensional principle to
include free endpoints. With higher dimensions we have more options to consider. For
example we could prescribe a terminal value of one of the state coordinates and allow
the other to be free. We can even prescribe the end location to lie on a smooth curve.
This chapter extends the principle to allow for these cases.
9.1 Free Ends
```
Free endpoints in the one-dimensional case covered by Principle III (Section 6.1) allows
```
```
for an indeterminate endpoint 𝑥(𝑇), possibly with an associated end payoff 𝐺(𝑥(𝑇)),
```
and solving for the optimal endpoint becomes part of the optimization problem.
```
For a two-dimensional state (𝑥(𝑡), 𝑦(𝑡)) we can allow one or both end values to be
```
```
indeterminate. For example, suppose that in the Rocket Sled example (Example 8.1)
```
```
we have 𝑇 time units to bring the rocket sled to rest, 𝑥′(𝑇) = 0, but we don’t care where,
```
```
i.e., 𝑥(𝑇) is free. Or suppose that Captain Zermelo (Example 8.4) is racing to a vertical
```
```
finish line, so he seeks to minimize 𝑇 where 𝑥(𝑇) is specified but 𝑦(𝑇) is free.
```
Principle III readily generalizes to handle such cases, where the optimal endpoint
values are determined by each costate being equal to the corresponding partial deriva-
tive of the endpoint payoff function 𝐺.
139
140 Chapter 9. Targets
OPTIMAL PRINCIPLE V
Local optimum, free duration, free endpoint, time dependent, two dimensions
Consider the controlled system
```
(
```
𝑥′1
𝑥′2
```
) = (
```
```
𝑓1(𝑥1, 𝑥2, 𝑢, 𝑡)
```
```
𝑓2(𝑥1, 𝑥2, 𝑢, 𝑡)
```
```
) , 𝑥1, 𝑥2, 𝑡 ∈ ℝ, 𝑢 ∈ 𝒰,
```
```
starting at 𝑥1(0) = 𝐴1, 𝑥2(0) = 𝐴2, and objective function
```
```
𝐽 = 𝐺(𝐵1, 𝐵2, 𝑇) + ∫
```
𝑇
0
```
𝑔(𝑥1, 𝑥2, 𝑢, 𝑡) 𝑑𝑡
```
```
where 𝑥1(𝑇) = 𝐵1 and 𝑥2(𝑇) = 𝐵2.
```
Define the Hamiltonian
```
𝐻(𝑥1, 𝑥2, 𝜆1, 𝜆2, 𝑢, 𝑡) = 𝑔 + 𝜆1𝑓1 + 𝜆2𝑓2
```
and costate equations
𝜆′1 = − 𝜕𝐻𝜕𝑥1,
𝜆′2 = − 𝜕𝐻𝜕𝑥2.
Then a locally optimal control must satisfy
𝜕𝐻
𝜕𝑢 = 0
and the control 𝑢 that optimizes 𝐽 will optimize 𝐻 at all times.
Either or both ending locations may be prescribed. Otherwise, the optimal
```
end location(s) must satisfy
```
```
𝜆1(𝑇) = 𝜕𝐺𝜕𝐵1(𝐵1, 𝐵2, 𝑇),
```
```
𝜆2(𝑇) = 𝜕𝐺𝜕𝐵2(𝐵1, 𝐵2, 𝑇).
```
The end time 𝑇 may be prescribed. Otherwise, the optimal end time 𝑇 will
satisfy
𝜕𝐺
```
𝜕𝑇 (𝐵1, 𝐵2, 𝑇) + 𝐻(𝑇) = 0.
```
Furthermore, if 𝐻 does not explicitly depend on 𝑡, it is constant on optimal trajec-
tories.
Note that you can mix and match the free/fixed end locations. For example speci-
```
fying 𝑥1(𝑇) and allowing 𝑥2(𝑇) to be free makes 𝜆1(𝑇) free and 𝜆2(𝑇) = 𝜕𝐺𝜕𝐵2(𝐵1, 𝐵2, 𝑇).
```
9.1. Free Ends 141
Example 9.1: Rocket Sled, Freeing the Endpoints
```
Returning to Rocket Sled (Example 8.1), we want to minimize the cost of accel-
```
eration 𝐽 = ∫𝑇0 𝑢2 𝑑𝑡 for 𝑥″ = −𝑥′ + 𝑢. In Example 8.1 we derived minimizing
control 𝑢 = − 12 𝜆𝑦 and state-costate trajectories
𝑥 = − 12 𝑎𝑡 − 14 𝑏𝑒𝑡 − 𝑐𝑒−𝑡 + 𝑑,
𝑦 = − 12 𝑎 − 14 𝑏𝑒𝑡 + 𝑐𝑒−𝑡,
𝜆𝑥 = 𝑎,
𝜆𝑦 = 𝑎 + 𝑏𝑒𝑡
with four integration constants 𝑎, 𝑏, 𝑐, 𝑑.
For endpoint conditions, suppose we just want to bring the sled to a full stop
as efficiently as possible and we don’t care where it stops. That is, we are given
```
a fixed amount of time 𝑇, running costs 𝑔 = 𝑢2, a starting point (𝑥0, 𝑦0), and an
```
```
endpoint condition for velocity 𝑦(𝑇) = 0, while position 𝑥(𝑇) is allowed to be any
```
value. Just stop the thing at the specified time.
```
With 𝑥(𝑇) free and no end payoff 𝐺 = 0, Principle V stipulates that 𝜆𝑥(𝑇) = 0
```
for an optimal solution. This imposes four constraints:
```
𝑥(0) = 𝑥0 = − 14 𝑏 − 𝑐 + 𝑑,
```
```
𝑦(0) = 𝑦0 = − 12 𝑎 − 14 𝑏 + 𝑐,
```
```
𝑦(𝑇) = 0 = − 12 𝑎 − 14 𝑏𝑒𝑇 + 𝑐𝑒−𝑇 ,
```
```
𝜆𝑥(𝑇) = 0 = 𝑎
```
which are linear in the four unknowns 𝑎, 𝑏, 𝑐, 𝑑.
Setting 𝑇 = 1, 𝑥0 = 0, and solving for a given 𝑦0 yields
```
𝑥(𝑡) = 𝑦0𝑒
```
```
𝑡 − 1 + 𝑒2(𝑒−𝑡 − 1)
```
1 − 𝑒2 ,
```
𝑦(𝑡) = 𝑦0𝑒
```
𝑡 − 𝑒2−𝑡
1 − 𝑒2 ,
with some representative trajectories plotted in Figure 9.1.
142 Chapter 9. Targets
Figure 9.1. Optimal trajectories to zero velocity for 𝑇 = 1 and
various stating velocities.
Figure 9.2. Optimal trajectories to zero position for 𝑇 = 1 and
various stating velocities.
Switching things up, suppose that we want to get the rocket sled to a specific
position at a specific time but we don’t care about velocity. That is, we have fixed
```
end time 𝑇, a given starting point (𝑥0, 𝑦0), and our end condition is that 𝑥(𝑇) = 0,
```
```
but velocity 𝑦(𝑇) is allowed to be any value. Just hit the target at the specified
```
```
time; we don’t care how fast we are going.
```
9.1. Free Ends 143
```
With 𝑦(𝑇) free and no end payoff 𝐺 = 0, Principle V stipulates that 𝜆𝑦(𝑇) = 0
```
for an optimal solution. This imposes four constraints:
```
𝑥(0) = 𝑥0 = − 14 𝑏 − 𝑐 + 𝑑,
```
```
𝑦(0) = 𝑦0 = − 12 𝑎 − 14 𝑏 + 𝑐,
```
```
𝑥(𝑇) = 0 = − 12 𝑎𝑇 − 14 𝑏𝑒𝑇 − 𝑐𝑒−𝑇 + 𝑑,
```
```
𝜆𝑦(𝑇) = 0 = 𝑎 + 𝑏𝑒𝑇
```
which are linear in the four unknowns 𝑎, 𝑏, 𝑐, 𝑑.
For example, setting 𝑇 = 1, 𝑥0 = −1 and solving for a selection 𝑦0 yields
representative trajectories as shown in Figure 9.2.
```
Note that 𝜆𝑦 = 𝑎 + 𝑏𝑒𝑡 which is monotone in time 𝑡 and 𝜆𝑦(𝑇) = 0, so 𝜆𝑦(𝑡)
```
does not change sign on 0 < 𝑡 < 𝑇. Therefore thrust 𝑢 = − 12 𝜆𝑦 is either always
positive or always negative on an optimal solution. Initial conditions with high
positive velocity require negative thrust to hit 𝑥 = 0 at 𝑇 = 1. Initial conditions
with lower positive or negative initial velocity require positive thrust. One of
these trajectories, starting at 𝑥0 = −1 and 𝑦0 = 1.582 . . . , is perfectly positioned
```
to drift to 𝑥(1) = 1 without applying any thrust, making 𝐽 = 0 and resulting in
```
a straight line segment for the trajectory. We find this trajectory by taking 𝑎 = 0
and 𝑏 = 0 and solving for 𝑏, 𝑐, and 𝑇 to match the endpoint conditions.
```
Example 9.2: Zermelo, Free 𝑦(𝑇)
```
Recall the Zermelo onna Boat Example 8.4, with equations of motion
```
𝑥′ = 𝑦 + cos(𝜃),
```
```
𝑦′ = sin(𝜃)
```
and control variable 𝜃. The goal is to minimize time of travel, so we take
```
𝐺(𝑥(𝑇), 𝑦(𝑇), 𝑇) = 𝑇
```
```
and no running costs 𝑔(𝑥, 𝑦, 𝑢) = 0.
```
```
Suppose we have a prescribed initial position 𝑥(0) = 𝑥0, 𝑦(0) = 𝑦0 and a
```
```
final value for one variable 𝑥(𝑇) = 0, allowing both 𝑇 and 𝑦(𝑇) to be free.
```
The condition tan 𝜃 = 𝜆𝑦/𝜆𝑥 = 𝐶 − 𝑡 remains the same as in Example 8.4, so
we again have the linear tangent law
tan 𝜃 =
𝜆𝑦
```
𝜆𝑥= 𝐶 − 𝑡. (9.1)
```
We intuit that for starting values 𝑥0 > 0 we would never want to steer away from
```
the finish line, and we take cos(𝜃) ≤ 0. Applying right-triangle trigonometry to
```
```
equation (9.1), we conclude
```
```
sin(𝜃) = − 𝐶 − 𝑡
```
```
√1 + (𝐶 − 𝑡)2
```
```
, cos(𝜃) = − 1
```
```
√1 + (𝐶 − 𝑡)2
```
.
144 Chapter 9. Targets
```
Substituting these into our equation of motion and integrating, we get (∗ check
```
```
this ∗)
```
```
𝑥(𝑡) = 𝐴 + 𝐵𝑡 − 12 (𝐶 − 𝑡)√1 + (𝐶 − 𝑡)2 + 12 arcsinh(𝐶 − 𝑡),
```
```
𝑦(𝑡) = 𝐵 + √1 + (𝐶 − 𝑡)2.
```
This example differs from Example 8.4 in the endpoint evaluation. In this
```
case we have four free constants 𝐴, 𝐵, 𝐶, 𝑇 and three endpoint conditions 𝑥(0) =
```
```
𝑥𝑎, 𝑦(0) = 𝑦𝑎, and 𝑥(𝑇) = 0. The fourth condition is supplied by Principle
```
```
V: since the final 𝑦 location has no effect on performance, 𝜕𝐺𝜕𝑦 = 0, and hence
```
```
𝜆𝑦(𝑇) = 0. From equation (9.1) we conclude that 𝐶 = 𝑇 (∗ why? ∗). This makes
```
```
𝜃(𝑇) either 0 or 𝜋, meaning that at the final time Zermelo is steering straight into
```
```
(perpendicular to) the 𝑥 = 0 line, which makes intuitive sense (∗ why? ∗).
```
Substituting 𝐶 = 𝑇, we are left with a system of three equations and three
```
unknowns:
```
```
𝑥𝑎 = 𝑥(0) = 𝐴 − 12 𝑇√1 + 𝑇2 + 12 arcsinh(𝑇),
```
```
𝑦𝑎 = 𝑦(0) = 𝐵 + √1 + 𝑇2,
```
```
0 = 𝑥(𝑇) = 𝐴 + 𝐵𝑇
```
which can be solved numerically with some work. A good approach is to elimi-
nate 𝐴 and 𝐵 and get
```
𝑥𝑎 + 𝑇𝑦𝑎 = 12 √1 + 𝑇2 + 12 arcsinh(𝑇).
```
```
Then for any starting (𝑥𝑎, 𝑦𝑎) numerically approximate 𝑇. The set of solution
```
trajectories is depicted in Figure 9.3.
Figure 9.3. Time minimizing paths to 𝑥 = 0 for Zermelo.
Note that trajectories starting with slightly positive 𝑥0 and 0 < 𝑦0 < 1 will
drive straight into the line 𝑥 = 0, while trajectories with 𝑦0 > 1 drift downwards
and away from the line first.
9.2. Hitting a Curve 145
9.2 Hitting a Curve
9.2.1 General Curves. We can expand Principle V so that the required endpoint
condition is for the trajectory to terminate on a specified curve.
OPTIMAL PRINCIPLE VI
Local optimum, free duration, constrained endpoint, time dependent, two dimensions
Consider the controlled system
```
(
```
𝑥′1
𝑥′2
```
) = (
```
```
𝑓1(𝑥1, 𝑥2, 𝑢, 𝑡)
```
```
𝑓2(𝑥1, 𝑥2, 𝑢, 𝑡)
```
```
) , 𝑥1, 𝑥2, 𝑡 ∈ ℝ, 𝑢 ∈ 𝒰,
```
```
starting at 𝑥1(0) = 𝐴1, 𝑥2(0) = 𝐴2 and objective function
```
𝐽 = ∫
𝑇
0
```
𝑔(𝑥1, 𝑥2, 𝑢, 𝑡) 𝑑𝑡
```
```
where 𝑥1(𝑇) = 𝐵1 and 𝑥2(𝑇) = 𝐵2.
```
Define the Hamiltonian
```
𝐻(𝑥1, 𝑥2, 𝜆1, 𝜆2, 𝑢, 𝑡) = 𝑔 + 𝜆1𝑓1 + 𝜆2𝑓2
```
and costate equations
𝜆′1 = − 𝜕𝐻𝜕𝑥1,
𝜆′2 = − 𝜕𝐻𝜕𝑥2.
Then a locally optimal control must satisfy
𝜕𝐻
𝜕𝑢 = 0
and the control that optimizes 𝐽 will optimize 𝐻 at all times.
```
If the end location is required to land on a smooth curve (𝐵1, 𝐵2) ∈ 𝒞, then the
```
```
endpoint criteria is that (𝜆1(𝑇), 𝜆2(𝑇)) is perpendicular to the curve at the point
```
```
(𝑥1(𝑇), 𝑥2(𝑇)).
```
The end time 𝑇 may be prescribed. Otherwise, the optimal end time 𝑇 will
satisfy
```
𝐻(𝑇) = 0.
```
In addition, if 𝐻 does not explicitly depend on 𝑡, it is constant on optimal trajecto-
ries.
```
As with Principle IV (Section 8.1), we state the principle using numerical sub-
```
scripts to emphasize dimensionality and more easily see how the principle would gen-
eralize to higher dimensions. For example, we could require the end state to be on a hy-
persurface, or even require a subset of the end state variables to be on a surface of the ap-
```
propriate dimension. In three dimensions (𝑥1, 𝑥2, 𝑥3) we could require (𝑥2(𝑇), 𝑥3(𝑇))
```
```
to land on a curve while 𝑥1(𝑇) is free. This is handy if we want to move a satellite to a
```
circular orbit of specified radius without specifying where along the orbit it must be at
what time.
146 Chapter 9. Targets
```
In practice, we will stick to two dimensions and revert to (𝑥, 𝑦) coordinates and
```
subscripts. For simplicity and clarity, we have dispensed with the final payoff function
𝐺. The broader theory can incorporate such a payoff, but the above will suffice for our
purposes.
This principle applies to the case where the end conditions are a closed region.
```
For example, we may require |𝑥(𝑇)| ≤ 𝛿𝑥 and |𝑦(𝑇)| ≤ 𝛿𝑦. Principle IV would apply
```
```
by considering the boundary of the region: |𝑥(𝑇)| = 𝛿𝑥 and |𝑦(𝑇)| = 𝛿𝑦. One would
```
also have to consider the possibility that an optimum stopping location is interior to the
target region by examining all local optimal solutions that may exist inside the region.
A key point of this principle is that it reinforces insight into what the costate vari-
ables are:
```
At the terminal point (𝑥(𝑇), 𝑦(𝑇)) = (𝐵𝑦, 𝐵𝑥) of an optimal trajectory the
```
```
costate vector (𝜆𝑥(𝑇), 𝜆𝑦(𝑇)) is the gradient of performance 𝐽 with respect to
```
```
variables (𝐵𝑥, 𝐵𝑦). That is, the costate vector points in the best direction to
```
move the endpoint in order to improve the outcome.
```
Thus if our end state is free, we stop at a place where the costate vector is zero;
```
```
otherwise we could move our end location in the direction of the costate vector (if
```
```
possible) and improve the result. This reflects the property of Lagrange multipliers as
```
the rate of change of optimum with respect to constraint, as explored in Section 2.9.
If our end state is constrained to a curve, we stop at a point where the costate vector
```
is perpendicular to the curve; otherwise we could improve things by moving along the
```
curve in the direction that the costate variable is pointing.
9.2.2 Target lines. Principle VI applies to targets that are horizontal or vertical
lines, and it produces the same results as Principle V.
Example 9.3: Zermelo, Hit Vertical Line 𝑥 = 0
Consider the Zermelo onna Boat Example 8.4,
```
𝑥′ = 𝑦 + cos(𝜃),
```
```
𝑦′ = sin(𝜃).
```
```
Starting at (𝑥𝑎, 𝑦𝑎) the goal is to operate the control 𝜃 to reach the vertical line
```
𝑥 = 0 in minimal time.
We already solved this in Example 9.2. Note that the condition in Principle IV
```
that (𝜆𝑥(𝑇), 𝜆𝑦(𝑇)) is perpendicular to the vertical line 𝑥 = 0 yields the condition
```
```
𝜆𝑦(𝑇) = 0, which is the same as what Principle V gave in Example 9.2.
```
Principle VI applies to any target line and stipulates that the ending value of the
costate vector is perpendicular to the line.
9.2. Hitting a Curve 147
Example 9.4: Rocket Sled, Hit 𝑦 = 𝑥
Returning to Rocket Sled, Example 8.1, we want to minimize 𝐽 = ∫𝑇0 𝑢2 𝑑𝑡 for
𝑥″ = −𝑥′ + 𝑢, with minimal trajectories defined by
𝑥 = − 12 𝑎𝑡 − 14 𝑏𝑒𝑡 − 𝑐𝑒−𝑡 + 𝑑,
𝑦 = − 12 𝑎 − 14 𝑏𝑒𝑡 + 𝑐𝑒−𝑡,
𝜆𝑥 = 𝑎,
𝜆𝑦 = 𝑎 + 𝑏𝑒𝑡.
```
Suppose we have a starting point (𝑥0, 𝑦0), a fixed end time 𝑇, and suppose
```
that our target is now the slanted line 𝑦 = 𝑥.
```
Principle VI requires the costate vector (𝜆𝑥, 𝜆𝑦) to be perpendicular to this
```
line at the point of impact. Using a dot product, this requires
```
0 = (𝜆𝑥(𝑇), 𝜆𝑦(𝑇)) ⋅ (1, 1) = 𝜆𝑥(𝑇) + 𝜆𝑦(𝑇).
```
```
For any starting point 𝑥(0) = 𝑥0, 𝑦(0) = 𝑦0, our constraints are then
```
```
𝑥(0) = 𝑥0 = − 14 𝑏 − 𝑐 + 𝑑,
```
```
𝑦(0) = 𝑦0 = − 12 𝑎 − 14 𝑏 + 𝑐,
```
```
𝑥(𝑇) = 1 = − 12 𝑎𝑇 − 14 𝑏𝑒𝑇 − 𝑐𝑒−𝑇 + 𝑑,
```
```
𝜆𝑥(𝑇) + 𝜆𝑦(𝑇) = 0 = 2𝑎 + 𝑏𝑒𝑇
```
which is linear in the parameters 𝑎, 𝑏, 𝑐, 𝑑.
Taking 𝑇 = 1 and solving for some starting points on a line 𝑦 = 𝑥 + 3 yields
representative trajectories in Figure 9.4.
Figure 9.4. Optimal paths to the line 𝑦 = 𝑥 for 𝑇 = 1 from
various starting points.
148 Chapter 9. Targets
```
Note that one of these trajectories, starting at (−1.254 . . . , 2.254 . . . ), is a straight
```
line segment requiring no thrust and has no cost.
9.2.3 Target Circles. An interesting application of Principle VI is when the target
is a circle centered at the origin 𝑥2 + 𝑦2 = 𝜌2. This can arise as a relaxation of the
soft-landing cases, where you don’t have to exactly hit 𝑥 = 0, 𝑦 = 0, you just have to
get within a circle of radius 𝜌.
```
The costate criteria from Principle VI require the costate vector (𝜆𝑥, 𝜆𝑦) to be per-
```
pendicular to the target curve at the point of intersection. For a circle centered at the
```
origin, this makes the costate vector (𝜆𝑥, 𝜆𝑦) parallel to the position vector (𝑥, 𝑦). This
```
parallel condition can be expressed as 𝑦/𝑥 = 𝜆𝑦/𝜆𝑥, so if our target curve is 𝑥2 +𝑦2 = 𝜌2,
we get the endpoint conditions
```
𝑥(𝑇)2 + 𝑦(𝑇)2 = 𝜌2,
```
```
𝑦(𝑇)
```
```
𝑥(𝑇) =
```
```
𝜆𝑦(𝑇)
```
```
𝜆𝑥(𝑇) .
```
```
(9.2)
```
The following example explores this idea for the brachistochrone problem.
Example 9.5: Brachistochrone, Circle Target
Consider the brachistochrone problem, Example 8.6. Assume we have a vertical
plane with constant gravity and we have a bead at location 𝑥𝑎 on the 𝑥-axis. We
want this bead to slide to the unit circle 𝑥2 + 𝑦2 = 1 in minimal time just using
gravity. Solution curves are shown in Figure 9.5.
Figure 9.5. Minimum time brachistochrone trajectories to the
unit circle.
To derive the set of solution curves, recall that the brachistochrone trajecto-
ries are parameterized by the angle 𝜃 of the tangent to the curve,
𝑑𝑦
𝑑𝑥 =
𝑦′
𝑥′ = tan 𝜃,
```
and that the optimal control is determined by tan(𝜃) = 𝜆𝑦/𝜆𝑥.
```
```
Combining this with equations (9.2) we have that at time 𝑇,
```
```
𝑦′(𝜃𝑇 )
```
```
𝑥′(𝜃𝑇 ) = tan(𝜃𝑇 ) =
```
```
𝜆𝑦(𝑇)
```
```
𝜆𝑥(𝑇) =
```
```
𝑦(𝜃𝑇 )
```
```
𝑥(𝜃𝑇 ) . (9.3)
```
9.2. Hitting a Curve 149
This implies that at the point of reaching the unit circle,
```
𝑦′(𝜃𝑇 )
```
```
𝑥′(𝜃𝑇 ) =
```
```
𝑦(𝜃𝑇 )
```
```
𝑥(𝜃𝑇 ) ,
```
meaning that the velocity vector of the bead is perpendicular to the circle. This
makes sense: you end up driving straight into the target surface to minimize time.
```
Note that since (𝑥(𝑇), 𝑦(𝑇)) is on the unit circle, equation (9.3) implies 𝑦(𝜃𝑇 ) =
```
```
sin(𝜃𝑇 ) and 𝑥(𝜃𝑇 ) = cos(𝜃𝑇 ).
```
```
Our equations for the brachistochrone solutions (Example 8.6, equation (8.7)),
```
```
shifted to start at (𝑥𝑎, 0), are
```
```
𝑥 = 𝑥𝑎 − 𝑦𝑏𝜋 + 2𝜃 + sin(2𝜃)2 cos2 𝜃
```
𝑇
,
𝑦 = 𝑦𝑏cos
```
2(𝜃)
```
```
cos2(𝜃𝑇 ) .
```
```
Given any starting location (𝑥𝑎, 0) we look for terminal values by substituting
```
```
𝑦𝑏 = sin(𝜃𝑇 ) and 𝑥𝑏 = cos(𝜃𝑇 ) into the above equation for 𝑥, to get a single
```
equation
```
cos(𝜃𝑇 ) = 𝑥𝑎 − sin(𝜃𝑇 ) 𝜋 + 2𝜃𝑇 + sin(2𝜃𝑇 )2 cos2 𝜃
```
𝑇
for which we numerically estimate a solution 𝜃𝑇 for any given 𝑥𝑎. This yields our
```
final parameterized optimal path from (𝑥𝑎, 0) on the 𝑥-axis to (𝑥𝑏, 𝑦𝑏) on the unit
```
```
circle:
```
```
𝑥 = 𝑥𝑎 − sin(𝜃𝑇 ) 𝜋 + 2𝜃 + sin(2𝜃)2 cos2 𝜃
```
𝑇
,
```
𝑦 = sin(𝜃𝑇 ) cos
```
```
2(𝜃)
```
```
cos2(𝜃𝑇 ) .
```
Depending on starting location, we have either a positive parameterization −𝜋/2 <
𝜃 < 𝜃𝑇 or a negative parameterization −𝜋/2 > 𝜃 > 𝜃𝑇 .
9.2.4 Target Curves with Endpoints. Implicit in the above principle is that the
curve 𝒞 is differentiable at the terminal point of the optimal trajectory. We can extend
this principle to cases where the curve has an endpoint, as explored in the next example.
Example 9.6: Zermelo, Half-Line
Consider the Zermelo example where the target is the half-line 𝑥 = 0 and 𝑦 ≤ 1/2.
```
Suppose that in the full-line case (Example 9.2) the optimal trajectory (𝑥(𝑡), 𝑦(𝑡))
```
```
from the initial point (𝑥𝑎, 𝑦𝑎) hits the line 𝑥 = 0 at a point where 𝑦 ≤ 12 . Then
```
```
that trajectory is still optimal in the half-line case (∗ why? ∗). Figure 9.6 shows
```
```
the set of optimal trajectory paths from the full-line case (see Figure 9.3) that are
```
still valid for this half-line case.
150 Chapter 9. Targets
Figure 9.6. Optimal trajectories to the line that hit below 𝑦 = 12
remain valid.
```
Figure 9.7. The optimal trajectory from (0, 2) to the half-line
```
extends backwards in time.
We can take any of the trajectories that hit the target from the right and ex-
tend them backwards in time. For example,
```
𝑥(𝑡) = 12 ((3.2692 − 𝑡)√1 + (3.2692 − 𝑡)2 − arcsinh(3.2692 − 𝑡))
```
−4.6381 + 𝑡1.4187,
```
𝑦(𝑡) = √1 + (3.2692 − 𝑡)2 − 1.4187
```
```
is the approximation of an optimal trajectory with 𝑥(0) = 0 and 𝑦(0) = 2. By
```
the Principle of Optimality, for any 𝑡0 > 0 this is the optimal path of travel to the
9.2. Hitting a Curve 151
```
target from the intermediate point 𝑥(𝑡0), 𝑦(𝑡0). This is also true going backwards
```
in time, 𝑡0 ≤ 0, as the trajectory uniquely solves the Pontryagin conditions. This
trajectory, extended backwards in time, is highlighted in Figure 9.7.
Doing this with all the trajectories that hit from the right produces the set of
optimal trajectories for the half-line problem shown in Figure 9.8.
Figure 9.8. All optimal trajectories that hit the half-line from
the right extend backwards in time.
```
This defines a region in the (𝑥, 𝑦)-plane covered by trajectories that hit the
```
half-line along a trajectory from the full-line case.
What are the boundaries of this region? The lower part is bounded by the op-
```
timal trajectory that terminates at (0, 12 ) coming from the left. On the upper part
```
```
it is bounded by the optimal full-line trajectory that terminates at (0, 12 ) coming
```
from the right and its continuation backwards in time to −∞. These trajectories
are highlighted in Figure 9.8.
No optimal trajectory for the half-line case can cross either of these bound-
ary trajectories: if each trajectory is a local minimizer, then we can’t have two
trajectories emerge from the intersection point. Principle of Optimality again.
Now consider the remaining region between the two bounding trajectories.
For any trajectory starting in this region, the only point on the half-line that any
```
optimal trajectory can reach is the point (0, 1/2): the trajectory can’t reach any
```
other point on the half-line without crossing a boundary trajectory. So the solu-
tion for any initial point between these boundary trajectories is a trajectory ter-
```
minating at (0, 1/2). The solution must therefore be the time minimizing from
```
```
the initial point to (0, 1/2), as would be solved in the original Zermelo Example
```
8.4.
The full set of solutions for this problem is shown in Figure 9.9.
152 Chapter 9. Targets
Figure 9.9. Optimal trajectories that don’t hit the line below
```
𝑦 = 1/2 must hit the point (0, 1/2), completing the solution on
```
the plane.
Key Points
Chapter 8 introduced Principle IV which allows for a multidimensional state space and
free end time.
In this chapter we introduced Principles V and VI which allows multidimensional
state space with free end locations, and this requires some consideration for the greater
freedom allowed in the higher dimensions.
Principle V allows for the endpoint of one or both state variables to be free in a
two-dimensional system, and it allows an endpoint payoff function.
Principle VI addresses cases where the endpoint is required to land on a curve or
boundary. The solution illuminates that the costate vector is the gradient of perfor-
mance with respect to restriction.
Exercises
```
Exercise 9.1. The Zermelo examples (Examples 9.2 and 9.3) had Captain Zermelo rac-
```
ing to a vertical line. Explore the case of a horizontal line in the following.
```
(a) What is the optimal solution for a horizontal finish line 𝑦 = 0? In Examples
```
9.2 and 9.3, Zermelo crosses the finish line perpendicularly. Does this still hold?
```
(b) What about a horizontal finish line 𝑦 = 𝑘? What is the optimal solution? Does
```
Zermie cross the finish line perpendicularly? If not, explain why this case differs.
```
Exercise 9.2(hs). Rocket Sled on Ice, Target Line. Consider the frictionless Rocket Sled
```
system in Exercise 8.1, 𝑥″ = 𝑢, for fixed 𝑇 = 1,
𝐽 = ∫
1
0
𝑢2 𝑑𝑡.
Exercises 153
```
(a) Solve for the optimal trajectory starting at (0, 0) and ending on 𝑦 − 𝑥 = 1.
```
```
(b) Investigate the more general target 𝑦 − 𝑚𝑥 = 1 > 0. Describe the different
```
behaviors for 𝑚 < 0, 𝑚 = 0, 0 < 𝑚 < 1, and 𝑚 > 1.
```
(c) Consider the unit circle target 𝑥2 + 𝑦2 = 1. It would be difficult to solve a
```
```
general starting point (𝑥0, 𝑦0) (∗ try it ∗). But here is what you can do: take 𝑡 = 0 as the
```
time of hitting the unit circle, compute conditions for an optimal trajectory, and then
plot these trajectories backwards in time. Do this, plot some representative trajectories,
analyze, and comment.
Exercise 9.3. Example 9.6 had Zermelo racing to a half-line target 𝑥 = 0, 𝑦 ≤ 1/2.
```
Sketch the solutions for the following half-lines (no need to compute—just sketch by
```
```
hand).
```
```
(a) 𝑥 = 0, 𝑦 ≤ 2.
```
```
(b) 𝑦 = 0, 𝑥 ≤ 0.
```
```
(c) 𝑦 = 1, 𝑥 ≤ 0.
```
```
Exercise 9.4(h). Consider the Zermelo example with a circular water flow (as in Ex-
```
```
ercise 8.6):
```
```
𝑥′ = −𝑦 + cos(𝜃),
```
```
𝑦′ = 𝑥 + sin(𝜃).
```
```
(a) Analyze the minimal time path from a general starting point (𝑥0, 𝑦0) to the
```
horizontal line 𝑦 = 0.
```
(b) Analyze the minimal time path from a general starting point (𝑥0, 𝑦0) to the
```
circle 𝑥2 + 𝑦2 = 𝑘.
```
(c) Analyze the minimal time path from the origin (0, 0) to the line 𝑦 = 𝑘. What
```
```
can you say about a more general starting point (𝑥0, 𝑦0)?
```
```
(d) Analyze the minimal time path from a general starting point (𝑥0, 𝑦0) to the
```
half-line 𝑦 = 0, 𝑥 ≤ 0 ?
Exercise 9.5. Continuing with Exercise 8.7, consider Zermelo with horizontal and ver-
tical controls
𝑥′ = 𝑦 + 𝑢,
𝑦′ = 𝑣
```
and an initial position of (𝑥0, 𝑦0). Solve for the optimal solution assuming the follow-
```
ing, and plot a representative trajectory.
```
(a) Suppose 𝑇 is fixed, 𝑦(𝑇) is free, end condition 𝑥(𝑇) = 𝑥1 is given, and perfor-
```
mance is 𝐽 = ∫𝑇0 𝑢2 + 𝑣2 𝑑𝑡.
154 Chapter 9. Targets
```
(b) Suppose 𝑇 is free, 𝑦(𝑇) is free, end condition 𝑥(𝑇) = 𝑥1 is given, and perfor-
```
mance is 𝐽 = 𝑇 + ∫𝑇0 𝑢2 + 𝑣2 𝑑𝑡.
```
(c) Suppose 𝑇 is fixed, 𝑥(𝑇) is free, end condition 𝑦(𝑇) = 𝑦1 is given, and perfor-
```
mance is 𝐽 = ∫𝑇0 𝑢2 + 𝑣2 𝑑𝑡.
```
(d) Suppose 𝑇 is free, 𝑥(𝑇) is free, end condition 𝑦(𝑇) = 𝑦1 is given, and perfor-
```
mance is 𝐽 = 𝑇 + ∫𝑇0 𝑢2 + 𝑣2 𝑑𝑡.
```
Exercise 9.6(hs). Suppose that Captain Zermelo (Example 8.4) starts at location (𝑎, 𝑏)
```
and wants to pilot his boat to get as far to the East as possible in 𝑇 time units. That is,
```
𝑇 is fixed, 𝑥(𝑇) and 𝑦(𝑇) are both free, and you want to maximize 𝑥(𝑇). How does he
```
```
do it? What is 𝜃(𝑇) and why does the value make intuitive sense?
```
```
Exercise 9.7(s). Fun Slide. Determine the shape of a slide that would move the slider
```
a maximum horizontal distance in one minute. That is, use the brachistochrone model
```
with initial position (0, 0), free end location, and payoff function 𝐽 = 𝑥(𝑇). Use Earth
```
```
gravity (𝑔 = −9.8 m/sec2) and no friction, and use a fixed time 𝑇.
```
10
Switching Controls
and Stationarity
Principles I–VI provide necessary conditions for controls to be locally optimal and thus
represent an ideal balance between costs and benefits. In these principles, we saw that
an optimal control will optimize the Hamiltonian 𝐻 at all times. These techniques
work fine when the optimal solution is interior to the set of allowed controls. We iden-
tify these controls by the stationarity condition 𝜕𝐻𝜕ᵆ = 0, and we can distinguish maxi-
mizing and minimizing controls by the sign of 𝜕2𝐻/𝜕𝑢2.
However, many controls are optimized at extremes—cars go the fastest when you
put the pedal to the metal. In calculus max-min problems, we check where the deriv-
ative is zero, but we must also remember to check the endpoints.
This chapter explores cases where there are limitations on 𝑢, say, 𝛼 ≤ 𝑢 ≤ 𝛽, and
the optimum occurs at one of the endpoint values. The key idea is that at every point
```
of an optimal path the optimal control 𝑢 produces the maximum (or minimum) value
```
of 𝐻 over all allowable controls, and this may occur at the limit of allowed values. This
helps us identify when we should operate a control at an extreme of allowed range. In
some interesting cases we switch instantaneously between extreme values, and these
```
are called bang-bang (yes, really) controls.
```
Another possibility is that 𝜕𝐻𝜕ᵆ = 0 with no concavity, 𝜕2𝐻𝜕ᵆ2 = 0, making it unclear
whether the control is a maximum, minimum, or neither. These stationary controls
can form segments of an overall optimal control strategy.
10.1 Extreme Controls
The following motivating example shows where Principle V fails to lead us to an opti-
mal solution. Why, yes, as a matter of fact, this is rocket science.
155
156 Chapter 10. Switching Controls and Stationarity
Example 10.1: Big Silver Rocket Ship
A Big Silver Rocket Ship ascends vertically from a flat Earth with constant gravity
and no air friction. The rocket accelerates by burning fuel at a rate of 𝛽 kg/sec
and ejecting seriously hot gas out its tail end at ludicrous speed 𝜇 m/sec creating
a force of 𝛽𝜇 kg m/sec2. We control the fuel burn rate 𝛽. With a gravitational
constant 𝑔 and spacecraft mass 𝑚 we have the Newtonian equation
𝑚𝑦″ = −𝑔𝑚 + 𝛽𝜇.
Taking into account that our Big Silver Rocket Ship is losing mass at rate 𝛽, we
get the following system:
𝑦′ = 𝑣,
𝑣′ = 𝛽𝜇𝑚 − 𝑔,
𝑚′ = −𝛽.
We want to control the fuel burn rate 𝛽 to lift our Big Silver Rocket Ship to a
height 𝑦𝑇 using as little fuel as possible. So we want to minimize total fuel burn:
𝐽 = ∫
𝑇
0
𝛽 𝑑𝑡
where 𝑇 is free. Our Hamiltonian is
```
𝐻 = 𝛽 + 𝜆1𝑣 + 𝜆2 ( 𝛽𝜇𝑚 − 𝑔) + 𝜆3(−𝛽)
```
with
𝜕𝐻
𝜕𝛽 = 1 + 𝜆2
𝜇
𝑚 − 𝜆3.
This is a problem. The control 𝛽 doesn’t show up in this expression, so setting
𝜕𝐻
𝜕𝛽 to zero doesn’t allow us to solve for 𝛽.
In fact, the solution to this problem is an infinitely positive burn rate 𝛽 = ∞.
```
Fuel is heavy; we don’t want to carry it up with the rocket. The most efficient
```
solution is to burn all the fuel at once right at the beginning, shooting the rocket
like a bullet from a gun with just enough initial velocity to reach the target height.
This is how Jules Verne envisioned launching a rocket in his 1865 novel From
Earth to Moon.
Previously, we looked for locally optimal solutions by satisfying 𝜕𝐻𝜕ᵆ = 0. However,
the key idea is that 𝐻 is optimized on optimal trajectories. If there are restrictions on
our control, then we want 𝐻 to be as optimal as possible given those restrictions. At
any point on an optimal trajectory, we choose the control value from the set of allowed
values that produces the most extreme value of 𝐻. This is made explicit in the following
principle.
10.1. Extreme Controls 157
OPTIMAL PRINCIPLE VII
Global optimum, free duration, free endpoint, time dependent, two dimensions
Consider the controlled system
```
(
```
𝑥′1
𝑥′2
```
) = (
```
```
𝑓1(𝑥1, 𝑥2, 𝑢, 𝑡)
```
```
𝑓2(𝑥1, 𝑥2, 𝑢, 𝑡)
```
```
) , 𝑥1, 𝑥2, 𝑡 ∈ ℝ, 𝑢 ∈ 𝒰,
```
```
starting at 𝑥1(0) = 𝐴1, 𝑥2(0) = 𝐴2 and objective function
```
```
𝐽 = 𝐺(𝐵1, 𝐵2, 𝑇) + ∫
```
𝑇
0
```
𝑔(𝑥1, 𝑥2, 𝑢, 𝑡) 𝑑𝑡
```
```
where 𝑥1(𝑇) = 𝐵1 and 𝑥2(𝑇) = 𝐵2.
```
Define the Hamiltonian
```
𝐻(𝑥1, 𝑥2, 𝜆1, 𝜆2, 𝑢, 𝑡) = 𝑔 + 𝜆1𝑓1 + 𝜆2𝑓2
```
and costate equations
𝜆′1 = − 𝜕𝐻𝜕𝑥1,
𝜆′2 = − 𝜕𝐻𝜕𝑥2.
If̃ 𝑢 maximizes 𝐽 and satisfies the endpoint conditions, then at all times
```
𝐻(𝑥1, 𝑥2, 𝜆1, 𝜆2,̃ 𝑢, 𝑡) ≥ 𝐻(𝑥1, 𝑥2, 𝜆1, 𝜆2, 𝑢, 𝑡)
```
for all admissible controls 𝑢, and if̃ 𝑢 minimizes 𝐽, then at all times
```
𝐻(𝑥1, 𝑥2, 𝜆1, 𝜆2,̃ 𝑢, 𝑡) ≤ 𝐻(𝑥1, 𝑥2, 𝜆1, 𝜆2, 𝑢, 𝑡)
```
for all admissible controls 𝑢.
Either or both ending locations may be prescribed. Otherwise the optimal end
```
location(s) must satisfy
```
```
𝜆1(𝑇) = 𝜕𝐺𝜕𝐵1(𝐵1, 𝐵2, 𝑇),
```
```
𝜆2(𝑇) = 𝜕𝐺𝜕𝐵2(𝐵1, 𝐵2, 𝑇).
```
The end time 𝑇 may be prescribed. Otherwise, the optimal end time 𝑇 will
satisfy
𝜕𝐺
```
𝜕𝑇 (𝐵1, 𝐵2, 𝑇) + 𝐻(𝑇) = 0.
```
Note that as we consider controls at operational extremes, we may lose the condi-
tion that 𝐻 is constant on optimal trajectories.
This principle makes it clear that to optimize performance 𝐽, the control at any
specific time must produce the most optimal value of 𝐻 for the given set of allowed
controls. This concept holds regardless of whether the control is a locally optimal con-
trol or an extreme control at the boundary of allowable controls.
158 Chapter 10. Switching Controls and Stationarity
More precisely, for a maximization problem and for any given current values of
state 𝑥1, 𝑥2 and costate 𝜆1, 𝜆2 we want to choose the control̃ 𝑢 from the set of allow-
```
able controls 𝒰 that maximizes 𝐻(𝑥1, 𝑥2, 𝜆1, 𝜆2, 𝑢, 𝑡), and we can express this concept
```
succinctly with the argmax function as
```
̃𝑢 = argmaxᵆ∈𝒰 {𝐻(𝑥1, 𝑥2, 𝜆1, 𝜆2, 𝑢, 𝑡)} .
```
That is, for any given state position 𝑥1, 𝑥2, costate position 𝜆1, 𝜆2, and at any time 𝑡, we
```
have that̃ 𝑢 is the value in 𝒰 that produces a maximum for 𝐻(𝑥1, 𝑥2, 𝜆1, 𝜆2, 𝑢, 𝑡).
```
Pontryagin takes the daunting task of optimizing a cumulative measure 𝐽 = ∫ 𝑔 𝑑𝑡
over a trajectory in state space and recasts the problem, using a differential form of
Lagrange multipliers, into optimizing an instantaneous measure 𝐻 at every point along
a trajectory in state-costate space.
This was demonstrated in the proofs from Section 6.3 where we showed that if the
```
costate equations are satisfied, then (see equations (6.2) and (6.3))
```
```
Δ𝐽∗ = 𝐽∗(𝑥, 𝑢 + 𝛿2, 𝜆) − 𝐽∗(𝑥, 𝑢, 𝜆)
```
```
= ∫𝑇0𝜕𝐻𝜕ᵆ (𝑥, 𝑢) 𝛿2 𝑑𝑡 + 𝑜(𝛿2)
```
```
≈ ∫𝑇0 𝐻(𝑥, 𝑢 + 𝛿2) − 𝐻(𝑥, 𝑢) 𝑑𝑡 + 𝑜(𝛿2).
```
Now suppose 𝐻 is monotone in 𝑢, say, 𝜕𝐻𝜕ᵆ > 0. Then by the above, you can always
increase performance 𝐽 by increasing 𝑢 to 𝑢 + 𝛿2. So one would increase 𝑢 up to the
boundary of allowable controls.
10.2 Bang-Bang Controls
Many optimal control problems involve operating the control value as large or as small
as it can possibly go. Some problems require switching between extreme values of the
control, referred to as bang-bang controls.
Example 10.2: Big Silver Rocket Ship II
Returning to the Big Silver Rocket Ship, Example 10.1, suppose we have restric-
tions on our burn rate: 0 ≤ 𝛽 ≤ 𝛽max.
The Hamiltonian is
```
𝐻 = 𝛽 + 𝜆1𝑣 + 𝜆2 ( 𝛽𝜇𝑚 − 𝑔) + 𝜆3(−𝛽) (10.1)
```
which is linear in our control 𝛽:
𝜕𝐻
𝜕𝛽 = 1 + 𝜆2
𝜇
𝑚 − 𝜆3.
We want to minimize 𝐻, so if 𝜕𝐻𝜕𝛽 > 0, we take 𝛽 = 0, and if 𝜕𝐻𝜕𝛽 < 0, we take
𝛽 = 𝛽max.
10.2. Bang-Bang Controls 159
To be clear, at any given time the plot of 𝐻 as a function of 𝛽 is a line. As time
proceeds the slope of this line may change. If the line is sloped downwards, we
maximize our control, 𝛽 = 𝛽max, and if the line is sloped upwards, we minimize
our control, 𝛽 = 0. If the slope of the line changes from negative to positive, we
immediately switch from 𝛽 = 0 to 𝛽 = 𝛽max. This is a bang-bang solution where
we switch from one extreme to the other when 𝜕𝐻𝜕𝛽 changes sign.
We can analyze how the slope 𝜕𝐻𝜕𝛽 evolves in time. We have costate equations
𝜆′1 = 0,
𝜆′2 = −𝜆1,
𝜆′3 = 𝜆2𝛽𝜇𝑚2
```
making 𝜆1 a constant, 𝜆1 = 𝜅. Differentiating equation (10.1) we have
```
𝑑
𝑑𝑡
𝜕𝐻
𝜕𝛽 = 𝜆
′2𝜇
𝑚 − 𝜆2
𝜇
𝑚2 𝑚
′ − 𝜆′3
```
= −𝜅 𝜇𝑚 − 𝜆2𝜇𝑚2 (−𝛽) − 𝜆2𝛽𝜇𝑚2
```
= −𝜅 𝜇𝑚
and thus 𝜕𝐻𝜕𝛽 is monotonically decreasing in time. The change in control occurs
when this slope switches from positive to negative. This indicates that an optimal
```
control will have a single switch from on (maximum burn) to off (zero burn).
```
```
Also note that with 𝑇 and 𝑣(𝑇) free, we have from Principle VII that 𝐻(𝑇) = 0
```
```
and 𝜆2(𝑇) = 0. Assuming 𝜆1 = 𝜅 is nonzero and 𝛽 = 0 at time 𝑇, we can plug
```
```
into the Hamiltonian and conclude 𝑣(𝑇) = 0 (∗ check ∗), verifying our intuition
```
that the rocket reaches the endpoint height condition at apogee.
This defines the form of an optimal solution. We have two periods, starting
```
with 0 ≤ 𝑡 ≤ 𝑇burn where we have 𝛽 = 𝛽max and initial conditions 𝑦(0) = 0,
```
```
𝑣(0) = 0, and we burn all of our fuel in this phase. Then we have the second
```
period 𝑇burn < 𝑡 ≤ 𝑇 where we coast with 𝛽 = 0 which ends with the prescribed
```
height 𝑦(𝑇) = 𝑦𝑇 , zero velocity 𝑣(𝑇) = 0, and mass equal to the unfueled rocket
```
```
weight 𝑚(𝑇) = 𝑚𝑇 . The trick is to solve for the correct 𝑇burn given the required
```
height 𝑦𝑇 , rocket weight 𝑚𝑇 , and maximum burn rate 𝛽max.
In Exercise 10.1 we outline the solution steps to get a 1,000 kg rocket up to
25 km with exhaust velocity 800 m/sec and maximum burn rate of 𝛽max = 60
kg/sec, and we show that the optimal solution is to burn at the maximum rate for
```
39 seconds and then coast for 59 seconds. Height 𝑦(𝑡) and velocity 𝑣(𝑡) for this
```
solution is plotted in Figure 10.1.
160 Chapter 10. Switching Controls and Stationarity
Figure 10.1. Height and velocity for optimal control plotted
against time.
Note that this problem has a three-dimensional state space, with Principle
VII easily accommodating the additional dimension.
10.3 Rocket Races
Consider the Rocket Sled examples: 𝑥″ = −𝑥′ + 𝑢, but now instead of conserving fuel,
we want to minimize time: 𝐽 = ∫𝑇0 1 𝑑𝑡 or 𝐽 = 𝑇, with 𝑇 free. We will refer to these
minimum time problems as Rocket Race problems. To prevent infinite burn rates we
restrict |𝑢| ≤ 1.
Example 10.3: Rocket Race I
Consider the system
𝑥′ = 𝑦,
𝑦′ = −𝑦 + 𝑢
```
with control bounded by |𝑢| ≤ 1 and we want to transition from (𝑥𝑎, 𝑦𝑎) to
```
```
(𝑥𝑏, 𝑦𝑏) in minimum time.
```
The first issue is attainability. Examining the phase portrait for the most
```
extreme positive value of 𝑢 = 1, we can see that if our starting position has 𝑦(0) =
```
```
𝑦0 < 1, we will never be able to attain 𝑦(𝑡) > 1 for 𝑡 > 0 since the restricted thrust
```
cannot overcome the increasing friction at higher velocities. Similar reasoning
applies to 𝑢 = −1, and phase portraits for 𝑢 = ±1 are depicted in Figure 10.2.
10.3. Rocket Races 161
```
Figure 10.2. Phase portraits in (𝑥, 𝑦) for extreme controls 𝑢 =
```
−1 and 𝑢 = +1.
```
It follows by symmetry that for any trajectory with |𝑦(0)| < 1 we would have
```
```
|𝑦(𝑡)| < 1 for all 𝑡 ≥ 0 and all possible controls in our allowed set |𝑢(𝑡)| ≤ 1. We
```
```
will thus restrict our attention to the band −1 < 𝑦 < 1 in the (𝑥, 𝑦)-plane, and
```
in the following we show that we can reach any point in this set from any other
point.
Suppose we have prescribed starting and ending positions
```
𝑥(0) = 𝑥0, 𝑥(𝑇) = 𝑥𝑇 ,
```
```
𝑦(0) = 𝑦0, 𝑦(𝑇) = 𝑦𝑇
```
with |𝑦𝑇 | < 1 and free 𝑇.
We want to minimize
𝐽 = ∫
𝑇
0
1 𝑑𝑡.
Our Hamiltonian is
```
𝐻 = 1 + 𝜆1𝑦 + 𝜆2(−𝑦 + 𝑢)
```
which is linear in 𝑢, so we are likely in a bang-bang situation. The coefficient of
𝑢 is 𝜆2, so if 𝜆2 is positive, we take 𝑢 = −1, and if 𝜆2 is negative, we take 𝑢 = 1.
This describes how to work our control in terms of the costates:
```
𝑢 = sgn(𝜆2).
```
The costate equations are
𝜆′1 = 0,
𝜆′2 = −𝜆1
implying 𝜆2 is linear in time, 𝜆2 = 𝐶1𝑡 + 𝐶2, which means that we switch our
control exactly once, from +1 to −1, or from −1 to +1. This alone is sufficient
information to solve the problem.
Since we have 𝑢 equal to either +1 or −1 we consider the two systems
𝑥′ = 𝑦,
𝑦′ = −𝑦 + 1
and
𝑥′ = 𝑦,
𝑦′ = −𝑦 − 1
162 Chapter 10. Switching Controls and Stationarity
and we think of our control as jumping between the upward moving 𝑢 = +1 and
downward moving 𝑢 = −1 systems. Overlaid phase portraits are shown in Figure
10.3.
```
Figure 10.3. Overlaid (𝑥, 𝑦)-phase portraits for extreme con-
```
trols 𝑢 = ±1.
Using these two systems, we can now map out our optimal solutions for any
```
given target point. For example, suppose our terminal point is taken to be (1, 0.4).
```
```
Each of the two systems has a single trajectory leading to (1, 0.4), as shown in
```
Figure 10.4.
```
Figure 10.4. Optimal trajectories to terminal point (𝑥𝑏, 𝑦𝑏) =
```
```
(0.4, 1.0) using 𝑢 = +1 or 𝑢 = −1.
```
Initial points to the right of these trajectories will flow downwards with 𝑢 =
−1 until they hit the lower incoming 𝑢 = +1 trajectory, and they switch to that
trajectory. Initial points to the left will flow with 𝑢 = +1 until they hit and switch
to the upper incoming 𝑢 = −1 trajectory. These solutions are depicted in Figure
10.5
10.4. Stationarity 163
```
Figure 10.5. Optimal trajectories to terminal point (𝑥𝑏, 𝑦𝑏) =
```
```
(0.4, 1.0) switching between 𝑢 = +1 and 𝑢 = −1.
```
Note that all possible starting points are accounted for in this method. For
```
any endpoint (𝑥𝑏, 𝑦𝑏), we can take any starting point (𝑥𝑎, 𝑦𝑎) and connect the two
```
with a time minimizing trajectory.
10.4 Stationarity
Controls inside the range of allowable controls are called stationary if 𝜕𝐻𝜕ᵆ = 0. In some
cases these controls have 𝜕2𝐻𝜕ᵆ2 = 0, and this can happen when 𝐻 is linear in 𝑢. Such
controls can be optimal, or they can be used as segments or “holding patterns” in an
overall optimal trajectory as demonstrated in the following example.
Example 10.4: Fisheries
Suppose that the size of a fish population 𝑥 is modeled by the logistic equation
```
with growth and carrying capacity normalized to one, 𝑥′ = 𝑥(1 − 𝑥). We can
```
control the rate 𝑢 at which we harvest the fish, to get the system
```
𝑥′ = 𝑥(1 − 𝑥) − 𝑢
```
with restriction 0 ≤ 𝑢 ≤ 1.
We have a fixed time period 0 ≤ 𝑡 ≤ 𝑇 and we want to maximize harvest
∫
𝑇
0
𝑢 𝑑𝑡
while matching the endpoint conditions
```
𝑥(0) = 𝐴 < 1 and 𝑥(𝑇) = 𝐵 < 1.
```
164 Chapter 10. Switching Controls and Stationarity
The Hamiltonian is
```
𝐻 = 𝑢 + 𝜆(𝑥(1 − 𝑥) − 𝑢)
```
with
𝜕𝐻
𝜕𝑢 = 1 − 𝜆 and
𝜕2𝐻
𝜕𝑢2 = 0.
Here 𝐻 is linear in 𝑢 and thus has no local maxima or minima. If 𝜕𝐻𝜕ᵆ ≠ 0, we
would want to take 𝑢 as an extreme, yielding a bang-bang type control. If 𝜕𝐻𝜕ᵆ < 0,
we would take the minimum value 𝑢 = 0 and not harvest. If 𝜕𝐻𝜕ᵆ > 0, we would
take the maximum harvest rate 𝑢 = 1.
However, a control which maintains 𝜕𝐻𝜕ᵆ = 0 could also be a candidate for
optimization. In this case we would need the costate identically equal to one,
```
𝜆 ≡ 1, to hold 𝜕𝐻𝜕ᵆ = 0 (∗ why? ∗). Here every value of 𝑢 is maximal/minimal,
```
and the conditions of Principle VII would still be satisfied.
```
The costate equation is 𝜆′ = − 𝜕𝐻𝜕𝑥 = −𝜆(1 − 2𝑥), and for a constant value
```
```
𝜆 ≡ 1 we would need a constant value 𝑥 ≡ 12 . With 𝑥′ = 𝑥(1 − 𝑥) − 𝑢, fixing
```
𝑥 = 12 requires 𝑢 ≡ 14 .
```
This makes intuitive sense: 𝑥 = 12 is where the growth rate 𝑥′ = 𝑥(1 − 𝑥)
```
is maximized: the resource is producing fish at the highest possible rate, and we
are harvesting at a rate 𝑢 = 1/4 to maintain this maximum production.
Note the structure: as long as 𝜆 = 1, any value of 𝑢 will satisfy optimality.
However, only 𝑢 ≡ 1/4 will keep 𝜆 = 1. This is similar to the structure of mixed
Nash equilibria in game theory.
It follows that in order to maximize overall production, our control must
always be in one of three states:
– Maximum harvest: 𝑢 = 1,
– Minimum harvest: 𝑢 = 0,
– Stationary harvest: 𝑢 = 14 with 𝑥 = 12 .
These are our only options with which to build an optimal control strategy.
For example, suppose 𝑇 = 8 and 𝐴 = 𝐵 = 7/8. The structure of the solution
is intuitively clear: begin with a maximal harvest rate 𝑢 = 1 until the system
reaches a state of maximum production at 𝑥 = 1/2. Then switch to stationary
```
harvest 𝑢 = 1/4 for as long as you can. Since you have to match 𝑥(8) = 7/8, you
```
would switch out of stationary harvest to no harvest, 𝑢 = 0, just in time to let the
```
system recover to the specified end value. Optimal state 𝑥(𝑡) and control 𝑢(𝑡) are
```
plotted in Figure 10.6.
10.4. Stationarity 165
Figure 10.6. State and control for optimal solution plotted
against time.
These three time periods are calculated as follows. For the initial maximum
```
harvest time period, solve 𝑥′ = 𝑥(1 − 𝑥) − 1 with 𝑥(0) = 7/8 to get (a symbolic
```
```
processor is recommended)
```
```
𝑥(𝑡) = 12 − √32 tan( √32 𝑡 − arctan( √34 ))
```
```
= 0.5 − (0.8660 . . . ) tan(−(0.4086 . . . ) + (0.8660 . . . )𝑡).
```
```
Set this equal to a half, 𝑥(𝑡) = 1/2, and solve to approximate 𝑇1 = 0.472 . . . as the
```
end of the first time period.
```
Next, consider the ending time period. Solve 𝑥′ = 𝑥(1 − 𝑥) with 𝑥(8) = 7/8
```
to get
```
𝑥(𝑡) = 7𝑒
```
𝑡
𝑒8 + 7𝑒𝑡 .
```
Set this equal to a half, 𝑥(𝑡) = 1/2, and solve to get 𝑇2 = 6.054 . . . as the beginning
```
of the zero harvest time period.
So the solution is to operate at 𝑢 = 1 for 0 ≤ 𝑡 ≤ 𝑇1, then 𝑢 = 1/4 for
𝑇1 ≤ 𝑡 < 𝑇2, and finally 𝑢 = 0 for 𝑇2 ≤ 𝑡 ≤ 1.
We arrived at this three-phase solution intuitively given our three choices
of control values. However, sometimes intuition misleads. One can puzzle out
each of the possibilities and more conclusively arrive at this three-phase solution
being the only viable choice.
For example, at the beginning of the time period, we don’t have 𝑥 = 1/2 so
the stationary 𝑢 = 1/4 solution is excluded. The 𝑢 = 0 solution would only be
```
optimal if 𝜕𝐻𝜕ᵆ < 0, which would require 𝜆 > 1. But then with 𝜆′ = −𝜆(1 − 2𝑥),
```
```
𝑥′ = 𝑥(1 − 𝑥), 𝜆 > 1, and 𝑥 > 1/2, we would have both 𝜆 and 𝑥 increasing, main-
```
taining 𝜕𝐻𝜕ᵆ < 0, implying that we would always have 𝑢 = 0 and never harvest any
```
fish. This cannot be optimal, and we would overshoot the endpoint 𝑥(8) = 7/8.
```
166 Chapter 10. Switching Controls and Stationarity
We conclude that our only option is to start with 𝑢 = 1. We cannot keep 𝑢 = 1,
otherwise we would completely deplete the fish population and hence be unable
```
to get back up to 𝑥(8) = 7/8, and so we must switch away from 𝑢 = 1 at some
```
point. Continuing with this type of reasoning we can conclude that our three-
period solution that we constructed intuitively from our three choices of control
value is in fact our only logical choice.
Key Points
In this chapter we explored cases where the range of our control is restricted and the
optimal control occurs at the endpoint of the allowed range. Finding solutions is still
guided by looking for optimal values of the Hamiltonian, but in these cases we find the
optimum at endpoints of allowed control values. In many of these cases the Hamilton-
ian is linear in the control variable.
This method introduces interesting cases where the optimal control will instan-
taneously switch from one end of the range to the other. Such bang-bang solutions
are analyzed geometrically and often involve stitching together phase portraits from
extreme controls and piecing together trajectories to match endpoint conditions.
Stationary solutions are where the Hamiltonian has a degenerate critical point,
neither a local max nor a local min, and can form part of an overall optimal solution.
Exercises
```
Exercise 10.1(hs). Complete the calculations for the Big Silver Rocket Ship problem
```
```
(Example 10.2). You have a rocket that weighs 1,000 kg without any fuel and that has
```
exhaust velocity 800 m/sec and maximum burn rate of 60 kg/sec. You need to get this
rocket up to 25 km with a minimum amount of fuel.
Use the simplified model in Examples 10.1 and 10.2 for 𝑦′, 𝑣′, and 𝑚′, and 𝜇 = 800,
and the gravitational coefficient 𝑔 = 9.8.
A good approach is to consider starting with 𝐾 kg of fuel and implement the “max
burn all the fuel then coast” strategy, and ask how high the rocket will go. This gives
max height as a function of 𝐾, which you can solve for the required 25 km height. Here
are the suggested steps:
```
(a) Show that if you are at height 𝑦1, traveling at vertical velocity 𝑣1, and you coast
```
```
with burn rate 𝛽 = 0, you will reach a maximum height of 𝑥1 + 𝑣21/(2𝑔) at the apex.
```
```
(b) Suppose you start with an amount 𝐾 kg of fuel, so your initial mass is 𝑚0 =
```
1,000 + 𝐾, and suppose you burn this fuel at the maximum rate of 𝛽 = 60 kg/sec. Solve
the differential equations from Example 10.1 to determine your height and vertical
speed when this fuel is depleted at 𝑇1 = 𝐾/60 seconds.
```
(c) Combine parts (a) and (b) to express the apex height as a function of the amount
```
of fuel 𝐾. Numerically approximate where this function hits 25,000 m.
Exercises 167
```
Exercise 10.2(s). You control the rate 𝑢(𝑡) ≥ 0 in gal/min that water pours into a
```
reservoir of unlimited capacity, and you have a maximum pour rate of 𝑢 ≤ 200 gal/min.
```
The reservoir leaks; the amount of water 𝑥(𝑡) in the reservoir satisfies 𝑥′ = −.1𝑥 + 𝑢.
```
The reservoir is empty and must be filled to 1,000 gal in 60 minutes.
```
(a) How do you operate the control so as to use the least amount of water? Guess
```
the answer first and then see if the techniques in this chapter support your guess. Can
```
you show a single switch? Can you show the direction of the switch (on to off, or off to
```
```
on)?
```
```
(b) How do you use the control to maximize that average amount of water in the
```
```
reservoir over the one-hour period (you still are required to have 1,000 gal at the end
```
```
of the hour)?
```
```
Exercise 10.3. Rocket Race on Ice I. Consider the Rocket Race problem (Example 10.3)
```
in the case of no friction 𝑥″ = 𝑢 and where burn rates are limited to |𝑢| ≤ 1.
```
(a) Construct some trajectories just using 𝑢 = ±1. In particular, for starting loca-
```
```
tion (−1, 2) and end location (1, 2), construct trajectories that do the following:
```
```
(i) Have one switch from 𝑢 = +1 to 𝑢 = −1.
```
```
(ii) Have one switch from 𝑢 = −1 to 𝑢 = +1.
```
```
(iii) Have multiple switches, say, from 𝑢 = +1 to −1 to +1, or something.
```
```
(b) Of the trajectories you constructed in part (a), which one has minimal time?
```
```
(c) Construct the Hamiltonian 𝐻 assuming you want to minimize total time 𝑇 and
```
show it is linear in 𝑢, and so this is likely to be a bang-bang situation.
```
(d) Does Principle VII indicate that an optimal trajectory will have a single switch?
```
Does it indicate the direction of the switch?
```
Exercise 10.4. Rocket Race on Ice II. Consider the Rocket Race problem (Example 10.3)
```
in the case of no friction 𝑥″ = 𝑢, where you want to minimize total time 𝑇 and where
burn rates are limited to |𝑢| ≤ 1.
```
(a) Suppose your starting location is (0, 2) in the position/velocity phase plane.
```
```
What points (𝑥𝑏, 𝑦𝑏) can you reach with a constant 𝑢 = 1? What points can you reach
```
with a single switch from 𝑢 = 1 to 𝑢 = −1?
```
(b) What points can you reach from (0, 2) with a constant 𝑢 = −1? What points
```
can you reach with a single switch from 𝑢 = −1 to 𝑢 = 1?
```
(c) Generalize your results. What is the optimal trajectory between any two points
```
```
(𝑥𝑎, 𝑦𝑎) and (𝑥𝑏, 𝑦𝑏).
```
```
Exercise 10.5(s). Rocket Race on Ice III. Consider the Rocket Race problem (Example
```
```
10.3) in the case of no friction 𝑥″ = 𝑢, where you want to minimize total time 𝑇 and
```
where burn rates are limited to |𝑢| ≤ 1.
168 Chapter 10. Switching Controls and Stationarity
```
Suppose that from any starting point, you want to get to the origin (0, 0) in minimal
```
time. The set of optimal trajectories is plotted in Figure 10.7.
Figure 10.7. Soft landing for the Rocket Race on Ice.
```
(a) Explain this figure. In what region is 𝑢 = +1? In what region is 𝑢 = −1?
```
```
(b) For an initial point (𝑥0, 𝑦0) in the region with 𝑢 = −1, show that it takes 𝑡 = 𝑦0
```
time units to reach the horizontal axis. At what 𝑥 value does the trajectory hit the 𝑥-
axis?
```
(c) For an initial point (𝑥0, 0) on the positive 𝑥-axis, how much time does it take
```
```
to reach the origin (0, 0)?
```
```
(d) Combine results (b) and (c) to derive the minimal time required to reach the
```
```
origin from any initial point (𝑥0, 𝑦0).
```
```
(e) Can you compute the travel time between any two points (𝑥0, 𝑦0) and (𝑥1, 𝑦1)?
```
```
Exercise 10.6(h). Fisheries. In the fisheries model, Example 10.4, we have 𝑥′ =
```
```
𝑥(1 − 𝑥) − 𝑢 and 𝐽 = ∫𝑇0 𝑢 𝑑𝑡. Suppose you have an 8-year time interval, 𝑇 = 8,
```
and the following conditions.
```
(a) The allowed harvesting rate was rather low, 0 ≤ 𝑢 ≤ .15. What would your
```
```
optimal control be for endpoint conditions 𝑥(0) = .85, 𝑥(8) ≥ .85? How about 𝑥(0) =
```
```
.75, 𝑥(8) ≥ .75?
```
```
(b) Suppose 0 ≤ 𝑢 ≤ 1 and the endpoint condition is 𝑥(8) = .85, but the initial fish
```
```
population is low, 𝑥(0) = .25. Would you want to wait until 𝑥 = .5 to begin harvesting,
```
or would it make sense to start harvesting before 𝑥 reaches .5?
Exercises 169
```
(c) Suppose 0 ≤ 𝑢 ≤ 1 and the initial condition is 𝑥(0) = .85, but the end condition
```
```
𝑥(8) ≥ 0 is free. Would you want to harvest all the fish? Or would you just keep
```
harvesting at 𝑢 = 1/4? Or something in between?
```
Exercise 10.7(h). Rocket Race on Ice IV. Consider the Rocket Sled on Ice problem, 𝑥″ =
```
𝑢 with |𝑢| ≤ 1, where we want to transition from 𝑥 = −2, 𝑦 = 0 to 𝑥 = 2, 𝑦 = 0. We
can conclude from previous exercises that the minimum time path requires 𝑇 = 4 time
units with control 𝑢 = 1 for 0 ≤ 𝑡 < 2 and 𝑢 = −1 for 2 ≤ 𝑡 ≤ 4.
Now suppose we have a fixed time 𝑇 ≤ 4, and we still have limits |𝑢| ≤ 1, but now
we want to minimize total fuel burn
𝐽 = ∫
𝑇
0
|𝑢| 𝑑𝑡.
```
(a) Show that the Hamiltonian, as a function of 𝑢, has the form 𝐻 = |𝑢| + 𝐴 + 𝐵𝑢.
```
```
(b) What are the possible minima for a function 𝐻 in this form over |𝑢| ≤ 1? How
```
does the minimum value depend on 𝐴 and 𝐵? Draw pictures.
```
(c) Show that for our Hamiltonian, the coefficient 𝐵 is linear in time 𝑡. From this,
```
argue that any optimal control will have at most two switches with 𝑢 switching −1 →
0 → +1 or +1 → 0 → −1.
```
(d) With 𝑥′ = 𝑦, sketch some representative solutions for various values of 𝑇 in
```
```
the (𝑥, 𝑦)-plane.
```
Exercise 10.8. This computational exercise emphasizes that the Pontryagin conditions
are necessary, not sufficient, for an optimal solution. It is important to spend some time
exploring a problem to make sure that naive application of Pontryagin does not produce
a suboptimal solution.
In Example 7.3 we have a controlled system 𝑥′ = 𝑢 with a specific end time 𝑇 and
```
endpoint conditions 𝑥(0) = 1 and 𝑥(𝑇) = 2 with performance 𝐽 = ∫𝑇012 (𝑥2 − 𝑢2) 𝑑𝑡
```
to be maximized. Applying necessary conditions for optimality, we get 𝑢 = 𝜆 and
solutions
```
𝑥 = 𝑥0 cos(𝑡) + 𝜆0 sin(𝑡),
```
```
𝜆 = −𝑥0 sin(𝑡) + 𝜆0 cos(𝑡).
```
```
(a) Show that for 𝑇 = 3𝜋/2 we can match the endpoint conditions with 𝑥0 = 1
```
and 𝜆0 = −2 with 𝐽 = −2.
```
(b) Now for 𝑇 = 𝜋/2, show that you can match the following endpoints, each case
```
with a payoff of zero:
```
𝑥(0) = 1, 𝑥( 𝜋2 ) = 0, 𝐽 = 0,
```
```
𝑥(0) = 0, 𝑥( 𝜋2 ) = 0, 𝐽 = 0,
```
```
𝑥(0) = 0, 𝑥( 𝜋2 ) = 2, 𝐽 = 0.
```
```
Use this to argue that we can improve upon the solution from part (a) by using a switch-
```
ing control.
170 Chapter 10. Switching Controls and Stationarity
```
(c) Repeat part (b) for the given allowed times and endpoints, and verify the cor-
```
responding payoffs for 0 < 𝜏 < 𝜋:
```
𝑥(0) = 1, 𝑥( 𝜋2 ) = 0, 𝐽 = 0,
```
```
𝑥(0) = 0, 𝑥(𝜋 − 𝜏) = 0, 𝐽 = 0,
```
```
𝑥(0) = 0, 𝑥(𝜏) = 2 , 𝐽 = −2 cot(𝜏).
```
```
Use this to argue that you can use switching controls to match 𝑥(0) = 1 and 𝑥(3𝜋/2) = 2
```
and get an arbitrarily large payoff.
```
(d) Use these techniques to show that you can attain an arbitrarily large payoff
```
```
and match 𝑥(0) = 1 and 𝑥(𝑇) = 2 for any allowed time 𝑇 > 𝜋.
```
```
Exercise 10.9(h). Soft-Landing Oscillator. This is a classic exercise in optimal control.
```
You control a frictionless oscillator 𝑥″ = −𝑥 by exerting a force 𝑢, making 𝑥″ = −𝑥 + 𝑢
```
with bounds |𝑢| ≤ 1. The oscillator starts at position 𝑥(0) and velocity 𝑦(0) and you
```
```
need to bring it to rest 𝑥(𝑇) = 𝑦(𝑇) = 0 in minimal time 𝑇.
```
The position/velocity phase portrait for the solution is shown in Figure 10.8.
Figure 10.8. Minimum time soft landing for a simple oscillator with
bounded acceleration control.
Justify this solution with the following steps.
```
(a) Show this system is bang-bang. Sketch the phase portraits for 𝑢 = 1 and 𝑢 =
```
−1.
```
(b) For 𝑢 = ±1, find orbits that terminate at (0, 0). Which parts of these orbits
```
would be part of an optimal trajectory?
```
(c) Show that optimal trajectories will switch controls every 𝜋 time units.
```
```
(d) Complete the picture.
```
Exercises 171
```
Exercise 10.10(h). You’re sitting in a room at 70∘𝐹, you have 2 oz of cream stored in
```
a refrigerator at 40∘𝐹, and you have a boiling hot 10 oz cup of coffee sitting in front
```
of you with temperature 𝑥(𝑡) that satisfies 𝑥′ = 𝑘(70 − 𝑥) for some cooling coefficient
```
𝑘 > 0. How should you add the cream in order to bring the coffee down to a drinkable
temperature, say, 150∘𝐹, in a minimum time?
11
Time, Value, and
Hamilton-Jacobi-Bellman
Equation
Pontryagin’s principles allow us to find necessary conditions for an optimal control
given a performance measure, starting position, and end conditions. The principles
impose a dynamic structure on Lagrange multipliers to create a state-costate system of
ordinary differential equations.
The Hamilton-Jacobi-Bellman approach is another way to address the problem
using partial derivatives and has deep historical roots that predate Pontryagin. The
key idea for continuous systems is to consider the optimal performance as a function of
starting location and time and to derive a partial differential equation for this function.
This can be interpreted as an extension of Bellman’s dynamic programming for discrete
```
systems (look this up). The approach is quite beautiful. The drawback is that partial
```
differential equations are hard to work with. This chapter explores the basic concepts
of the theory and derives the Hamilton-Jacobi-Bellman equation for one-dimensional
systems.
11.1 Time
Minimal time problems consider optimal controls that minimize time, as explored in
```
the Zermelo examples (Examples 8.4, 8.5, 9.2, 9.6), the brachistochrone examples (Ex-
```
```
amples 8.6 9.5), and the Rocket Race example (Example 10.3).
```
```
These problems are unique in that the Principle of Optimality (Section 5.2) applies
```
directly to state space. Trajectories don’t typically intersect, and we can think of travel
time as a function of location, as we explore in the following revisit to the brachis-
tochrone problem.
173
174 Chapter 11. Time, Value, and HJB Equation
Example 11.1: Brachistochrone Time
The brachistochrone problem was explored in Example 8.6 as the minimal time
```
path for a bead to slide from (0, 0) to (𝑥1, 𝑦1) in a vertical plane under the influence
```
of gravity. We control the motion of the bead by the angle of descent 𝜃, and the
optimal paths turn out to be cycloids.
```
Given a terminal point (𝑥1, 𝑦1) we can compute the optimal path and de-
```
```
termine the minimum time required to reach that point from the origin (0, 0).
```
```
We could then consider this minimal time as a function ˜𝑇(𝑥1, 𝑦1) of the terminal
```
```
point (𝑥1, 𝑦1). What would this function look like?
```
Turning this around, if we had exactly 𝑇 seconds, where could we get to from
```
(0, 0) using these optimal paths? This would be a level curve, or isochrone, of the
```
```
minimal time function ˜𝑇(𝑥1, 𝑦1), several of which are plotted in Figure 11.1.
```
```
Figure 11.1. Equal time curves for brachistochrone paths from (0, 0).
```
```
Dropping straight down to an endpoint of the form (0, 𝑦1) would be the far-
```
```
thest one could get away from (0, 0) in a given time 𝑇, and these curves have a
```
terminal angle of 𝜃𝑇 = −𝜋/2. Other terminal points along the isochrone have
terminal angles −3𝜋/2 < 𝜃𝑇 ≤ 𝜋/2. Terminal points on the positive 𝑥-axis have
```
𝜃𝑇 = 𝜋/2 and have the shortest final distance from (0, 0) for a given time along
```
an optimal path.
Keep in mind that these are optimal paths, and so they represent the outer
limit of where we could go. If we had, say, two time units it seems intuitive that
we could reach any point inside the finite region in the lower half-plane bounded
by the 𝑇 = 2 isochrone by using a less efficient path. But we certainly could not
reach any point outside this region in two time units.
Computing the function ˜𝑇 and these isochrones is challenging. The point
```
is that every point (𝑥1, 𝑦1) of the vertical plane has an associated value ˜𝑇(𝑥1, 𝑦1)
```
that represents the minimum amount of time required to slide from the origin to
that point using gravity.
11.1. Time 175
The above example considered how far we could travel in a given amount of time.
The following examples are time-to-target problems, which consider how long it takes
to reach a specific end condition.
```
These problems involve a system 𝑥′ = 𝑓1(𝑥, 𝑦, 𝑢), 𝑦′ = 𝑓2(𝑥, 𝑦, 𝑢), a set of allowed
```
```
controls 𝒰, a specified target such as a point or a curve 𝒞, and a starting point (𝑥0, 𝑦0).
```
The objective is to find the allowed control that transitions from the starting point to
the target in the least amount of time. For these systems, we want to compute the
```
minimum time ˜𝑇(𝑥, 𝑦) to reach the target from a general starting point (𝑥, 𝑦).
```
Time minimizing paths have the unique property that every time unit spent on the
path reduces the remaining time by one time unit. In a perfect world, if you are 1 hour
into a 3-hour trip, you must have 2 hours left. Otherwise something has gone off track.
```
More precisely, as explored in Example 8.5, if a minimal time trajectory (𝑥(𝑡), 𝑦(𝑡)) takes
```
𝑇 time units to traverse from point 𝐴 to point 𝐶 and if at time 𝑡 = 1 the trajectory is at
location 𝐵, then it must take 𝑇 − 1 time units to traverse from 𝐵 to 𝐶.
On a minimal time path, every hour reduces the remaining time by one hour. Ev-
ery second reduces the remaining time by one second. Every microsecond. . . , and so
on, and the concept applies all the way down to the limiting infinitesimal level.
The remaining time on a minimal path decreases at a rate of one time unit per time
unit,
𝑑
𝑑𝑡
```
˜𝑇(𝑥(𝑡), 𝑦(𝑡)) = −1.
```
In fact, minimizing paths are uniquely characterized by this property. Think about
```
it: the time minimizing path must have this property, but no other path will. The
```
following example explores this concept.
Example 11.2: Rocket Race Time
```
Consider the Rocket Sled with friction and bounded control (Example 10.3):
```
𝑥′ = 𝑦,
𝑦′ = −𝑦 + 𝑢
Figure 11.2. Time minimizing trajectories to bring the rocket
sled to zero velocity, 𝑦 = 0.
176 Chapter 11. Time, Value, and HJB Equation
with control 𝑢 restricted by |𝑢| ≤ 1, and we want to minimize travel time between
```
a specified starting location (𝑥0, 𝑦0) and the horizontal line 𝑦 = 0. The solution
```
is to use 𝑢 ≡ −1 if 𝑦0 > 0 and 𝑢 ≡ +1 if 𝑦0 < 0, as shown in Figure 11.2.
```
Given a starting point (𝑥0, 𝑦0) with 𝑦0 > 0 we have 𝑢 ≡ −1 and the solution
```
```
trajectory (∗ check this ∗)
```
```
𝑥(𝑡) = 𝑥0 + 𝑦0 − 𝑡 + 1 − 𝑒−𝑡(𝑦0 + 1),
```
```
𝑦(𝑡) = −1 + 𝑒−𝑡(𝑦0 + 1).
```
```
We solve this for 𝑦(𝑡) = 0 to find 𝑡 = ln(1 + 𝑦0). A similar argument for
```
𝑦0 < 0 allows us to conclude that our time function is
```
˜𝑇(𝑥, 𝑦) = ln(1 + |𝑦|).
```
Note that we dropped the subscripts from the starting location—we want to start
thinking of this as a general function of 𝑥 and 𝑦.
```
We note that ˜𝑇(𝑥, 𝑦) = ln(1 + |𝑦|) satisfies ˜𝑇(𝑥, 0) = 0. Next we check that
```
𝑑
```
𝑑𝑡 ˜𝑇 = −1. For an optimal trajectory in the upper half-plane 𝑦(𝑡) > 0
```
𝑑
```
𝑑𝑡 ˜𝑇(𝑥(𝑡), 𝑦(𝑡)) =
```
𝜕 ˜𝑇
𝜕𝑥 𝑥′ +
𝜕 ˜𝑇
𝜕𝑦 𝑦′
```
= (0)(𝑦) + ( 11+𝑦 )(−𝑦 − 1)
```
= −1
and similarly for the lower half-plane.
Suppose now that our target is the line 𝑥 + 𝑦 = 0. Optimal solutions are
𝑢 = 1 for 𝑥0 + 𝑦0 > 0 and 𝑢 = −1 for 𝑥0 + 𝑦0 < 0, as shown in Figure 11.3.
Figure 11.3. Time minimizing trajectories to bring the rocket
sled to the target condition 𝑥 + 𝑦 = 0.
We could calculate our travel time starting at 𝑥0, 𝑦0 as before, calculate the
trajectory, and express time as a function of starting point.
But in this case a much easier solution presents itself. Consider the function
```
˜𝑇(𝑥, 𝑦) = |𝑥 + 𝑦|.
```
11.1. Time 177
For 𝑥 + 𝑦 > 0 we have
𝑑
𝑑𝑡
```
˜𝑇(𝑥(𝑡), 𝑦(𝑡)) = 𝑥′(𝑡) + 𝑦′(𝑡) = −1
```
and on the target
```
˜𝑇(𝑥, 𝑦) = 0 for 𝑥 + 𝑦 = 0.
```
These properties alone indicate that this must be the optimal travel time function
for 𝑥 + 𝑦 > 0. We arrive at this conclusion without doing any specific trajectory
calculations. We can do a similar verification for starting points with 𝑥 + 𝑦 < 0.
With a bit more effort, we can analyze the soft-landing problem where our
```
target is the point (0, 0), as shown in Figure 11.4 (see Exercise 10.5).
```
Figure 11.4. Time minimizing paths for the soft-landing con-
dition, with bang-bang control.
In this case the minimal time function for the 𝑢 = −1 region is
```
˜𝑇(𝑥, 𝑦) = ln |𝑦 + 1| + ln(
```
```
1 + √1 − (𝑦 + 1)𝑒−(𝑥+𝑦)
```
```
1 − √1 − (𝑦 + 1)𝑒−(𝑥+𝑦)
```
```
) ,
```
```
as can be verified (with some effort. . . ) by showing 𝜕 ˜𝑇𝜕𝑡 (𝑥(𝑡), 𝑦(𝑡)) = −1 in this
```
```
region and that ˜𝑇(𝑥, 𝑦) has the correct values on the incoming 𝑢 = +1 trajectory
```
```
to (0, 0).
```
```
The general rule is that any minimum time function ˜𝑇(𝑥, 𝑦) for a given target must
```
```
satisfy two properties: 𝑑𝑑𝑡 ˜𝑇(𝑥(𝑡), 𝑦(𝑡)) = −1 on minimal paths and ˜𝑇 = 0 on the tar-
```
get set. The cool thing is that the converse is true: any function that satisfies these
two properties must be a minimal time function. We have now lifted our optimization
analysis from considering individual trajectories to specifying necessary properties of
a spatial function.
In the above Rocket Race example we had closed form solutions for a few carefully
selected target sets. There may not be a nice closed form solution for other target sets,
and the minimal time function would have to be numerically approximated. This type
of reasoning would be under the general topic of nonlinear first-order partial differen-
tial equations.
178 Chapter 11. Time, Value, and HJB Equation
11.2 Performance
The differential structures and concepts of the previous section extend to more general
optimization problems.
```
In a basic optimal control problem we are given a dynamical system 𝐱′ = 𝑓(𝐱, 𝑢, 𝑡),
```
a starting location 𝐱0, some form of endpoint conditions, and a performance criteria 𝐽
that we want to maximize or minimize over all allowable controls 𝑢 ∈ 𝒰.
We then compute conditions necessary for the control to be optimal and arrive at
our maximum or minimum value for 𝐽, which we will denote as̃ 𝐽. That is,̃ 𝐽 is the best
performance we can achieve given the constraints of the problem. This value can be
expressed as a function of whatever subset of the constraints we want to consider. For
example, the minimal cost of bringing a Rocket Sled to a soft landing in a given amount
of time depends of the initial position and velocity of the sled and the amount of time
we are allowed.
Example 11.3: Rocket Sled Performance
Consider the Rocket Sled with friction 𝑥′ = 𝑦, 𝑦′ = −𝑦 + 𝑢 and performance
𝐽 = ∫𝑇0 𝑢2 𝑑𝑡. Suppose we want the minimum cost to move from a given initial
```
position and velocity (𝑥0, 𝑦0) to (0, 0) in exactly 𝑇 = 1 time units. This minimum
```
```
cost would be a function,̃ 𝐽(𝑥0, 𝑦0), of starting position (𝑥0, 𝑦0).
```
Figure 11.5. Performance values for optimal trajectories from
some representative starting points.
Some representative trajectories and associated costs are plotted in Figure
11.5. Note that trajectories starting in the second quadrant travel directly towards
```
(0, 0) and have lower cost than those starting in the first quadrant which have to
```
change direction. To get a better sense of how cost relates to starting position, we
11.2. Performance 179
could examine all starting positions that have a minimal cost of, say,̃ 𝐽 = 1, as
represented in Figure 11.6. Under this condition of unit cost, trajectories starting
in the second quadrant can start from farther away than trajectories in the first
quadrant.
Figure 11.6. The set of starting points with a performance
value of̃ 𝐽 = 1.
What we really want is to compute minimal cost as a function of starting
```
position,̃ 𝐽(𝑥0, 𝑦0). To compute this function, recall our solutions from Examples
```
8.1 and 8.2:
𝑥 = − 12 𝑎𝑡 − 14 𝑏𝑒𝑡 − 𝑐𝑒−𝑡 + 𝑑,
𝑦 = − 12 𝑎 − 14 𝑏𝑒𝑡 + 𝑐𝑒−𝑡,
```
𝑢 = − 12 (𝑎 + 𝑏𝑒𝑡)
```
with four integration constants 𝑎, 𝑏, 𝑐, 𝑑.
Minimal cost is then
̃𝐽 = ∫
1
0
𝑢2 𝑑𝑡 = ∫
1
0
1
```
4 (𝑎 + 𝑏𝑒𝑡)2 𝑑𝑡 =
```
1
```
8 (4𝑎𝑏(𝑒 − 1) + 𝑏2(𝑒2 − 1) + 2𝑎2).
```
```
Conditions for the fixed end time 𝑇 = 1, fixed endpoint (0, 0), and variable start-
```
```
ing point (𝑥0, 𝑦0) are
```
```
𝑥(0) = 𝑥0 = − 14 𝑏 − 𝑐 + 𝑑,
```
```
𝑦(0) = 𝑦0 = − 12 𝑎 − 14 𝑏 + 𝑐,
```
```
𝑥(1) = 0 = − 12 𝑎 − 14 𝑏𝑒 − 𝑐𝑒−1 + 𝑑,
```
```
𝑦(1) = 0 = − 12 𝑎 − 14 𝑏𝑒 + 𝑐𝑒−1.
```
180 Chapter 11. Time, Value, and HJB Equation
This is a set of four equations which are linear in the four unknowns 𝑎, 𝑏, 𝑐, 𝑑.
Solving yields
```
𝑎 = −2 𝑥0(𝑒 + 1) + 𝑦0(𝑒 − 1)𝑒 − 3 ,
```
```
𝑏 = 4 𝑥0(𝑒 − 1) + 𝑦0(𝑒 − 2)(𝑒 − 3)(𝑒 − 1) ,
```
```
𝑐 = −𝑒 𝑥0(𝑒 − 1) + 𝑦0(𝑒 − 3)(𝑒 − 1) ,
```
```
𝑑 = −2 𝑥0(𝑒 − 1) + 𝑦0(𝑒 − 3)(𝑒 − 1) .
```
Substituting these into our minimal cost function yields a paraboloid:
```
̃𝐽(𝑥0, 𝑦0) = − (𝑒
```
```
2 − 1)𝑥20 + 2(𝑒 − 1)2𝑥0𝑦0 + (𝑒2 − 4𝑒 + 5)𝑦20
```
```
(𝑒 − 3)(𝑒 − 1) .
```
```
Figure 11.7. Level curves of optimal performancẽ 𝐽(𝑥, 𝑦) as a
```
```
function of starting points.
```
```
This function tells us the minimum cost of moving from (𝑥0, 𝑦0) to (0, 0), and
```
level curves are plotted in Figure 11.7. The function has lower values for starting
positions to the left of 𝑥 = 0 with positive velocity, and it has significantly greater
values for starting positions to the right of 𝑥 = 0 with positive velocity.
We solved this for a fixed end time 𝑇 = 1. We could likewise solve for any
given end time 𝑇 to get a function telling us the minimum cost of getting from
```
(𝑥0, 𝑦0) to (0, 0) in 𝑇 time units:
```
```
̃𝐽(𝑥0, 𝑦0, 𝑇) = (𝑒2𝑇 −1)𝑥20+2(𝑒𝑇 −1)
```
```
2𝑥0𝑦0+(𝑒2𝑇 −4𝑒𝑇 +2𝑇+3)𝑦20
```
```
(𝑒𝑇 −1)(𝑒𝑇 (𝑇−2)+𝑇+2) . (11.1)
```
```
Note that this is a function of three variables, location (𝑥0, 𝑦0) and allowed time 𝑇.
```
11.3. Hamilton-Jacobi-Bellman Equation 181
11.3 Hamilton-Jacobi-Bellman Equation
For a control system with a fixed target, optimal performance can be analyzed as a func-
tion of starting conditions and total time. As we saw for the time minimizing problems,
these performance functions have certain properties that uniquely define them.
Hamilton-Jacobi-Bellman theory considers more general performance functions,
```
such as equation (11.1) in the previous example, and specifies a partial differential
```
equation that such functions must satisfy.
```
In general, partial differential equations (PDEs) are hard to solve. We explore this
```
topic with some basic cases where closed form solutions are workable.
11.3.1 Value. The Hamilton-Jacobi-Bellman analysis relies on the concept of a value
function, which we develop as follows for a free end time 𝑇.
```
Suppose we have a controlled system 𝑥′ = 𝑓(𝑥, 𝑢) with initial state 𝑥(0) = 𝑥0,
```
where we want to minimize cost
```
𝐽 = 𝐺(𝑥(𝑇)) + ∫
```
𝑇
0
```
𝑔(𝑥, 𝑢, 𝑡) 𝑑𝑡
```
for a fixed 𝑇 and free endpoint.
The Pontryagin approach would be to form the Hamiltonian
```
𝐻(𝑥, 𝑢, 𝜆, 𝑡) = 𝑔(𝑥, 𝑢, 𝑡) + 𝜆𝑓(𝑥, 𝑢, 𝑡),
```
define the costate equations, find the optimal control that optimizes the Hamiltonian,
and incorporate boundary conditions as appropriate. All well and good.
```
Now suppose that instead of a prescribed initial location 𝑥(0) = 𝑥0, we simply
```
find ourselves at some location 𝑥𝑡 at some time 𝑡 < 𝑇 and must optimize from that
point forward to the end time and location. Our payoff from that point forward with
```
𝑥′ = 𝑓(𝑥, 𝑢, 𝑡) could be defined as
```
```
𝑉(𝑥𝑡, 𝑡) = minᵆ {𝐺(𝑥(𝑇)) + ∫
```
𝑇
𝑡
```
𝑔(𝑥, 𝑢, 𝜏) 𝑑𝜏} with 𝑥′ = 𝑓(𝑥, 𝑢, 𝜏), 𝑥(𝑡) = 𝑥𝑡.
```
This is referred to as the value function of the optimization problem. So if we start at
```
𝑡 = 0 with 𝑥(0) = 𝑥0, our minimum cost would be 𝑉(𝑥0, 0). But 𝑉(𝑥0, 𝑡) is much more
```
general, giving us our minimum cost from any starting point 𝑥𝑡 at any time 𝑡.
Keep in mind that 𝑉 is defined for a fixed given end time 𝑇. A better notation may
```
be 𝑉 𝑇 (𝑥, 𝑡), but we’ll stick with the standard notation.
```
Note how this value differs from our payoff function from Section 11.2. The payoff
```
functioñ 𝐽(𝑥, 𝑇) is the optimal performance starting at location 𝑥 with an end time of 𝑇.
```
The value function assumes a fixed end time 𝑇 and is a measure of the remaining payoff
```
to be gained (or cost to be paid) if we are at location 𝑥 at time 𝑡. For the autonomous
```
```
case, where 𝑓 and 𝑔 do not depend on time 𝑡, the two concepts are related as 𝑉(𝑥, 𝑡) =̃
```
```
𝐽(𝑥, 𝑇 − 𝑡).
```
There are two things to note about 𝑉. First, at the end time 𝑡 = 𝑇 we must have
```
𝑉(𝑥, 𝑇) = 𝐺(𝑥). This follows from the definition in that ∫𝑇𝑇 𝑔 𝑑𝑡 = 0. If you find
```
yourself at location 𝑥 and you are out of time 𝑡 = 𝑇, then you’re done and there is
```
nothing to be gained or lost beyond the final value 𝐺(𝑥).
```
```
Second, 𝑉(𝑥(𝑡), 𝑡) is decreasing in time. Under optimal control, your remaining
```
costs have to decrease as you proceed.
182 Chapter 11. Time, Value, and HJB Equation
Although we are focusing on minimizing cost, the same applies if we were max-
imizing profit: you get a greater payoff if you start earlier in the process than if you
jump into the middle of the process. Your remaining payoff always decreases as you
proceed through a task.
```
To make this clear, suppose that 𝑇 = 2 and that 𝑢(𝑡) is your optimal control that
```
```
generates a trajectory 𝑥(𝑡). For simplicity, we can assume 𝐺(𝐵) = 0, although the
```
```
argument works without this assumption. Then using the Principle of Optimality (an
```
optimal trajectory from 𝐴 to 𝐶 that passes through 𝐵 is also optimal from 𝐴 to 𝐵 and
```
from 𝐵 to 𝐶) we have
```
```
∫20 𝑔(𝑥(𝜏), 𝑢(𝜏), 𝑡) 𝑑𝜏 = ∫10 𝑔(𝑥(𝜏), 𝑢(𝜏), 𝜏) 𝑑𝜏 + ∫21 𝑔(𝑥(𝜏), 𝑢(𝜏), 𝜏) 𝑑𝜏,
```
```
𝑉(𝑥(0), 0) = ∫10 𝑔(𝑥(𝜏), 𝑢(𝜏), 𝜏) 𝑑𝜏 + 𝑉(𝑥(1), 1).
```
```
Assuming a fixed time 𝑇, the function 𝑉(𝑥(𝑡), 𝑡) is the minimum cost starting from
```
```
𝑥(𝑡) at time 𝑡. Here 𝑉(𝑥(0), 0) is the minimum cost from 𝑥(0) at time 𝑡 = 0 and
```
```
𝑉(𝑥(1), 1) is the minimum cost from 𝑥(1) at 𝑡 = 1. The term ∫10 𝑔(𝑥(𝜏), 𝑢(𝜏), 𝜏) 𝑑𝜏
```
```
is the minimum cost of getting from 𝑥(0) at time 𝑡 = 0 to 𝑥(1) at time 𝑡 = 1.
```
We apply these ideas to a small time interval to derive a first-order partial differ-
```
ential equation for the value function 𝑉(𝑥, 𝑡). Suppose we operate an optimal control
```
𝑢 that takes the system from 𝑥, 𝑡 to 𝑥 + Δ𝑥, 𝑡 + Δ𝑡. Then we must have
```
∫𝑇𝑡 𝑔(𝑥(𝜏), 𝑢(𝜏), 𝜏) 𝑑𝜏 = ∫𝑡+∆𝑡𝑡 𝑔(𝑥(𝜏), 𝑢(𝜏), 𝜏) 𝑑𝜏 + ∫𝑇𝑡+∆𝑡 𝑔(𝑥(𝜏), 𝑢(𝜏), 𝜏) 𝑑𝜏,
```
```
𝑉(𝑥, 𝑡) = ∫𝑡+∆𝑡𝑡 𝑔(𝑥, 𝑢, 𝜏) 𝑑𝜏 + 𝑉(𝑥 + Δ𝑥, 𝑡 + Δ𝑡).
```
The first-order approximation for the last two components above are
```
∫𝑡+∆𝑡𝑡 𝑔(𝑥, 𝑢, 𝜏) 𝑑𝜏 = 𝑔(𝑥, 𝑢, 𝑡) Δ𝑡 + 𝑜(Δ𝑡),
```
```
𝑉(𝑥 + Δ𝑥, 𝑡 + Δ𝑡) = 𝑉(𝑥, 𝑡) + 𝜕𝑉𝜕𝑡 (𝑥, 𝑡)Δ𝑡 + 𝜕𝑉𝜕𝑥 (𝑥, 𝑡)Δ𝑥 + 𝑜(Δ𝑡, Δ𝑥)
```
```
= 𝑉(𝑥, 𝑡) + 𝜕𝑉𝜕𝑡 (𝑥, 𝑡)Δ𝑡 + 𝜕𝑉𝜕𝑥 (𝑥, 𝑡)𝑓(𝑥, 𝑢, 𝑡)Δ𝑡 + 𝑜(Δ𝑡).
```
Putting this together as an optimization problem,
```
𝑉(𝑥, 𝑡) = minᵆ {∫
```
𝑡+∆𝑡
𝑡
```
𝑔(𝑥, 𝑢, 𝜏) 𝑑𝜏 + 𝑉(𝑥 + Δ𝑥, 𝑡 + Δ𝑡)}
```
```
= minᵆ {𝑔(𝑥, 𝑢, 𝑡)Δ𝑡 + 𝑉(𝑥, 𝑡) + 𝜕𝑉𝜕𝑡 (𝑥, 𝑡)Δ𝑡 + 𝜕𝑉𝜕𝑥 (𝑥, 𝑡)𝑓(𝑥, 𝑢, 𝑡)Δ𝑡 + 𝑜(Δ𝑡)}
```
```
= 𝑉(𝑥, 𝑡) + 𝜕𝑉𝜕𝑡 (𝑥, 𝑡)Δ𝑡 + minᵆ {𝑔(𝑥, 𝑢, 𝑡)Δ𝑡 + 𝜕𝑉𝜕𝑥 (𝑥, 𝑡)𝑓(𝑥, 𝑢, 𝑡)Δ𝑡} + 𝑜(Δ𝑡).
```
```
Canceling 𝑉(𝑥, 𝑡), dividing out Δ𝑡, and rearranging yields
```
```
− 𝜕𝑉𝜕𝑡 (𝑥, 𝑡) = minᵆ {𝑔(𝑥, 𝑢, 𝑡) + 𝜕𝑉𝜕𝑥 (𝑥, 𝑡)𝑓(𝑥, 𝑢, 𝑡)} .
```
```
This is the basic Hamilton-Jacobi-Bellman (HJB) equation.
```
11.3. Hamilton-Jacobi-Bellman Equation 183
HAMILTON-JACOBI-BELLMAN EQUATION
The value function
```
𝑉(𝑥𝑡, 𝑡) = minᵆ {𝐺(𝑥(𝑇)) + ∫𝑇𝑡 𝑔(𝑥, 𝑢, 𝜏) 𝑑𝜏}
```
with
```
𝑥′ = 𝑓(𝑥, 𝑢, 𝜏), 𝑥(𝑡) = 𝑥𝑡
```
must satisfy the Hamilton-Jacobi-Bellman partial differential equation:
```
− 𝜕𝑉𝜕𝑡 (𝑥, 𝑡) = minᵆ {𝑔(𝑥, 𝑢, 𝑡) + 𝜕𝑉𝜕𝑥 (𝑥, 𝑡)𝑓(𝑥, 𝑢, 𝑡)} .
```
We’ve skimmed over a number of details, such as existence and various smooth-
ness assumptions on 𝑔 and 𝑓.
Note that the right-hand side of the HJB equation reflects the Hamiltonian form
𝐻 = 𝑔 + 𝜆𝑓 with 𝜕𝑉𝜕𝑥 filling the role of the costate 𝜆. This reinforces our insight that the
costate is the marginal performance with respect to state, or 𝜕𝑉𝜕𝑥 . In fact, the Hamilton-
Jacobi-Bellman PDE can be expressed in terms of the Hamiltonian:
```
− 𝜕𝑉𝜕𝑡 (𝑥, 𝑡) = minᵆ {𝐻(𝑥, 𝑢, 𝜕𝑉𝜕𝑥 , 𝑡)} .
```
11.3.2 Applying Hamilton-Jacobi-Bellman. We can solve optimization prob-
```
lems by solving the HJB PDE and using boundary conditions 𝑉(𝑇, 𝑥(𝑇)) = 𝐺(𝑥(𝑇)).
```
This approach differs from that of Pontryagin, but it produces the same conclusions
and relies on the same foundational concepts.
Example 11.4: Integrator
As in Example 4.3, consider controlled growth 𝑥′ = 𝑢, fixed time 𝑇, and free end
```
location 𝑥(𝑇), and we want to minimize
```
𝐽 = ∫
𝑇
0
𝑥2 + 𝑢2 𝑑𝑡.
The HJB equation for this system is
```
− 𝜕𝑉𝜕𝑡 = minᵆ {𝑥2 + 𝑢2 + 𝜕𝑉𝜕𝑥 𝑢} .
```
This is quadratic in 𝑢 with a minimum at 𝑢 = − 12𝜕𝑉𝜕𝑥 , yielding
```
− 𝜕𝑉𝜕𝑡 = 𝑥2 − 14 ( 𝜕𝑉𝜕𝑥 )
```
2
```
which is our HJB PDE (∗ check these steps ∗).
```
This is a nonlinear PDE. Through divine inspiration, or, just thinking about
the quadratic term 𝑥2, we guess a solution of the form
```
𝑉(𝑥, 𝑡) = 𝑥2 𝑠(𝑡)
```
```
for some unknown function 𝑠(𝑡).
```
Plugging this in and simplifying yields
−𝑠′ = 1 − 𝑠2.
184 Chapter 11. Time, Value, and HJB Equation
This first-order differential equation is quadratic in the dependent variable. Dif-
ferential equations of this form are called Riccati equations and have well-refe-
renced methods for deriving solutions in closed form.
```
In this example the end cost is 𝐺(𝑥(𝑇)) = 0, yielding a boundary condition
```
```
𝑉(𝑥, 𝑡) = 0, making 𝑠(𝑇) = 0. This leads to the value function (∗ verify this ∗)
```
```
𝑉(𝑥, 𝑡) = 𝑥2 𝑒
```
2𝑇 − 𝑒2𝑡
𝑒2𝑇 + 𝑒2𝑡 .
```
If we were to have an end cost of 𝐺(𝑥(𝑇)) = 12 𝑥(𝑇)2, we would have a boundary
```
```
condition 𝑉(𝑥, 𝑇) = 12 𝑥2 making 𝑠(𝑇) = 12 and a value function of (∗ check ∗)
```
```
𝑉(𝑥, 𝑡) = 𝑥2 3𝑒
```
2𝑇 − 𝑒2𝑡
3𝑒2𝑇 + 𝑒2𝑡 .
```
These two payoff functions 𝐺(𝐵) = 0 and 𝐺(𝐵) = 𝐵2 are readily matched by
```
solutions to the Riccati equation. Other payoff functions would be significantly
more challenging to accommodate.
The following example demonstrates the HJB technique for maximizing a payoff
where we use a trick to satisfy the boundary conditions.
Example 11.5: King Tiny’s Value Function
King Tiny wants to maximize the utility of consumption ∫100 √𝑢 𝑑𝑡 subject to
exponential growth minus consumption 𝑥′ = 0.2𝑥 − 𝑢.
```
For 𝑇 = 10, the value 𝑉(𝑥, 𝑡) is the remaining utility to be gained assuming
```
the economy is at 𝑥 at time 𝑡 < 10.
The HJB equation would then be
```
0 = 𝜕𝑉𝜕𝑡 + maxᵆ {𝑢1/2 + 𝜕𝑉𝜕𝑥 (0.2 𝑥 − 𝑢)} .
```
```
A local max is 𝑢 = 1/ (2 𝜕𝑉𝜕𝑥 )
```
2
producing
0 = 𝜕𝑉𝜕𝑡 + 1
4 𝜕𝑉𝜕𝑥
- .2 𝑥 𝜕𝑉𝜕𝑥
```
which is our HJB PDE (∗ check these steps ∗).
```
This is a nonlinear PDE, a notoriously difficult animal to tame, and it is not
obvious how to proceed. Thinking about the 1/ 𝜕𝑉𝜕𝑥 and 𝑥 𝜕𝑉𝜕𝑥 terms, one may guess
```
that 𝑉(𝑥, 𝑡) should have a 𝑥1/2 term, and after some trial and error a solution form
```
```
𝑉 = (𝑥𝑊(𝑡))1/2
```
works pretty well.
Substituting
𝜕𝑉
𝜕𝑥 =
1
2 𝑥
− 12 𝑊12 ,
𝜕𝑉
𝜕𝑡 =
1
2 𝑥
1
2 𝑊 −
1
2 𝑊 ′
11.3. Hamilton-Jacobi-Bellman Equation 185
yields
0 = 𝑊 ′ + 1 + 15 𝑊.
```
Solving this linear first-order equation brings us to (∗ check this ∗)
```
```
𝑉(𝑥, 𝑡) = (𝑥 (𝑒𝐾−𝑡/5 − 5))1/2
```
where 𝐾 is the constant of integration.
```
For boundary conditions, we reason that 𝑉(0, 𝑡) = 0 for all 𝑡: if we have
```
no capital, 𝑥 = 0, then we have nothing to spend or invest. This condition is
automatically satisfied by the above solution for any 𝐾.
```
We also argue that 𝑉(𝑥, 10) = 0, because at 𝑡 = 10 we are simply out of time:
```
∫1010 √𝑢 𝑑𝑡 = 0. We can satisfy this condition by choosing 𝐾 = 2 + ln 5 to make
```
𝑉(𝑥, 𝑡) = (5𝑥(𝑒2−𝑡/5 − 1))1/2 .
```
```
And now we have a problem. Nowhere have we used or required 𝑥(10) = 2, and
```
there seems to be nowhere in this solution to incorporate this requirement.
Here is how we reason our way out of this conundrum: if we were to have a
```
fixed time 𝑇 = 10 but a free endpoint 𝑥(𝑇), then the above would be a solution
```
that satisfies the HJB equation. But if we did have a free endpoint, it stands to
```
reason that 𝑥(𝑇) = 0, since any leftover money could have been spent to increase
```
performance. So we assume the above value function is for a fixed time 𝑇 = 10
```
and free endpoint 𝑥(𝑇), which makes 𝑥(10) = 0.
```
```
So how do we make 𝑥(10) = 2? At time 𝑡 = 0 set aside just enough money
```
to accrue to 2 dollars after 10 years at growth rate of 0.2, which would be 2/𝑒2 =
0.2707 . . . . Then optimize spending the rest of the funds, 1 − 2/𝑒2, with the un-
```
derstanding that they will be depleted. So 𝑉(𝑥, 𝑡) is the solution for 𝑥(10) = 0,
```
```
whereas ˆ𝑉 = 𝑉(𝑥 − 2/𝑒2, 𝑡) is the solution to our King Tiny problem with 𝑥(10) =
```
2.
Indeed, we check that
```
ˆ𝑉(1, 0) = 𝑉(1 − 2/𝑒2, 0) = √5(1 − 2/𝑒2)(𝑒2 − 1) = 4.827 . . .
```
corresponds to our calculation in Example 4.4.
We conclude this chapter with an HJB analysis of the Rocket Sled soft-landing
problem.
Example 11.6: Rocket Sled Value
In Example 11.3 we considered the Rocket Sled with friction 𝑥′ = 𝑦, 𝑦′ = −𝑦 + 𝑢,
performance 𝐽 = ∫𝑇0 𝑢2 𝑑𝑡, and we computed the minimum cost to move from a
```
given initial position and velocity (𝑥, 𝑦) to (0, 0) in 𝑇 time units as
```
```
̃𝐽(𝑥0, 𝑦0, 𝑇) = (𝑒2𝑇 −1)𝑥20+2(𝑒𝑇 −1)
```
```
2𝑥0𝑦0+(𝑒2𝑇 −4𝑒𝑇 +2𝑇+3)𝑦20
```
```
(𝑒𝑇 −1)(𝑒𝑇 (𝑇−2)+𝑇+2) .
```
This is an optimal performance function, not a value function. A value func-
tion starts with a specified end time 𝑇 and is a function of remaining cost/payoff
```
at time 𝑡 < 𝑇. This is an autonomous case (𝑓 and 𝑔 do not depend on 𝑡), so for
```
186 Chapter 11. Time, Value, and HJB Equation
any given 𝑇, the value function would be
```
𝑉(𝑥, 𝑦, 𝑡) =̃ 𝐽(𝑥, 𝑦, 𝑇 − 𝑡).
```
Making this substitution and simplifying yields
```
𝑉(𝑥, 𝑦, 𝑡) = 𝑒
```
```
2𝑡(𝑦2(2𝑡−2𝑇−3)+𝑥2−2𝑥𝑦)+4𝑦𝑒𝑡+𝑇 (𝑥+𝑦)−𝑒2𝑇 (𝑥+𝑦)2
```
```
(𝑒𝑇 −𝑒𝑡)(𝑒𝑡(𝑡−𝑇−2)+𝑒𝑇 (𝑡−𝑇+2)) (11.2)
```
```
This function 𝑉(𝑥, 𝑦, 𝑡) would have to satisfy the HJB equation for two state
```
```
variables:
```
```
− 𝜕𝑉𝜕𝑡 (𝑥, 𝑡) = minᵆ {𝑢2 + 𝜕𝑉𝜕𝑥 𝑦 + 𝜕𝑉𝜕𝑦 (−𝑦 + 𝑢)} .
```
```
We calculate that 𝑢 = − 12𝜕𝑉𝜕𝑦 minimizes 𝑢2 + 𝜕𝑉𝜕𝑥 𝑦 + 𝜕𝑉𝜕𝑦 (−𝑦 + 𝑢) and our HJB
```
PDE reduces to
− 𝜕𝑉𝜕𝑡 = − 14𝜕𝑉𝜕𝑦
2
- 𝑦 ( 𝜕𝑉𝜕𝑥 − 𝜕𝑉𝜕𝑦 ) .
```
The gentle reader may wish to whip out a pencil and verify that expression (11.2)
```
satisfies this PDE. Or not.
Key Points
Pontryagin’s method covered in previous chapters involves systems of ordinary differ-
ential equations in state-costate space to find necessary conditions for an optimal con-
trol, and it derives directly from Lagrange multipliers.
In this chapter we explored an alternate approach to optimal control using partial
```
differential equations (PDEs). We directly formulated a PDE for time optimal problems
```
and explored the Hamilton-Jacobi-Bellman PDE for the more general value function
in optimal control problems. The advantage of this approach is that it defines perfor-
mance as a function of starting location and time. The disadvantage is that the PDEs
are typically difficult to solve and challenging to numerically estimate.
The Hamilton-Jacobi-Bellman approach is closely related to Pontryagin’s methods
and arises directly from the Principle of Optimality applied on the scale of differentials.
Exercises
Exercise 11.1. Rocket Race on Ice V. Consider the Rocket Race without friction 𝑥″ = 𝑢
with limits |𝑢| ≤ 1.
```
(a) Compute the minimum time ˜𝑇(𝑥0, 𝑦0) for transition from (𝑥0, 𝑦0) to the hori-
```
```
zontal line 𝑦 = 0. Verify that 𝑑𝑑𝑡 ˜𝑇(𝑥(𝑡), 𝑦(𝑡)) = −1 along optimal trajectories.
```
```
(b) Compute the minimum time ˜𝑇(𝑥0, 𝑦0) for transition from (𝑥0, 𝑦0) to the ver-
```
```
tical line 𝑥 = 0. Verify that 𝑑𝑑𝑡 ˜𝑇(𝑥(𝑡), 𝑦(𝑡)) = −1 along optimal trajectories.
```
Exercise 11.2. Rocket Race on Ice VI. Consider the Rocket Race without friction 𝑥″ = 𝑢
```
with limits |𝑢| ≤ 1 and the goal is to reach the origin (0, 0) in minimal time from a
```
```
general starting point. In Exercise 10.5 it was calculated that for an initial point (𝑥0, 𝑦0)
```
in the 𝑢 = −1 region the minimal time was
```
˜𝑇(𝑥0, 𝑦0) = 𝑦0 + √𝑥0 + 12 𝑦20.
```
Exercises 187
Verify this as follows:
```
(a) Show that 𝑑𝑑𝑡 ˜𝑇(𝑥(𝑡), 𝑦(𝑡)) = −1 for an optimal trajectory (𝑥(𝑡), 𝑦(𝑡)) in the 𝑢 =
```
−1 region.
```
(b) Show that the function has the correct value, ˜𝑇(𝑥, 𝑦) = 𝑦, for any point (𝑥, 𝑦)
```
on the incoming 𝑢 = +1 trajectory to the origin.
```
Exercise 11.3(hs). Formulate and solve the HJB PDE for the controlled system 𝑥′ =
```
```
𝑥 + 𝑢 with cost 𝐽 = 𝑥2(𝑇) + ∫𝑇0 𝑥2 + 𝑢2 𝑑𝑡, where 𝑇 is fixed and 𝑥(𝑇) is free.
```
Exercise 11.4. Formulate the HJB equation for the general linear-quadratic case of
```
minimizing 𝐺(𝑥(𝑇)) + ∫𝑇0 𝑎𝑥2 + 𝑏𝑢2 𝑑𝑡 with 𝑥′ = 𝑚𝑥 + 𝑢 for a fixed 𝑇 and free 𝑥(𝑇).
```
```
Show that a guess of the form 𝑉 = 𝑥2𝑠(𝑡) leads to a Riccati differential equation.
```
```
Exercise 11.5(hs). Construct the value function for King Tiny with a discounted future
```
```
(Example 4.5). Check that 𝑉(1 − 2/𝑒2, 0) = 3.540 . . . .
```
```
Exercise 11.6(s). Consider minimizing 𝐽 = ∫𝑇0 𝑢2 𝑑𝑡 with 𝑥′ = 𝑢, fixed time 𝑇, and
```
```
𝑥(𝑇) = 0.
```
```
(a) Solve this using Principle I with 𝑥(0) = 𝑥0, and determinẽ 𝐽 as a function of
```
𝑥0 and 𝑇.
```
(b) Derive the HJB equation for this system.
```
```
(c) Using your result from part (a), show that 𝑉(𝑥, 𝑡) =̃ 𝐽(𝑥, 𝑇 − 𝑡) satisfies the
```
```
PDE from part (b).
```
```
Exercise 11.7(hs). Consider the Rocket Sled without friction 𝑥″ = 𝑢 and with perfor-
```
mance 𝐽 = ∫𝑇0 𝑢2 𝑑𝑡.
```
(a) Calculate the minimum cost to move from a given initial position and velocity
```
```
(𝑥, 𝑦) to (0, 0) in 𝑇 time units as a functioñ 𝐽(𝑥, 𝑦, 𝑇).
```
```
(b) Formulate the Hamilton-Jacobi-Bellman equation for the value function
```
```
𝑉(𝑥, 𝑦, 𝑡).
```
```
(c) Show that 𝑉(𝑥, 𝑦, 𝑡) =̃ 𝐽(𝑥, 𝑦, 𝑇 − 𝑡) satisfies this equation.
```
```
Exercise 11.8(s). Canoe IV: Value. Recall the Canoe problems, Exercises 6.4–6.6, where
```
you have a controlled system 𝑥′ = 1 + 𝑢, a fixed time 𝑇, a given starting point, a free
```
endpoint 𝑥(𝑇), and a payoff function
```
```
𝐽 = 𝑥(𝑇) (4 − 𝑥(𝑇)) − ∫
```
𝑇
0
𝑢2 𝑑𝑡.
```
(a) Derive the value function directly from the definition
```
```
𝑉(𝑥𝑡, 𝑡) = maxᵆ {𝐺(𝑥(𝑇)) + ∫𝑇𝑡 𝑔(𝑥, 𝑢, 𝜏) 𝑑𝜏} .
```
188 Chapter 11. Time, Value, and HJB Equation
I recommend using this approach: we know from previous work that the control will
be constant, 𝑢 = 𝑘, so for a fixed 𝑇 > 0, any 𝑡 < 𝑇, any 𝑥𝑡, solve for the above maximum
```
over 𝑘 assuming 𝑥′ = 1 + 𝑘 with 𝑥(𝑡) = 𝑥𝑡.
```
```
(b) Compute the HJB equation and show that your value function 𝑉(𝑥, 𝑡) satisfies
```
the PDE.
12
Differential Games
In optimal control, an agent optimizes their choices in a contest against nature. In
dynamic games, multiple agents are operating in the same environment, and each will
optimize their choices against nature plus what they anticipate the other agents may
be doing. This is game theory. The difference between an optimization problem and a
game is that a game requires opponents with brains who will anticipate your actions.
Depending on the game, the agent’s goals may benefit each other, interfere with
each other, or be in direct opposition to each other. Pontryagin’s principles readily
generalize to these situations and allow concurrent optimizations for all agents.
12.1 Games
Nash equilibria are places where games are in equilibrium. Suppose we have a game
in which player 𝐼 uses strategy 𝐴 and player 𝐼𝐼 uses strategy 𝐵. The strategy pair 𝐴, 𝐵 is
a Nash equilibrium if:
When 𝐼𝐼 plays 𝐵, 𝐼 can do no better than to play 𝐴.
When 𝐼 plays 𝐴, 𝐼𝐼 can do no better that to play 𝐵.
For example, in the driving game players 𝐼 and 𝐼𝐼 must decide to drive on the right
or left side of the road when approaching each other. If they both drive on the right,
they pass each other without incident and each gets a payoff of one point for their
coordinated solution. The same is true if they both drive on the left. But if one drives
on the right and the other drives on the left, then they crash into each other and they
each get a payoff of zero.
Both players driving on the right is a Nash equilibrium. If 𝐼 drives on the right, 𝐼𝐼
can do no better than to also drive on the right and can do quite a bit worse by driving
on the left, and vice versa. Both players driving on the left is also a Nash equilibrium,
and it behooves one to pay attention to which Nash equilibria are in effect in whatever
culture one may find oneself.
189
190 Chapter 12. Differential Games
Nash equilibria are important because if a game is to be played consistently and
rationally, it must be played at a Nash equilibrium.
Curiously, in the driving game, randomizing 50-50 to drive on the right or left is
also a Nash equilibrium—if everyone else is doing it, you can do no better than to do
so yourself. A Nash equilibrium is necessary for consistent rational play, but it is not
sufficient. There are many nuances to the theory of games, but we will stick to a basic
application of Pontryagin to identify Nash equilibria in differential games.
12.2 Differential Games
Differential games are played out over a period of time with continuous actions. We
motivate the topic with the following classic example that we can intuitively reason
without getting mathematically rigorous.
Example 12.1: Guard the Target
Two agents run around anywhere on a flat playing field and are equally matched
in speed and agility. Agent 𝐼𝐼 is the invader and wants to get as close to a target
region 𝑅 as she possibly can, and agent 𝐼 is the defender and must try to keep
player 𝐼𝐼 as far away as he possibly can. An example of this game is depicted in
Figure 12.1. The game ends when the two players intercept each other, and the
distance from the point of interception to the target region is the payoff for player
𝐼𝐼 and the cost for player 𝐼.
Figure 12.1. Player 𝐼 is guarding the shaded target region from
player 𝐼𝐼.
How will this game play out if both players play optimally? See Exercise 12.1
for the solution. Check out Paul Nahin’s book [18] for other interesting examples
of pursuit and evasion dynamics.
12.2.1 Pontryagin Games. Two agents, player 𝐼 and player 𝐼𝐼, can influence the
state 𝑥 of some system, which may be a vector of values, according to a specified dy-
namic
```
𝑥′ = 𝑓(𝑥, 𝑢, 𝑣)
```
12.2. Differential Games 191
where player 𝐼 operates control 𝑢 and player 𝐼𝐼 operates control 𝑣, and the game begins
```
with some initial state 𝑥(0) = 𝑥0.
```
The game terminates at time 𝑇 and the payoffs for players 𝐼 and 𝐼𝐼 are, respectively,
```
𝐽𝐼 = 𝐺𝐼 (𝑥(𝑇)) + ∫𝑇0 𝑔𝐼 (𝑥, 𝑢, 𝑣) 𝑑𝑡,
```
```
𝐽𝐼𝐼 = 𝐺𝐼𝐼 (𝑥(𝑇)) + ∫𝑇0 𝑔𝐼𝐼 (𝑥, 𝑢, 𝑣) 𝑑𝑡,
```
which we assume each player wants to maximize. The idea of a Nash equilibrium is a
pair of control functions 𝑢∗1, 𝑢∗2 such that:
Given 𝑢2 = 𝑢∗2, 𝐽𝐼 is maximized at 𝑢1 = 𝑢∗1.
Given 𝑢1 = 𝑢∗1, 𝐽𝐼𝐼 is maximized at 𝑢2 = 𝑢∗2.
Applying Pontryagin, the agents 𝐼 and 𝐼𝐼 would have the following Hamiltonians,
```
respectively:
```
```
𝐻𝐼 = 𝑔𝐼 (𝑥, 𝑢, 𝑣) + 𝜆𝐼 𝑓(𝑥, 𝑢, 𝑣),
```
```
𝐻𝐼𝐼 = 𝑔𝐼𝐼 (𝑥, 𝑢, 𝑣) + 𝜆𝐼𝐼 𝑓(𝑥, 𝑢, 𝑣)
```
and the Nash criteria would be
```
𝑢∗ = argmaxᵆ {𝐻𝐼 (𝑥, 𝑢, 𝑣∗))},
```
```
𝑣∗ = argmax𝑣 {𝐻𝐼𝐼 (𝑥, 𝑢∗, 𝑣)}
```
for all 𝑡. Costates would be driven by dynamics
```
𝜆′𝐼 = − 𝜕𝜕𝑥 𝐻𝐼 (𝑥, 𝑢, 𝑣),
```
```
𝜆′𝐼𝐼 = − 𝜕𝜕𝑥 𝐻𝐼𝐼 (𝑥, 𝑢, 𝑣).
```
Nash equilibria are where repeated games tend to settle, or where perfectly predict-
ing agents will conclude is the only rational way to proceed. This generalizes to control
theory where each player is optimized with respect to the other player’s control.
A basic class of such games is the linear-quadratic games, with
𝑥′ = 𝐴𝑢 + 𝐵𝑣 + 𝐶𝑥
and
𝑔𝐼 = 𝛼𝐼 𝑢2 + 𝛽𝐼 𝑣2 + 𝛾𝐼 𝑥2 𝑑𝑡,
𝑔𝐼𝐼 = 𝛼𝐼𝐼 𝑢2 + 𝛽𝐼𝐼 𝑣2 + 𝛾𝐼𝐼 𝑥2.
The following example is a simple case of a linear-quadratic game.
Example 12.2: Rugby Maul
```
Suppose a rugby ball is at position 𝑥(0) = 0 on the field, and with time limit
```
```
𝑇 = 2, team 𝐼 deploys effort 𝑢 to maximize 𝑥(2) and team 𝐼𝐼 deploys effort 𝑣 to
```
```
minimize 𝑥(2), resulting in a dynamic
```
𝑥′ = 𝛼𝑢 − 𝛽𝑣
192 Chapter 12. Differential Games
where 𝛼, 𝛽 > 0 represent the abilities of teams 𝐼 and 𝐼𝐼, respectively. Making an
effort comes with a cost, so let’s say the payoffs for teams 𝐼 and 𝐼𝐼 are
```
𝐽𝐼 = 𝑥(2) − ∫20 𝑢2 𝑑𝑡,
```
```
𝐽𝐼𝐼 = −𝑥(2) − ∫20 𝑣2 𝑑𝑡.
```
Team 𝐼 will apply Pontryagin’s method and construct a Hamiltonian
```
𝐻𝐼 = −𝑢2 + 𝜆𝐼 (𝛼𝑢 − 𝛽𝑣)
```
which they will maximize as
𝜕ᵆ𝐻𝐼 = −2𝑢 + 𝜆𝐼 𝛼 = 0 ⟹ 𝑢 = 12 𝜆𝐼 𝛼.
Team 𝐼 will consider the costate dynamic 𝜆′𝐼 = − 𝜕𝐻𝐼𝜕𝑥 = 0 making 𝜆𝐼 constant.
```
Since 𝑥(𝑡) is free and the end payoff is 𝐺𝐼 (𝐵) = 𝐵, team 𝐼 infers 𝜆𝐼 = 𝐺′𝐼 (𝐵) = 1.
```
```
Putting this together, player 𝐼 applies effort 𝑢 = 12 𝛼 (∗ check this ∗).
```
```
Team 𝐼𝐼 applies similar reasoning with 𝐻𝐼𝐼 = −𝑣2 +𝜆𝐼𝐼 (𝛼𝑢−𝛽𝑣) and 𝐺𝐼𝐼 (𝐵) =
```
−𝐵 and concludes that their Nash equilibrium choice is to apply effort 𝑣 = 12 𝛽
```
(∗ check this ∗).
```
This results in a dynamic
𝑥′ = 12 𝛼2 − 12 𝛽2
```
and so the ball ends up at 𝑥(2) = 𝛼2 − 𝛽2.
```
The resulting payoffs are
𝐽𝐼 = 12 𝛼2 − 𝛽2,
𝐽𝐼𝐼 = −𝛼2 + 12 𝛽2.
If the two teams are evenly matched, say, 𝛼 = 𝛽 = 1, then the ball ends up
at 𝑥 = 0 and each team gets a payoff of 𝐽𝐼 = 𝐽𝐼𝐼 = −1/2. If one team is stronger,
say, 𝛼 = 2 and 𝛽 = 1, the ball will end up at 𝑥 = 3. The first team expends effort
𝑢 = 1 at a cost of ∫20 1 𝑑𝑡 = 2 and net payoff 𝐽𝐼 = 1. The weaker team expends
less effort 𝑣 = 1/2 at a cost of ∫20 1/4 𝑑𝑡 = 1/2 and a net payoff of 𝐽𝐼𝐼 = −7/2.
Note that the amount of effort a team expends depends only on their own
ability and not on the ability or strategy of their opponent.
The following is a game of cooperation, with a nonlinear control.
Example 12.3
Two agents cooperate in a game where progress is proportional to each player’s
efforts as
```
𝑥′ = (𝑢 − 1)(𝑣 − 1)
```
where 𝑢 is agent 𝐼’s control and 𝑣 is agent 𝐼𝐼’s control, and we stipulate 𝑢, 𝑣 ≥ 1.
So either player making minimal effort results in zero progress.
12.3. War 193
```
There is a fixed end time 𝑇, initial value 𝑥(0) = 0, and each player values
```
```
the end result differently: player 𝐼 has value 𝛼𝑥(𝑇) and player 𝐼𝐼 has value 𝛽𝑥(𝑇).
```
Assuming costs are quadratic in effort, we have payoff functions
```
𝐽𝐼 = 𝛼𝑥(𝑇) − ∫𝑇0 𝑢2 𝑑𝑡,
```
```
𝐽𝐼𝐼 = 𝛽𝑥(𝑇) − ∫𝑇0 𝑣2 𝑑𝑡.
```
From player 𝐼’s perspective we have
```
𝐻𝐼 = −𝑢2 + 𝜆𝐼 (𝑢 − 1)(𝑣 − 1)
```
with
𝜕
```
𝜕𝑢 𝐻𝐼 = −2𝑢 + 𝜆𝐼 (𝑣 − 1)
```
```
and 𝐻𝐼 is maximized at 𝑢 = 𝜆𝐼 (𝑣 − 1)/2.
```
```
With 𝜕𝐻𝐼𝜕𝑥 = 0 we have that 𝜆𝐼 is constant. Since 𝑥(𝑇) is free, we have 𝜆𝐼 =
```
```
𝐺′(𝐵) = 𝛼, and we conclude 𝑢 = 𝛼(𝑣 − 1)/2.
```
From player 𝐼𝐼’s perspective we have
```
𝐻𝐼𝐼 = −𝑣2 + 𝜆𝐼𝐼 (𝑢 − 1)(𝑣 − 1)
```
```
and by similar reasoning we conclude 𝑣 = 𝛽(𝑢 − 1)/2.
```
```
Simultaneously solving 𝑢 = 𝛼(𝑣 − 1)/2 and 𝑣 = 𝛽(𝑢 − 1)/2 yields
```
```
𝑢 = 𝛼(1 + 𝛽)𝛼𝛽 − 1 , 𝑣 = 𝛽(1 + 𝛼)𝛼𝛽 − 1 .
```
For example, if the players valued the outcome at rates 𝛼 = 2 and 𝛽 = 1, then
player 𝐼 would expend effort 𝑢 = 4 and get a net payoff of 𝐽𝐼 = 4𝑇, and player 𝐼𝐼
```
would expend less effort 𝑣 = 3 and get a net payoff of 𝐽𝐼𝐼 = 3𝑇/2 (∗ verify this ∗).
```
Note the game-theoretic structure of this Nash equilibrium. If we just as-
sume that player 𝐼 will use 𝑢 = 4 and then player 𝐼𝐼 maximizes accordingly, she
will optimize by playing 𝑣 = 3. If we assume player 𝐼𝐼 uses 𝑣 = 3, then player 𝐼
will optimize by playing 𝑢 = 4. No other pair of controls will have this property:
the Nash equilibrium is a unique solution.
Pontryagin analysis of games generalizes to higher-dimensional state spaces, often
with one variable for each player.
The situation could be a zero-sum game where the payers are exactly in direct
```
opposition: 𝐽1 = −𝐽2. Here we would have a single Hamiltonian that one player wants
```
to maximize and the other wants to minimize, as explored in the next section.
12.3 War
There are several ways to model armed conflict. One example that is popular in the
differential games literature is Attrition and Attack popularized by Rufus Isaacs and
```
Avner Friedman ([7, 8]).
```
194 Chapter 12. Differential Games
Example 12.4: Attrition and Attack
Tweedle-Dee and Tweedle-Dum agreed to have a Battle. Dee and Dum have mil-
itary resources 𝑥 and 𝑦, respectively, and the Battle will have a fixed time pe-
riod [0, 𝑇]. For a short battle, Dee and Dum would simply bring all resources to
the battlefield, and victory would go to the one who brought the most resources.
Bringing resources to the battlefield is the “attack” strategy.
For a longer Battle, it may be good to divert some of your military from the
battlefield and direct them to guerrilla attacks on the enemy’s supply line, thereby
reducing the enemy’s military power. This is the “attrition” strategy.
Dee and Dum have fixed military industrial production rates 𝑚𝑥 and 𝑚𝑦.
Without any guerrilla attacks, their military resources would grow as
𝑥′ = 𝑚𝑥,
𝑦′ = 𝑚𝑦.
Dee can control the proportion, 𝑢𝑥, of his forces that he dedicates to guerrilla
attacks, and the effectiveness of these attacks is reflected by the parameter 𝑎𝑥, and
similarly for Dum, resulting in
𝑥′ = 𝑚𝑥 − 𝑎𝑦𝑢𝑦𝑦,
𝑦′ = 𝑚𝑦 − 𝑎𝑥𝑢𝑥𝑥.
Victory goes to the combatant that brings the most net resources to the battle-
field over the given time period. We take the payoff as the difference in battlefield
resources over the time period:
𝐽 = ∫
𝑇
0
```
(1 − 𝑢𝑥) 𝑥 − (1 − 𝑢𝑦) 𝑦 𝑑𝑡.
```
Dee wants to maximize this, while Dum wants to minimize it.
We will show that optimal play results in the following:
• Near the end time 𝑇, both players dedicate all forces to the battlefield, 𝑢𝑥 =
𝑢𝑦 = 0.
• If 𝑇 is sufficiently large, both players will start out dedicating all resources to
```
attrition: 𝑢𝑥 = 𝑢𝑦 = 1.
```
```
• Each player makes a single switch from attrition to attack (bang-bang).
```
• The player with the largest effect parameter, 𝑎𝑖, is the last player to switch.
```
Generically, we would have 𝑎𝑥 ≠ 𝑎𝑦, and we can assume 𝑎𝑥 > 𝑎𝑦 (See Exer-
```
```
cise 12.4 for the case 𝑎𝑥 = 𝑎𝑦.) With this assumption, Dum (playing 𝑦) switches
```
```
first and Dee (playing 𝑥) switches second.
```
12.3. War 195
We will see that this defines three epochs. Working backwards we will have:
Final Epoch: 𝑇−1 < 𝑡 < 𝑇: All forces dedicated to attacking, 𝑢𝑥 = 𝑢𝑦 = 0.
Middle Epoch: 𝑇−2 < 𝑡 < 𝑇−1: Dee is attrition 𝑢𝑥 = 1, and Dum is attacking
𝑢𝑦 = 0.
Beginning Epoch: 0 < 𝑡 < 𝑇−2: All forces dedicated to attrition, 𝑢𝑥 = 𝑢𝑦 = 1.
To battle, then:
This is a zero-sum game with a single Hamiltonian
```
𝐻 = (1 − 𝑢𝑥)𝑥 − (1 − 𝑢𝑦)𝑦 + 𝜆𝑥(𝑚𝑥 − 𝑎𝑦𝑢𝑦𝑦) + 𝜆𝑦(𝑚𝑦 − 𝑎𝑥𝑢𝑥𝑥)
```
```
which is linear in 𝑢𝑥 and 𝑢𝑦, and therefore the controls are bang-bang (or station-
```
```
ary, but this possibility is eliminated in Exercise 12.5). And so the agents either
```
dedicate all their forces to the battlefield or all to guerrilla attacks.
At each point in time, Dee wants to operate his control to maximize 𝐻. We
have 𝜕𝐻
```
𝜕ᵆ𝑥= −𝑥 − 𝜆𝑦𝑎𝑥𝑥 = −𝑥(1 + 𝜆𝑦𝑎𝑥)
```
so, assuming 𝑥 > 0, Dee has control strategy
𝜆𝑦 > −1/𝑎𝑥 ⟹ 𝜕𝐻𝜕ᵆ𝑥< 0 ⟹ 𝑢𝑥 = 0,
𝜆𝑦 < −1/𝑎𝑥 ⟹ 𝜕𝐻𝜕ᵆ𝑥> 0 ⟹ 𝑢𝑥 = 1.
Contrariwise, Dum wants to minimize 𝐻. So
𝜕𝐻
```
𝜕ᵆ𝑦= 𝑦 − 𝜆𝑥𝑎𝑦𝑦 = 𝑦(1 − 𝜆𝑥𝑎𝑦)
```
yields Dum’s control strategy:
𝜆𝑥 < 1/𝑎𝑦 ⟹ 𝜕𝐻𝜕ᵆ𝑦> 0 ⟹ 𝑢𝑦 = 0,
𝜆𝑥 > 1/𝑎𝑦 ⟹ 𝜕𝐻𝜕ᵆ𝑦< 0 ⟹ 𝑢𝑦 = 1.
The costate equations will drive the timing for the optimal strategies and are
given by
```
𝜆′𝑥 = − 𝜕𝐻𝜕𝑥 = −(1 − 𝑢𝑥) + 𝜆𝑦𝑎𝑥𝑢𝑥,
```
```
𝜆′𝑦 = − 𝜕𝐻𝜕𝑦 = (1 − 𝑢𝑦) + 𝜆𝑥𝑎𝑦𝑢𝑦.
```
```
Since the end locations for 𝑥 and 𝑦 are free, we have 𝜆𝑥(𝑇) = 𝜆𝑦(𝑇) = 0. This
```
```
shows that the end-game is to have all forces on the battlefield, 𝑢𝑥(𝑇) = 𝑢𝑦(𝑇) =
```
0. Thus the final epoch has
𝜆′𝑥 = −1,
𝜆′𝑦 = 1.
Figure 12.2 shows the final epoch in the costate plane, with the terminal
```
point being (𝜆𝑥, 𝜆𝑦) = (0, 0).
```
196 Chapter 12. Differential Games
Figure 12.2. Optimal solution for final epoch in costate space.
Under the assumption 𝑎𝑥 > 𝑎𝑦, Dee will be the last to switch strategies,
at time 𝑇−1 = 𝑇 − 1/𝑎𝑥. The final epoch for time 𝑇−1 ≤ 𝑡 ≤ 𝑇 begins with
```
𝜆𝑥(𝑇−1) = 1/𝑎𝑥 and 𝜆𝑦(𝑇−1) = −1/𝑎𝑥.
```
The middle epoch has 𝜆𝑥 < 1/𝑎𝑦 and 𝜆𝑦 < −1/𝑎𝑥 making 𝑢𝑥 = 1, 𝑢𝑦 = 0,
and
𝜆′𝑥 = 𝜆𝑦𝑎𝑦,
𝜆′𝑦 = 1.
Note 𝜆′𝑦 > 0 and 𝜆′𝑥 < 0. The beginning of the middle epoch is characterized by
Dum switching strategies when 𝜆𝑥 = 1/𝑎𝑦. This epoch is shown in Figure 12.3.
Figure 12.3. Optimal solution for middle and final epoch in
costate space.
12.3. War 197
To determine the beginning of the middle epoch we need to solve the follow-
ing for 𝑇−2:
𝜆′𝑥 = 𝜆𝑦𝑎𝑥,
𝜆′𝑦 = 1,
```
𝜆𝑥(𝑇−1) = 1/𝑎𝑥,
```
```
𝜆𝑦(𝑇−1) = −1/𝑎𝑥,
```
```
𝜆𝑥(𝑇−2) = 1/𝑎𝑦
```
where 𝑇−1 = 𝑇 − 1/𝑎𝑥. This is not terribly difficult, but it gets messy real fast if
you just jump in and start swinging. The following is a better approach.
```
Let 𝑈(𝑡) = 𝜆𝑥(𝑡 + 𝑇−2) − 1/𝑎𝑥 and 𝛿 = 1/𝑎𝑦 − 1/𝑎𝑥. The above then reduces
```
to solving for 𝜖 in the following:
𝑈″ = 𝑎𝑥,
```
𝑈(𝜖) = 0,
```
```
𝑈′(𝜖) = −1,
```
```
𝑈(0) = 𝛿.
```
```
This system can be solved as (∗ check this ∗)
```
𝜖 = 1𝑎
𝑥
```
(−1 +
```
√
2 𝑎𝑥𝑎
𝑦
```
− 1) .
```
Then 𝜖 is the time length of the middle epoch and
𝑇−2 = 𝑇−1 − 𝜖 = 𝑇 − 1𝑎
𝑥
```
(
```
√
2 𝑎𝑥𝑎
𝑦
```
− 1) .
```
The first epoch 0 < 𝑡 < 𝑇−2 is then defined by
𝜆′𝑥 = 𝜆𝑦𝑎𝑦,
𝜆′𝑦 = 𝜆𝑥𝑎𝑥
with eigenvalues 𝑒1, 𝑒2 for associated eigenvectors 𝐯1, 𝐯2,
```
𝑒1 = √𝑎𝑥𝑎𝑥 ⇄ 𝐯𝟏 = (√𝑎𝑥, √𝑎𝑦) ,
```
```
𝑒2 = −√𝑎𝑥𝑎𝑥 ⇄ 𝐯𝟐 = (√𝑎𝑥, −√𝑎𝑦) .
```
Since 𝜆′𝑥 < 0 and 𝜆′𝑦 > 0 in this region, it is clear that neither player will cross a
switching threshold until the end of the first epoch 0 < 𝑡 < 𝑇−2. The full costate
trajectory is depicted in Figure 12.4.
198 Chapter 12. Differential Games
Figure 12.4. Complete optimal solution in costate space.
We’re done with the costates in this case. We only needed them to determine
the switching times
𝑇−1 = 𝑇 − 1𝑎𝑥,
```
𝑇−2 = 𝑇 − 1𝑎𝑥 (√2 𝑎𝑥𝑎𝑦− 1) .
```
To solve for the trajectories, just turn things around and stitch together the
three epochs. We assume that the states 𝑥 and 𝑦 remain positive. Things get more
complicated, perhaps not even well defined, if one of the states hits zero.
```
We begin with prescribed values for 𝑥(0) and 𝑦(0) and flow under the system
```
𝑥′ = 𝑚𝑥 − 𝑎𝑦𝑦,
𝑦′ = 𝑚𝑦 − 𝑎𝑥𝑥
```
for time 0 < 𝑡 < 𝑇−2. Use the terminal states 𝑥(𝑇−2) and 𝑦(𝑇−2) as new initial
```
states to flow under
𝑥′ = 𝑚𝑥 − 𝑎𝑦𝑦,
𝑦′ = 𝑚𝑦
```
for time 𝑇−2 < 𝑡 < 𝑇−1. Then again use the terminal states 𝑥(𝑇−1) and 𝑦(𝑇−1) as
```
new initial states to flow under
𝑥′ = 𝑚𝑥,
𝑦′ = 𝑚𝑦
for time period 𝑇−1 < 𝑡 < 𝑇.
Exercises 199
```
The payoff is then (remember that we assume 𝑎𝑥 > 𝑎𝑦)
```
𝐽 = ∫
𝑇−1
𝑇−2
−𝑦 𝑑𝑡 + ∫
𝑇
𝑇−1
𝑥 − 𝑦 𝑑𝑡.
Tweedle-Dee wins if this is positive, Tweedle-Dum if this is negative.
If they can figure this out, maybe they don’t have to battle and can work
together to fix the rattle, before the monstrous crow arrives.
Key Points
Pontryagin’s principles can be applied to game theory, where multiple agents are each
trying to optimize with respect to the situation and their assumption as to what the
other agents will do. The solution is that each player co-optimizes their own Hamil-
tonian.
This extends the concept of a Nash equilibrium to games defined by differential
equations.
Exercises
```
Exercise 12.1(h). The solution to the Guard the Target game is depicted in Figure 12.5.
```
Provide an intuitive explanation for this solution.
Figure 12.5. Solution to the Guard the Target game.
Exercise 12.2. This linear-quadratic exercise is similar to Example 12.2, but it consid-
ers a case of combining efforts towards a common goal.
```
Suppose our initial state is 𝑥(0) = 0 and we have a fixed end time 𝑇 = 2 and a
```
dynamic 𝑥′ = 𝛼𝑢 + 𝛽𝑣 where 𝑢 is player 𝐼’s control and 𝑣 is player 𝐼𝐼’s control, and
```
𝛼, 𝛽 > 0 represent the players respective abilities. Each player wants to maximize 𝑥(2)
```
and incurs a cost for exercising their control. Their payoffs are
```
𝐽𝐼 = 𝑥(2) − ∫20 𝑢2 𝑑𝑡,
```
```
𝐽𝐼𝐼 = 𝑥(2) − ∫20 𝑣2 𝑑𝑡.
```
200 Chapter 12. Differential Games
Analyze optimal play and outcomes for this game under different scenarios:
```
(a) Equal ability 𝛼 = 1, 𝛽 = 1.
```
```
(b) Unequal ability 𝛼 = 2, 𝛽 = 1.
```
```
(c) Total slacker 𝛼 = 4, 𝛽 = 0.
```
Comment on your results. How does player 𝐼’s optimal strategy depend on player 𝐼𝐼’s
```
ability (and vice versa)?
```
```
Exercise 12.3(s). Consider the cooperation problem from Example 12.3 where the
```
players have equal valuation of the outcome but incur different costs.
```
We have 𝑥′ = (𝑢 − 1)(𝑣 − 1) with 𝑢, 𝑣 > 1 and payoffs
```
```
𝐽𝐼 = 𝑥(𝑇) − ∫𝑇0 𝛾𝑢2 𝑑𝑡,
```
```
𝐽𝐼𝐼 = 𝑥(𝑇) − ∫𝑇0 𝜌𝑣2 𝑑𝑡
```
```
with a fixed end time 𝑇 and initial value 𝑥(0) = 0.
```
```
(a) Find the Nash equilibrium.
```
```
(b) Suppose 𝛾 = 1/2 and 𝜌 = 1. Who makes a greater effort? Who gets a greater
```
payoff?
```
Exercise 12.4(h). What happens if 𝑎𝑥 = 𝑎𝑦 in Attrition and Attack (Example 12.4)?
```
Can you formulate who will win in this case?
```
Exercise 12.5(h). Show that a stationary solution is not viable in Attrition and Attack
```
```
(Example 12.4).
```
Exercise 12.6. Grow or Aggress. Two competitors have resources 𝑥 and 𝑦. They can
each decide whether to allocate these towards their own growth or aggression against
the other:
```
𝑥′ = 𝛼𝑥(1 − 𝑢𝑥)𝑥 − 𝛽𝑦𝑢𝑦𝑦,
```
```
𝑦′ = 𝛼𝑦(1 − 𝑢𝑦)𝑦 − 𝛽𝑥𝑢𝑥𝑥.
```
The payoff is the difference in resources at the end of a fixed time period:
```
𝐽 = 𝑥(𝑇) − 𝑦(𝑇),
```
which 𝐼 wants to maximize and 𝐼𝐼 wants to minimize.
```
Assume 𝑇 is fixed, 𝑥(0), 𝑦(0) are given, 𝑥(𝑇), 𝑦(𝑇) are free. Consider three cases:
```
```
(a) Robust: 𝛼 > 𝛽. Take 𝛼𝑥 = 2, 𝛼𝑦 = 3, and 𝛽𝑥 = 𝛽𝑦 = 1.
```
```
(b) Fragile: 𝛼 < 𝛽. Take 𝛽𝑥 = 2, 𝛽𝑦 = 3, and 𝛼𝑥 = 𝛼𝑦 = 1.
```
```
(c) Mixed: Take 𝛼𝑥 = 3, 𝛽𝑥 = 2, and 𝛼𝑦 = 𝛽𝑦 = 1.
```
Analyze. Find optimal strategies and switching times. Is it possible to formulate
who will win for given starting positions and parameters? What happens if one player
hits zero?
13
Calculus of Variations
In the applied world of engineering and economics Pontryagin’s theory is a subfield of
control theory. In the abstract mathematical world the theory is usually regarded as
a subfield of calculus of variations, and many treatments of optimal control start with
this topic.
The original problem in calculus of variations is the isoperimetric problem of en-
closing the greatest area with a fixed length for perimeter. This dates back to the 4th
century BC in the story of Dido, the first Queen of Carthage. It’s an interesting story,
```
and there’s a pretty cool painting by Gregorio Lazzarini too (look them up).
```
The modern analytic theory of the field started with Euler and Lagrange in the
1750s, then evolved to include more general and increasingly misnamed isoperimetric
problems, and blossomed into our favorite optimal control principles in the mid 1950s
with the work of Lev Pontryagin and his students.
We give a quick rundown of the Euler-Lagrange theory and general isoperimetric
```
problems; they are interesting, powerful, and historically significant. Anyone work-
```
ing in optimal control should know about them, as these ideas are closely related to
Pontryagin’s techniques.
We won’t go into the beautiful Euler-Lagrange proofs, but the reader is encouraged
to seek them out.
13.1 Euler-Lagrange
```
The basic Euler-Lagrange problem is to find the function 𝑦(𝑥) that minimizes
```
𝐽 = ∫
𝑥2
𝑥1
```
𝑔(𝑦, 𝑦′, 𝑥) 𝑑𝑥
```
```
for a given function 𝑔, fixed 𝑥1, 𝑥2, and fixed endpoints 𝑦(𝑥1) = 𝑦1 and 𝑦(𝑥2) = 𝑦2.
```
Solutions to this problem are called extremals.
```
Euler and Lagrange showed that a solution 𝑦(𝑥) must necessarily satisfy
```
𝜕𝑔
𝜕𝑦 −
𝑑
```
𝑑𝑥 (
```
𝜕𝑔
```
𝜕𝑦′ ) = 0.
```
201
202 Chapter 13. Calculus of Variations
Here we have 𝑥 as the independent variable and 𝑦, 𝑦′ as dependent variables. Note
that the derivative with respect to 𝑥 is the full derivative: you have to account for all
dependencies.
Example 13.1
We want to find the extremals for
∫
2
1
```
(𝑦′)2𝑥3 𝑑𝑥
```
```
with 𝑥(1) = 0 and 𝑥(2) = 3.
```
```
This is an Euler-Lagrange problem with 𝑔(𝑦, 𝑦′, 𝑥) = (𝑦′)2𝑥3. A solution
```
must satisfy
```
0 = 𝜕𝑔𝜕𝑦 − 𝑑𝑑𝑥 ( 𝜕𝑔𝜕𝑦′ ) = − 𝑑𝑑𝑥 (2𝑦′𝑥3)
```
making 𝑦′𝑥3 a constant, so 𝑦′ = 𝑐𝑥−3. We conclude 𝑦 = 𝑎𝑥−2 + 𝑏 for some
```
constants 𝑎, 𝑏. We resolve these constants using boundary conditions 𝑥(1) = 0
```
```
and 𝑥(2) = 3 to conclude
```
𝑦 = 4 − 4𝑥2 .
This function minimizes the value of the above integral over all possible functions
with the prescribed boundary conditions.
The following is a classic.
Example 13.2
We want to prove that the shortest distance between two points is a straight line.
```
Let the points be (𝑎, 𝑏) and (𝑐, 𝑑), and suppose 𝑎 < 𝑐 and the minimizing
```
```
path is a function 𝑦(𝑥).
```
So we want to minimize
∫
𝑐
𝑎√
```
(1 + (𝑦′)2 𝑑𝑥
```
```
subject to 𝑦(𝑎) = 𝑏 and 𝑦(𝑐) = 𝑑.
```
```
We have 𝑔(𝑦, 𝑦′, 𝑥) = √(1 + (𝑦′)2, which is a function only of 𝑦′, making
```
𝜕𝑔
𝜕𝑦 = 0 and
𝜕𝑔
𝜕𝑥 = 0.
Euler-Lagrange then implies
```
0 = 𝑑𝑑𝑥 ( 𝜕𝑔𝜕𝑦′ )
```
and hence 𝜕𝑔𝜕𝑦′ must be constant. Computing 𝐶 = 𝜕𝑔𝜕𝑦′ we get
```
𝐶 = 12 (1 + (𝑦′)2)−1/2 (2𝑦′).
```
13.2. Isoperimetric Problems 203
Solving this for 𝑦′ yields
```
𝑦′ = 𝐶2/(1 − 𝐶2),
```
```
which is constant. Thus 𝑦(𝑥) is a line. Cool.
```
Exercise 5.11 derives this same result in the form of a control problem.
13.2 Isoperimetric Problems
Isoperimetric problems deal with optimizing
𝐽 = ∫
𝑥2
𝑥1
```
𝑔(𝑦, 𝑦′, 𝑥) 𝑑𝑥
```
subject to an integral constraint
𝐶 = ∫
𝑥2
𝑥1
```
𝑘(𝑦, 𝑦′, 𝑥) 𝑑𝑥
```
```
plus boundary values 𝑦(𝑥1) = 𝑦1, 𝑦(𝑥2) = 𝑦2.
```
It can be shown that solutions to this problem must be extreme values of the ex-
pression
∫
𝑥2
𝑥1
```
𝑔(𝑦, 𝑦′, 𝑥) + 𝜆 𝑘(𝑦, 𝑦′, 𝑥) 𝑑𝑥
```
where we introduce 𝜆 as a Lagrange multiplier. Note the Hamiltonian structure of the
integrand. We can now solve this problem using Euler-Lagrange, where the additional
free parameter 𝜆 allows for matching the integral constraint.
Example 13.3
We want to minimize
∫
1
0
```
(𝑦′)2 𝑑𝑥
```
subject to
∫
1
0
𝑦 𝑑𝑥 = 1
```
with 𝑦(0) = 2, 𝑦(1) = 4. We formulate
```
∫
1
0
```
(𝑦′)2 + 𝜆𝑦 𝑑𝑥
```
```
and apply Euler-Lagrange with 𝑔(𝑦, 𝑦′, 𝑥) = (𝑦′)2 + 𝜆𝑦:
```
𝜕𝑔
𝜕𝑦 −
𝑑
```
𝑑𝑥 (
```
𝜕𝑔
```
𝜕𝑦′ ) = 𝜆 −
```
𝑑
```
𝑑𝑥 (2𝑦
```
```
′) = 𝜆 − 2𝑦″ = 0
```
which has solution
𝑦 = 14 𝜆𝑥2 + 𝑎𝑥 + 𝑏.
204 Chapter 13. Calculus of Variations
```
We use the constraints 𝑦(0) = 2, 𝑦(1) = 4, and ∫10 𝑦 𝑑𝑥 = 1 to get three equations
```
```
to resolve the three unknown values 𝑎, 𝑏, and 𝜆, and we conclude that (∗ check
```
```
this ∗)
```
𝑦 = 12𝑥2 − 10𝑥 + 2.
13.3 Conversions
Euler-Lagrange deals with optimizing an integral with some boundary values.
Isoperimetric problems deal with optimizing an integral subject to an integral con-
straint and some boundary values.
Control theory deals with optimizing an integral subject to a differential equation
constraint and boundary values.
Euler-Lagrange can quickly be cast as control problems by swapping the spatial
coordinates 𝑥 and 𝑦 for time and state coordinates 𝑡 and 𝑠 and introducing a control
𝑠′ = 𝑢:
𝑥 ⟶ 𝑡 ⟶ 𝑡,
```
𝑦(𝑥) ⟶ 𝑠(𝑡) ⟶ 𝑠,
```
```
𝑦′(𝑥) ⟶ 𝑠′(𝑡) ⟶ 𝑢.
```
Thus we seek to optimize
𝐽 = ∫
𝑡2
𝑡1
```
𝑔(𝑠, 𝑢, 𝑡) 𝑑𝑡
```
subject to
𝑠′ = 𝑢.
Indeed, every one-dimensional optimal control problem with 𝑠′ = 𝑢 is secretly an
Euler-Lagrange problem in disguise.
Isoperimetric problems can also be cast as optimal control problems. Start as above
by phrasing the problem in state 𝑠 and time 𝑡 language of dynamics. We handle the
integral constraint
𝐶 = ∫
𝑇
0
```
𝑘(𝑠, 𝑢, 𝑡) 𝑑𝑡
```
```
by introducing an additional state variable 𝑟 with 𝑟′ = 𝑘(𝑠, 𝑢, 𝑡), and boundary condi-
```
```
tions 𝑟(0) = 0 and 𝑟(𝑇) = 𝐶. We thus seek to optimize
```
𝐽 = ∫
𝑇
0
```
𝑔(𝑠, 𝑢, 𝑡) 𝑑𝑡
```
with
𝑠′ = 𝑢,
```
𝑟′ = 𝑘(𝑠, 𝑢, 𝑡)
```
13.3. Conversions 205
and constraints
```
𝑠(0) = 𝑦1, 𝑠(𝑇) = 𝑦2,
```
```
𝑟(0) = 0, 𝑟(𝑇) = 𝐶.
```
The following example is the classic isoperimetric problem reformulated as an
optimal control problem: showing that a circle encloses the greatest area for a given
perimeter.
Example 13.4
We want to maximize the area under a function over the interval [−1, 1] where
the function is zero at the endpoints and has an arclength of 𝜋.
Using the spatial coordinates, we start with an isoperimetric formulation of
maximizing
𝐽 = ∫
1
−1
𝑦 𝑑𝑥
subject to
∫
1
−1√
```
1 + (𝑦′)2 𝑑𝑥 = 𝜋
```
with
```
𝑦(−1) = 0 and 𝑦(1) = 0.
```
```
This assumes the minimizing curve is a differentiable function. (Can this as-
```
```
sumption be justified?)
```
We now convert to a control problem: maximize
𝐽 = ∫
1
−1
```
𝑠(𝑡) 𝑑𝑡
```
subject to
𝑠′ = 𝑢,
```
𝑟′ = (1 + 𝑢2)1/2
```
and boundary conditions
```
𝑠(−1) = 0, 𝑠(1) = 0,
```
```
𝑟(−1) = 0, 𝑟(1) = 𝜋.
```
Applying Principle IV, the Hamiltonian is
```
𝐻 = 𝑠 + 𝜆𝑠𝑢 + 𝜆𝑟(1 + 𝑢2)1/2
```
with stationarity condition
```
0 = 𝜕𝐻𝜕𝑢 = 𝜆𝑠 + 𝜆𝑟𝑢(1 + 𝑢2)1/2 .
```
The costate equations 𝜆′𝑠 = −1 and 𝜆′𝑟 = 0 imply 𝜆𝑠 = 𝑎 − 𝑡 and 𝜆𝑟 = 𝑏 for some
constants 𝑎, 𝑏.
206 Chapter 13. Calculus of Variations
```
Normally we would solve for 𝑢 in terms the costates (might be messy), but
```
here we take a different approach and utilize some of the geometry of the prob-
lem.
First we substitute costate forms into 0 = 𝜕𝐻𝜕ᵆ to get
```
0 = (𝑎 − 𝑡) + 𝑏 𝑢(1 + 𝑢2)1/2
```
or
```
0 = 𝑎(1 + 𝑢2)1/2 − 𝑡(1 + 𝑢2)1/2 + 𝑏𝑢. (13.1)
```
Second, we reason that an optimal solution should be symmetric about 𝑡 = 0
```
(how so?). And therefore (∗ why? ∗)
```
∫
1
−1
```
𝑡 (1 + 𝑢2)1/2 𝑑𝑡 = 0.
```
Combine this with integral constraints
```
𝜋 = ∫1−1(1 + 𝑢2)1/2 𝑑𝑡,
```
0 = ∫1−1 𝑢 𝑑𝑡
```
and integrate equation (13.1) to conclude 𝑎 = 0.
```
```
Returning to equation (13.1) and solving
```
```
0 = −𝑡(1 + 𝑢2)1/2 + 𝑏𝑢
```
for 𝑢 gives us
```
𝑢 = |𝑡|(𝑏2 − 𝑡2)−1/2.
```
Integrating 𝑠′ = 𝑢 yields
```
𝑠 = (𝑏2 − 𝑡2)1/2 + 𝑐.
```
```
This function 𝑠(𝑡) is the arc of a circle in the (𝑠, 𝑡)-plane of radius 𝑏 centered at
```
𝑠 = 𝑐, 𝑡 = 0 and containing the points 𝑠 = 0 at 𝑡 = ±1. Representative circular
arcs are shown in Figure 13.1. Requiring an arclength of 𝜋 forces 𝑐 = 0 and 𝑏 = 1,
making the curve a half-circle.
```
Figure 13.1. Solutions are arcs of circles through (−1, 0) and (1, 0).
```
Note that specifying an arclength less than 𝜋 would still produce a circular
arc.
Exercises 207
Key Points
Calculus of variations is the mathematical field of optimization in function space, with
Euler-Lagrange theory as its fundamental concept. The elements of this theory are
closely related to the mathematical foundation of optimal control, and in fact Pontrya-
gin’s principles can be used to solve Euler-Lagrange and isoperimetric problems.
Exercises
Exercise 13.1. Use Euler-Lagrange to find the extremals for:
```
(a) ∫21 (𝑦′)2/𝑥3 𝑑𝑥 with 𝑦(1) = 2, 𝑦(2) = 17.
```
```
(b) ∫𝜋/20 𝑦2 − (𝑦′)2 − 2𝑦 sin 𝑥 𝑑𝑥 with 𝑦(0) = 1, 𝑦(𝜋/2) = 1.
```
```
(c) ∫𝜋0 (𝑦′)2 + 2𝑦 sin 𝑥 𝑑𝑥 with 𝑦(0) = 0, 𝑦(𝜋) = 0.
```
```
Exercise 13.2(h). Derive Euler-Lagrange from Pontryagin. (This is rather backwards,
```
```
like using the Pythagorean triangle to prove 9 + 16 = 25.)
```
```
Exercise 13.3(s). Convert each of the following isoperimetric problems to control prob-
```
lems and solve.
```
(a) Optimize ∫20 (𝑦′)2 𝑑𝑥 subject to ∫20 𝑦 𝑑𝑥 = 2 with 𝑦(0) = 0, 𝑦(2) = 1.
```
```
(b) Optimize ∫𝜋0 (𝑦′)2 𝑑𝑥 subject to ∫𝜋0 𝑦2 𝑑𝑥 = 𝜋/2 with 𝑦(0) = 0, 𝑦(2) = 1. Find
```
```
the value(s) for 𝐽. What are the maximum and minimum values?
```
Appendix A
Table of Principles
```
• Principle 0 (Section 3.2): one dimension, discrete time, fixed initial position, free
```
final position, fixed final time, performance is independent of time, control is un-
constrained.
```
• Principle I (Section 4.1): one dimension, continuous time, fixed initial and final
```
position, fixed final time, performance is independent of time, control is uncon-
strained.
```
• Principle II (Section 4.2): one dimension, continuous time, fixed initial and fi-
```
nal position, fixed final time, performance may depend on time, control is uncon-
strained.
```
• Principle III (Section 6.1): one dimension, continuous time, fixed initial position,
```
final position may be fixed or free, final time may be fixed or free, performance may
depend on time, control is unconstrained.
```
• Principle IV (Section 8.1): two dimensions, continuous time, fixed initial position,
```
final position may be fixed or free, fixed final time, performance may depend on
time, control is unconstrained.
```
• Principle V (Section 9.1): two dimensions, continuous time, fixed initial position,
```
final position may be fixed or free, final time may be fixed or free, performance may
depend on time, control is unconstrained.
```
• Principle VI (Section 9.2.1): two dimensions, continuous time, fixed initial posi-
```
tion, final position restricted to a curve, final time may be fixed or free, performance
may depend on time, control is unconstrained.
```
• Principle VII (Section 10.1): two dimensions, continuous time, initial and final
```
positions may be fixed or free, final time may be fixed or free, performance depends
on time, control is bounded.
209
Appendix B
Two-Dimensional
Linear Systems
This is a very succinct treatment of solving a two-dimensional system of linear differ-
ential equations to support the examples and exercises in the text. This is not a com-
plete review, and it employs computational short cuts. Analyzing systems of first-order
equations is a standard topic in differential equations, and readers are encouraged to
review the material as needed.
This topic also involves some very basic tools from matrix algebra, specifically
eigenvalues and eigenvectors for a 2 × 2 matrix.
The Setup.
To find a general solution to a system of two first-order linear autonomous equa-
tions
𝑥′ = 𝑎𝑥 + 𝑏𝜆,
𝜆′ = 𝑐𝑥 + 𝑑𝜆
we form the coefficient matrix
𝐌 = [
𝑎 𝑏
𝑐 𝑑
]
and cast the problem as a linear differential equation in two-dimensional space:
```
(
```
𝑥′
𝜆′
```
) = [
```
𝑎 𝑏
𝑐 𝑑
```
] (
```
𝑥
𝜆
```
) .
```
We look for eigenvalues for the coefficient matrix by analyzing the quadratic equation
involving the trace and determinant of the matrix:
```
𝜅2 − Tr(𝐌)𝜅 + Det(𝐌) = 𝜅2 − (𝑎 + 𝑑)𝜅 + (𝑎𝑑 − 𝑏𝑐).
```
This quadratic is the characteristic polynomial for the matrix 𝐌.
211
212 Appendix B. Two-Dimensional Linear Systems
Two Real Eigenvalues.
If this quadratic has two distinct real roots 𝜅1 and 𝜅2, we look for eigenvectors in
the form of
⎡
⎢
⎢
⎢
⎢
⎢
⎢
⎢
⎢
⎣
```
𝐞𝑖 = (
```
𝜅𝑖 − 𝑑
𝑐
```
) if 𝑏 ≠ 0
```
```
𝐞𝑖 = (
```
𝑏
𝜅𝑖 − 𝑎
```
) if 𝑐 ≠ 0
```
⎤
⎥
⎥
⎥
⎥
⎥
⎥
⎥
⎥
⎦
.
If both 𝑏 = 0 and 𝑐 = 0, then your original system was actually two independent differ-
ential equations. Note that any scalar multiple of an eigenvector is also an eigenvector,
so we may scale our vectors to make them look nicer.
Once we have our two eigenvectors, 𝐞1, 𝐞2, we have the general solution to the
system as
```
(
```
𝑥′
𝜆′
```
) = 𝐶1 𝑒𝜅1𝑡 𝐞1 + 𝐶2 𝑒𝜅2𝑡 𝐞2.
```
That is, this form will match any solution to this system for appropriate choice of con-
stants 𝐶1 and 𝐶2.
For example, suppose we have
𝑥′ = 4𝑥 + 2𝜆,
𝜆′ = −𝑥 + 𝜆.
Then
𝐌 = [
4 2
−1 1
]
```
with Tr(𝐌) = 5 and Det(𝐌) = 6 and eigenvalues 𝜅1 = 3 and 𝜅2 = 2 (yes, this ex-
```
```
ample was chosen so the numbers would work out nicely). We have corresponding
```
eigenvectors
```
𝐞1 = (
```
2
−1
```
) , 𝐞2 = (
```
1
−1
```
) .
```
Our general solution to this system is then
```
(
```
𝑥
𝜆
```
) = 𝐶1𝑒3𝑡 (
```
2
−1
```
) + 𝐶2𝑒2𝑡 (
```
1
−1
```
)
```
or
𝑥 = 2𝐶1𝑒3𝑡 − 𝐶2𝑒2𝑡,
𝜆 = −𝐶1𝑒3𝑡 − 𝐶2𝑒2𝑡.
Appendix B. Two-Dimensional Linear Systems 213
We can match boundary values with the constants 𝐶1, 𝐶2. If we have the two-point
```
boundary problem 𝑥(0) = −1 and 𝑥(1) = 0, we would solve
```
−1 = 2𝐶1 − 𝐶2,
0 = 2𝐶1𝑒3 − 𝐶2𝑒2
```
to get 𝐶1 = 1/(2𝑒 − 2) and 𝐶2 = 𝑒/(𝑒 − 1).
```
Complex Eigenvalues.
The quadratic characteristic polynomial
```
𝜅2 − Tr(𝐌)𝜅 + Det(𝐌) = 𝜅2 − (𝑎 + 𝑑)𝜅 + (𝑎𝑑 − 𝑏𝑐)
```
```
has complex roots if Tr(𝐌)2 − 4 Det(𝐌) < 0. These will be in the form of a complex
```
conjugate pair
```
𝛼 ± 𝑖𝛽 = − 12 Tr(𝐌) ± 12 √Tr(𝐌)2 − 4 Det(𝐌).
```
These are in fact eigenvalues for the matrix and have complex-valued eigenvectors, and
everything in the previous section still works, but we really want to stick with a real-
valued state space.
Fortunately, things work out pretty nicely. For complex conjugate eigenvalues 𝛼 ±
𝑖𝛽 the general solution for 𝑥 is
```
𝑥 = 𝐶1𝑒𝛼𝑡 cos(𝛽𝑡) + 𝐶2𝑒𝛼𝑡 sin(𝛽𝑡).
```
```
Note that 𝑥(0) = 𝐶1, which is convenient.
```
The most straightforward way to get the associated equation for 𝜆 is to go back to
the original system equation 𝑥′ = 𝑎𝑥 + 𝑏𝜆, plug in the above form for 𝑥, and solve for
𝜆.
For example, suppose we have
𝑥′ = 𝑥 − 2𝜆,
𝜆′ = 2𝑥 + 𝜆.
Then
𝐌 = [
1 −2
2 1
]
```
with Tr(𝐌) = 2 and Det(𝐌) = 5 and eigenvalues 𝛼 ± 𝛽𝑖 = 1 ± 2𝑖. Our general solution
```
for 𝑥 is
```
𝑥 = 𝐶1𝑒𝑡 cos(2𝑡) + 𝐶2𝑒𝑡 sin(2𝑡).
```
```
For two-point boundary condition 𝑥(0) = −1 and 𝑥(1) = 0 we would solve for 𝐶1 = −1
```
```
and 𝐶2 = cot(1) making
```
```
𝑥 = −𝑒𝑡 cos(𝑡) + 𝑒𝑡 cot(1) sin(𝑡).
```
To get the associated 𝜆, we would substitute into 𝑥′ = 𝑥 − 2𝜆 and solve for
```
𝜆 = 12 (𝑥 − 𝑥′) = − 12 𝑒𝑡(cos(𝑡) cot(1) + sin(𝑡)).
```
Appendix C
Hints
A little help. . .
```
Hint 1.4 . (a) Use a numerical approximation to find zeros of the partial derivatives.
```
```
(b) You’ll want to use a computer algebra or numerical approximation package to ac-
```
tually approximate a solution.
Hint 1.5 . Take 𝑢0 = −2 and consider the payoff as a function of 𝑢1.
```
Hint 1.7 . (e) Assume 𝑉 𝑁 (𝑎) = 𝐾𝑁 𝐴2. Can you justify this assumption?
```
Hint 2.7 . Solving five equations that are linear in five unknowns. Lots of calculations,
best to use computer algebra.
```
Hint 2.9 . You should get a maximum of one in part (a), so ∑ 𝑥𝑖𝑦𝑖 ≤ 1.
```
Hint 2.10 . Proof by contradiction.
Hint 3.3 . Negative values for 𝑥 and 𝑢 are allowed.
```
Hint 4.11 . (d) Show 𝐽 → 100 𝑔′(0) as 𝑇 → ∞.
```
```
Hint 4.13 . (b) Use symmetry to simplify the calculations.
```
```
Hint 4.15 . (b) Show 𝑢/𝑤 < 1 for 𝑡 = 0 and 𝑢/𝑤 > 1 for 𝑡 = 𝑇.
```
```
Hint 5.2 . Use Exercise 5.1. Is it a saddle or a (linear) center?
```
```
Hint 5.3 . (b) 𝐴2 − 𝐵2 = (𝐴 − 𝐵)(𝐴 + 𝐵).
```
```
Hint 5.5 . (f) Use a multi-angle formula for sin(1 + 𝜋/4).
```
215
216 Appendix C. Hints
Hint 6.6 . First show that 𝑢 = 0 or 𝑢 = −2 are the only possible values for 𝑢 to be
```
optimal. For part (c) show that if 𝑇 > 0, then either of these choices is worse than
```
taking 𝑇 = 0.
Hint 6.9 . Show that 𝐻 must be identically zero on an optimal trajectory. Use this to
get 𝑢 in terms of 𝑥.
```
Hint 6.11 . (a) Show 𝑢 = 𝜆𝑥. Show that 𝐻 as a function of 𝑥 and 𝜆 reduces to a
```
quadratic function of the product 𝑥𝜆, which must then be constant on level curves.
```
Alternatively, one can show that (𝜆𝑥)′ = 𝜆𝑥′ + 𝜆′𝑥 = 0. (b) 𝐻 must be identically equal
```
```
to one on optimal trajectories. (c) You know 𝑢 is constant, so set 𝑢 = 𝑘 and derive 𝐽 as
```
a function of 𝑘 and 𝑇.
```
Hint 7.6 . The Hamiltonian is constant 𝐻 = 12 csc2(𝑇/2).
```
Hint 7.8 . 𝑢 is constant in all cases.
Hint 8.1 . Retrace the steps in Example 8.1.
Hint 8.2 . Retrace the steps in Example 8.2.
Hint 8.3 . Retrace the steps in Example 8.3. 𝜕𝐽𝜕𝑇 can be factored.
```
Hint 8.7 . (b) Use 𝐻 is constant, always equal to 𝐻(0).
```
Hint 8.10 . This is a challenging problem, and there may be several different ap-
```
proaches. Here’s one possible way: (1) get costate equations 𝜆′𝑥 = 0, 𝜆′𝑦 = √𝜆2𝑥 + 𝜆2𝑦,
```
```
(2) use 𝐻 ≡ −1 to get 𝑦 = −1/√𝜆2𝑥 + 𝜆2𝑦, (3) derive 𝑦 = −1/ cosh(𝑡), 𝑥 = tanh(𝑡).
```
```
Hint 8.11 . 𝑃 is the control, 𝐻 = 𝑃2 + 𝜆𝐼 (𝑃 − 𝑆) + 𝜆𝑆 (𝑃 − 1)/2.
```
```
Hint 9.2 . (c) The conditions would be 𝑥(0)2 +𝑦(0)2 = 1 and 𝜆𝑥(0)𝑦(0)−𝜆𝑦(0)𝑥(0) = 0.
```
```
Hint 9.4 . (a) 𝜃(𝑇) = ±𝜋/2. (b) There is a nice geometric interpretation.
```
Hint 9.6 . Rework Example 8.4 using Principle V and the new conditions.
```
Hint 10.1 . Calculations are messy; use a computer algebra.
```
Hint 10.6 . At any time in the process, your only choices are 𝑢 = 0, 𝑢 = 𝑢max, or, if
𝑥 = 1/2, 𝑢 = 1/4. Your only opportunity to change strategies is when 𝜕ℎ𝜕ᵆ changes sign
```
or becomes zero. (c) Find the optimal time to switch from stasis (𝑥 = 1/2, 𝑢 = 1/4) to
```
maximum harvest.
```
Hint 10.7 . (b) Consider 𝐵 < −1, −1 < 𝐵 < 1, and 1 < 𝐵. The value 𝐴 won’t affect the
```
location of the minimum. Take 𝐴 = 0 and sketch some examples.
Appendix C. Hints 217
```
Hint 10.9 . (b) For 𝑢 = −1, the circle (𝑥−1)2 +𝑦2 = 1 contains the trajectory that termi-
```
```
nates at (0, 0). Only the lower half of the circle would be part of an optimal trajectory,
```
```
as 𝑢 = 1 would be a faster option to get from (𝑥, 𝑦), 𝑥 > 0, 𝑦 > 0, to (𝑥, −𝑦).
```
Hint 10.10 . Use qualitative properties of the phase portrait.
```
Hint 11.3 . Follow the structure of Example 11.4; guess 𝑉(𝑥, 𝑡) = 𝑥2𝑠(𝑡).
```
```
Hint 11.5 . 𝑉 = (𝑥𝑊(𝑡))1/2 would be a good guess, with 𝑊(10) = 0.
```
Hint 11.7 . See Example 11.6. Symbolic processor recommended.
Hint 12.1 . Consider the perpendicular bisector of the line segment between 𝐼’s and
𝐼𝐼’s initial positions. Then 𝐼 can mirror 𝐼𝐼’s movements with respect to this line.
Hint 12.4 . Use pictures.
Hint 12.5 . Stationarity would require 𝜆𝑦 ≡ −1/𝑎𝑥 and 𝜆𝑥 ≡ 1/𝑎𝑦. How could you
operate the controls to attain this?
Hint 13.2 . Use the conversions from Section 13.3.
Appendix D
Solutions
There are no problems here.
```
Solution 1.4 . (a) 𝐽(𝑥1, 𝑦1) = 𝑥21 + 𝑦21 + ((10 − 𝑥1)2 + 𝑦21)/(|𝑦1| + 1) has a minimum
```
```
at approximately 𝑥1 = 2.337 . . . , 𝑦1 = ±2.278 . . . . (b) (0, 0) → (1.373 . . . , 1.535 . . . ) →
```
```
(4.854 . . . , 2.748 . . . ) → (10, 0).
```
```
Solution 1.7 . (a) 𝑉3(𝑎) = 64𝑎2/21, 𝑉2(𝑏) = 16𝑏2/5.
```
```
Solution 2.1 . Maximum is √3/2; minimum is −√3/2.
```
```
Solution 2.2 . Minimum of 121/32 at (5/4, 5/4, −1/2).
```
Solution 2.5 . Minimum is 1 + 5𝜅 − 10√𝜅.
```
Solution 2.7 . 𝐽(𝑝, 𝑞) = − (5𝑝2 − 10𝑝𝑞 + 𝑞2) /20.
```
```
Solution 3.1 . (a) 𝑢𝑖 = 𝜆𝑖+1. (b) 𝜆𝑖 = 𝜆𝑖+1 −1. (c) 𝜆𝑁 = 4. (e) 𝐽 = −(4)(90)+(100− 12 )+
```
```
(99 − 2) + (97 − 92 ) + (94 − 8), fifteen bucks.
```
```
Solution 3.2 . (a) 𝑢𝑖 = −𝜆𝑖+1/2. (b) 𝜆𝑖 = −𝜆2𝑖+1/4. (c) 𝜆𝑁 = 4. (e) 𝐽 = 4 for any value
```
of 𝑁.
Solution 3.4 . 𝑢𝑖 = −𝑥 − 𝜆𝑖/2, 𝜆𝑁 = −100, and 𝜆𝑖 = 0 for 𝑖 = 1, . . . , 𝑁.
```
Solution 4.1 . 𝑥(𝑡) = 𝑒2(𝑒−𝑡 − 𝑒−2𝑡)/(𝑒 − 1).
```
```
Solution 4.2 . 𝑥 = 𝑒𝑡−1((3 − 𝑒)𝑡 + 𝑒).
```
```
Solution 4.3 . 𝑥(𝑡) = (𝑡 + 1) ln(𝑡 + 1) − 𝑡 + 1, 𝑢 = −𝜆 = 1 + 𝑡, 𝐻 = 2.
```
219
220 Appendix D. Solutions
```
Solution 4.4 . 𝑥(𝑡) = 𝑡3 + 1, 𝜆 constant, 𝑢 = √3 𝑡, 𝐻 = √3 𝑡2/2.
```
```
Solution 4.5 . 𝑥 = 𝐵(𝑒−2𝑡 − 1)/(𝑒−2 − 1), 𝐻 = −4𝑒−2𝑡𝐵2/(𝑒−2 − 1)2.
```
```
Solution 4.6 . (a) 𝐵 ≥ 𝑒. (b) 1 ≤ 𝐵 ≤ 2𝑒 − 1.
```
```
Solution 4.7 . (a) 𝐵 > 𝐴𝑒. (b) 𝑥 = 𝑒𝑡−1((𝐵 − 𝐴𝑒)𝑡 + 𝐴𝑒).
```
```
Solution 4.12 . (a) 𝑢party = .2(2 − 𝑒2)/(1 − 𝑒.2(10−𝑝)). (d) Spend all excess money all at
```
once at the very last instant in a big screaming blowout par-tay.
```
Solution 4.13 . (a) 𝐽 = 2 ∫1/𝐾0 (𝐾𝑡 − 1)2 + 𝐾2 𝑑𝑡 = 2(𝐾 + 1/(3𝐾)).
```
```
Solution 4.15 . (a) 𝑢 = 𝑤𝑒𝑟(𝑡−𝑇)(𝑒𝑟𝑇 − 1)/(𝑟𝑇).
```
```
Solution 5.3 . (a) 𝑥(𝑡) = (𝑒𝑡 − 𝑒−𝑡)/(𝑒2 − 𝑒−2). (c), (d) 𝑥(𝑡) = (𝑒1+𝑡 − 𝑒−1−𝑡)/(𝑒2 − 𝑒−2).
```
```
Solution 5.5 . (d), (e) 𝑥 = − cos 𝑡 + sin 𝑡. (f) 𝑥 = √2 sin 𝑡 matches with 𝜏 = 𝑡 − 𝜋/4.
```
```
Solution 5.6 . 𝑢 = 2𝜆 making 𝐻 = (𝑥 + 𝜆)2.
```
```
Solution 5.7 . (a) 𝑢 = −2𝜆, assuming 𝑥 ≠ 0. (b) 𝐻 = −𝑥𝜆2. (d) 𝑥 = −𝐶2(𝐶1 − 𝑡)2.
```
```
Solution 5.8 . (a) 𝐽(𝐵) = −𝐵2/2.
```
```
Solution 5.9 . 𝐽 = ln(𝐵 − 𝐴𝑒) − 12 . Note 𝐵 − 𝐴𝑒 > 0 by Exercise 4.7.
```
```
Solution 5.10 . 𝑥 = 𝐴 cos( 𝜋2 𝑡) + 𝐵 sin( 𝜋2 𝑡), and 𝐽(𝐴, 𝐵) = −𝜋𝐴𝐵.
```
```
Solution 6.4 . 𝐵 = 3𝑇/(1 + 𝑇), 𝐽 = 𝑇(8 − 𝑇)/(1 + 𝑇).
```
```
Solution 6.5 . 𝐻 = 𝜆(1 + 𝜆/4), and so 𝑢 = 0 or 𝑢 = −2.
```
```
Solution 6.8 . (a) 𝐽 = √𝑇. (b) 𝐽 = 1/𝑇. So 𝐽 → 0 as 𝑇 → ∞. (c) 𝐽 = 𝑇1−𝛼. If 𝛼 = 1,
```
```
then 𝐽 = 𝑥(𝑇) = 1.
```
```
Solution 6.9 . 𝑥 = 9/(9 + 𝑒𝑡)
```
```
Solution 6.10 . 𝑢(𝑡) = 𝑤𝑒𝑟𝑡(𝑒𝑟𝑇 − 1)/(𝑟(𝑏𝑒𝑟𝑡 + 𝑇𝑒𝑟𝑇 )).
```
```
Solution 6.11 . (b) 𝑇 = 23 ln(𝐵).
```
```
Solution 6.12 . (a) 𝐽(𝑇) = 𝛼2𝑃24𝑟 (1 − 𝑒−𝑟𝑇 )𝑒−𝑟𝑇 . (b) 𝐻 = 𝑎2𝑃2𝑒(𝑟(𝑡 − 2𝑇))/4.
```
```
Solution 7.1 . (a) 𝐻 = −𝑥𝜆−𝜆2/2. (b) 𝑥(𝑡) = (𝑒𝑇−𝑡−𝑒𝑡)/(𝑒𝑇 −1). (c) 𝑥(𝑡) = (𝑒𝑡(1−2𝑒−𝑇 )
```
- 𝑒𝑇−𝑡(2 − 𝑒−𝑇 ))/(𝑒𝑇 − 𝑒−𝑇 ).
Appendix D. Solutions 221
```
Solution 7.2 . (a) 𝑥(𝑡) = (2𝑒𝑇−𝑡 − 4𝑒𝑡−𝑇 )/(𝑒𝑇 − 2𝑒−𝑇 ).
```
```
Solution 7.5 . (a) 𝐽(𝑇) = − cot(𝑇/2).
```
Solution 7.8 . 𝑢 = 𝐵/𝑇 is constant in all cases. If 𝐵 is free, 𝐵 it must satisfy 𝜕𝐺𝜕𝐵 =
−2𝐵/𝑇. If 𝑇 is free, 𝑇 must satisfy 𝜕𝐺𝜕𝑇 = −𝐵2/𝑇2.
```
Solution 8.1 . (b) 𝐽(𝑇) = 12/𝑇3.
```
```
Solution 8.2 . (a) 𝐽(𝑇) = 12/𝑇3 + 𝑇. (b) 𝑇 = ±√6.
```
```
Solution 8.3 . (a) 𝐽 = (𝑇4 + 12𝑥20 + 12𝑇𝑥0𝑦0 + 4𝑇2𝑦20)/𝑇3 with 𝐽′(𝑇) =
```
```
(𝑇2 − 2𝑇𝑦0 − 6𝑥0) (𝑇2 + 2𝑇𝑦0 + 6𝑥0) /𝑇4. (b) 𝐽′ = 0 for 𝑇 = −𝑦0 ± √𝑦20 − 6𝑥0
```
```
and 𝑇 = 𝑦0 ± √𝑦20 + 6𝑥0. (c) Get multiple positive solutions for 𝑇 when 6|𝑥0| < 𝑦20.
```
```
Solution 8.4 . (b) Reverse time and direction. (c) 𝐵 = 1 has a cost of zero.
```
```
Solution 8.6 . (b) 𝑥(𝑡) = 𝑡 cos(𝑡+𝑘), 𝑦(𝑡) = 𝑡 sin(𝑡+𝑘), 𝑇2 = 𝑥21 +𝑦21, tan(𝑇+𝑘) = 𝑦1/𝑥1.
```
```
(c) 𝑥 = 𝑡 cos(𝑡 + 𝑘) + 𝑥0 cos(𝑡) − 𝑦0 sin(𝑡), 𝑦 = 𝑡 sin(𝑡 + 𝑘) + 𝑥0 sin(𝑡) + 𝑦0 cos(𝑡).
```
```
(d) 𝑇 = 1.478 . . . , 𝜅 = 2.402 . . . . Cuts inside: rotational speed of water is constant, so
```
there would be no savings to going outside.
```
Solution 8.11 . 𝑃(𝑡) = (3/8)𝑡 + (1/4), 𝐼(𝑡) = −(1/32)𝑡3 + (3/8)𝑡2 − (3/4)𝑡 + 1, 𝑆(𝑡) =
```
```
(3/32)𝑡2 − (3/8)𝑡 + 1.
```
```
Solution 9.2 . (a), (b) 𝜆𝑥 = 𝑎, 𝜆𝑦 = −𝑎𝑡 + 𝑏, 𝑢 = − 12 𝜆𝑦. Use 𝑥(0) = 0 and 𝑦(0) = 0 to
```
```
get 𝑥(𝑡) = 𝑎𝑡3/12 and 𝑦 = 𝑎𝑡2/4. End costate is 𝜆𝑥 + 𝑚𝜆𝑦 = 0 for lines 𝑦 − 𝑚𝑥 = 1.
```
```
Solution 9.6 . 𝜆𝑥(𝑇) = 1, 𝜆𝑦(𝑇) = 0, tan(𝜃) = 𝜅 (𝑇 − 𝑡).
```
Solution 9.7 . In one minute, you can get over 7 kilometers away by dropping 3 kilo-
meters. Your final velocity would be nearly 900 km/hr. Yeeehaaa.
```
Solution 10.1 . (b) 𝑣 = −𝑔𝑡 + 800 ln(1000 + 𝐾) − 800 ln(1000 + 𝐾 − 60𝑡),
```
```
𝑦 = (1/6)(−3𝑡(−1600 + 𝑔𝑡) − 80(1000 + 𝐾 − 60𝑡) ln(1000 + 𝐾) +
```
```
80(1000 + 𝐾 − 60𝑡) ln(1000 + 𝐾 − 60𝑡)).
```
```
Solution 10.2 . (a) One switch, off to on. (b) One switch, on to off.
```
```
Solution 10.5 . (c) √𝑥0.
```
```
Solution 11.3 . 𝑉 = 2𝑥2𝑒2𝑡/(3𝑒2𝑇 − 𝑒2𝑡).
```
```
Solution 11.5 . 𝑉 = 𝑒.1𝑡√10𝑥(𝑒.1𝑡 − 𝑒).
```
222 Appendix D. Solutions
```
Solution 11.6 . (a) 𝑢 = −𝑥0/𝑇, 𝑥 = 𝑥0(1 − 𝑡/𝑇), 𝐽 = 𝑥20/𝑇.
```
```
Solution 11.7 . (a)̃ 𝐽(𝑥, 𝑦, 𝑇) = 4(3𝑥2 + 3𝑇𝑥𝑦 + 𝑇2𝑦2)/𝑇3.
```
```
Solution 11.8 . (a) 𝑉(𝑥, 𝑡) = ((2𝑇 − 2𝑡 + 𝑥)(4 − 𝑥) − (𝑇 − 𝑡)2)/(1 + 𝑇 − 𝑡).
```
```
Solution 12.3 . (a) 𝑢 = (1 + 𝜌)/(1 − 𝛾𝜌), 𝑣 = (1 + 𝛾)/(1 − 𝛾𝜌).
```
```
Solution 13.3 . (a) 𝑦 = 2𝑥 − 3𝑥2/4. (b) 𝑦 = sin 𝑛𝑥, 𝐽 = 𝑛2𝜋/2.
```
Bibliography
[1] Martino Bardi and Italo Capuzzo-Dolcetta, Optimal control and viscosity solutions of Hamilton-Jacobi-
Bellman equations, with appendices by Maurizio Falcone and Pierpaolo Soravia, Systems & Control:
Foundations & Applications, Birkhäuser Boston, Inc., Boston, MA, 1997, DOI 10.1007/978-0-8176-
4755-1. MR1484411
[2] Stephen Barnett, Introduction to mathematical control theory, Oxford Applied Mathematics and Com-
puting Science Series, Clarendon Press, Oxford, 1975. MR441413
[3] Richard Bellman, Introduction to the mathematical theory of control processes. Vol. II: Nonlinear pro-
cesses, Mathematics in Science and Engineering, Vol. 40-II, Academic Press, New York-London, 1971.
MR278767
[4] Richard Bellman, Adaptive control processes: a guided tour, Princeton University Press, Princeton, NJ,
1961. MR134403
[5] Arthur E. Bryson Jr. and Yu Chi Ho, Applied optimal control: optimization, estimation, and control,
```
revised printing, Hemisphere Publishing Corp., Washington, DC; distributed by Halsted Press [John
```
Wiley & Sons, Inc.], New York-London-Sydney, 1975. MR446628
[6] Avinash K. Dixit, Optimization in economic theory, 2nd ed., Oxford University Press, Oxford, 1990.
[7] Avner Friedman, Differential games, Pure and Applied Mathematics, Vol. XXV, Wiley-Interscience [A
division of John Wiley & Sons, Inc.], New York-London, 1971. MR421700
[8] Rufus Isaacs, Differential games: a mathematical theory with applications to warfare and pursuit, control
and optimization, John Wiley & Sons, Inc., New York-London-Sydney, 1965. MR210469
[9] Morton I. Kamien and Nancy L. Schwartz, Dynamic optimization: the calculus of variations and opti-
mal control in economics and management, 2nd ed., Advanced Textbooks in Economics, vol. 31, North-
Holland Publishing Co., Amsterdam, 1991. MR1159711
[10] Donald E. Kirk, Optimal control theory: an introduction, Dover Publications, 2004.
[11] Suzanne Lenhart and John T. Workman, Optimal control applied to biological models, Chapman &
Hall/CRC Mathematical and Computational Biology Series, Chapman & Hall/CRC, Boca Raton, FL,
2007. MR2316829
[12] Mark Levi, Classical mechanics with calculus of variations and optimal control: an intuitive introduction,
Mathematics Advanced Study Semesters, University Park, PA, Student Mathematical Library, vol. 69,
American Mathematical Society, Providence, RI, 2014, DOI 10.1090/stml/069. MR3156230
[13] Frank L. Lewis, Draguna L. Vrabie, and Vassilis L. Syrmos, Optimal control, 3rd ed., John Wiley & Sons,
Inc., Hoboken, NJ, 2012, DOI 10.1002/9781118122631. MR2953185
[14] Daniel Liberzon, Calculus of variations and optimal control theory: a concise introduction, Princeton
University Press, Princeton, NJ, 2012. MR2895149
[15] George Leitmann, The calculus of variations and optimal control: an introduction, Mathematical Con-
cepts and Methods in Science and Engineering, 24, Posebna Izdanja. [Special Editions], Plenum Press,
New York-London, 1981. MR641031
[16] Jack W. Macki and Aaron Strauss, Introduction to optimal control theory, Undergraduate Texts in Math-
ematics, Springer-Verlag, New York-Berlin, 1982. MR638591
[17] Mike Mesterton-Gibbons, A primer on the calculus of variations and optimal control theory, Stu-
dent Mathematical Library, vol. 50, American Mathematical Society, Providence, RI, 2009, DOI
10.1090/stml/050. MR2522971
[18] Paul J. Nahin, Chases and escapes: the mathematics of pursuit and evasion, Princeton University Press,
Princeton, NJ, 2007. MR2319182
[19] V. G. Boltyanskiy, R. V. Gamkrelidze, and L. Pontryagin, Mathematical theory of optimal processes, Wiley,
New York, 1962.
223
224 Bibliography
[20] Enid R. Pinch, Optimal control and the calculus of variations, Oxford Science Publications, The Claren-
don Press, Oxford University Press, New York, 1993. MR1221086
[21] I. Michael Ross, A primer on Pontryagin’s principle in optimal control, Collegiate Publishers, Carmel,
CA, 2009.
[22] E. O. Roxin, Control theory and its applications, Stability and Control: Theory, Methods and Applica-
tions, vol. 4, Gordon and Breach Science Publishers, Amsterdam, 1997. MR1635393
[23] Atle Seierstad and Knut Sydsæter, Optimal control theory with economic applications, Advanced Text-
books in Economics, vol. 24, North-Holland Publishing Co., Amsterdam, 1987. MR887536
[24] Aaron Strauss, An introduction to optimal control theory, Lecture Notes in Operations Research and
Mathematical Economics, Vol. 3, Springer-Verlag, Berlin-New York, 1968. MR233052
[25] Fredi Tröltzsch, Optimal control of partial differential equations: theory, methods and applications, trans-
lated from the 2005 German original by Jürgen Sprekels, Graduate Studies in Mathematics, vol. 112,
American Mathematical Society, Providence, RI, 2010, DOI 10.1090/gsm/112. MR2583281
[26] Bruce van Brunt, The calculus of variations, Universitext, Springer-Verlag, New York, 2004, DOI
10.1007/b97436. MR2004181
[27] Thomas A. Weber, Optimal control theory with applications in economics, with a foreword by A.
V. Kryazhimskiy, MIT Press, Cambridge, MA, 2011, DOI 10.7551/mitpress/9780262015738.001.0001.
MR2857389
Index
allowable controls, 52, 60, 91
argmax, 158
attainable, 59
attrition and attack, 193
bang-bang, 155, 159
big-O, 15
brachistochrone, 131, 148, 154, 174
calculus of variations, 201
canoe exercises, 95, 96, 187
control dynamic, 35
control function, 6
costate, 8, 38, 40, 49, 73, 106, 183
cycloids, 131
derivative, concept of, 13
differential games, 190
Euler’s technique, 90
Euler-Lagrange, 201
extremals, 201
fisheries, 163, 168
game theory, 189
Hamilton-Jacobi-Bellman, 181, 183
Hamiltonian, 32, 92
Hamiltonian systems, 67
HJB equation, 181, 183
integrator examples, 50, 53, 60, 71, 72, 74, 87,
102, 107, 183
inventory scheduling, 137
isochrone, 174
isoparametric, 201, 203
King Tiny, 51, 55, 57, 59, 65, 70, 184, 187
Lagrange multipliers, 8, 20, 23, 29, 37, 39, 41, 43,
92
lambda, 23, 27, 29, 183
life cycle, 66, 97
linear approximation, 14
linear tangent law, 127
linear-quadratic, 99
little-o, 16
max/min, existence of, 17
multiple constraints, 24
Nash equilibria, 189
normals, 26
performance, 50
Pontryagin, 6
Principle 0, 38, 209
Principle I, 52, 209
Principle II, 57, 209
Principle III, 82, 209
Principle IV, 116, 209
Principle V, 140, 209
Principle VI, 145, 209
Principle VII, 157, 209
Principle of Optimality, 71, 74, 150, 151, 182
Principles, list of, 209
rocket races, 160
rocket ship, 158
rocket sled, 117, 118, 120, 123, 141, 147, 175,
178, 185
soft landing, 117, 123, 134, 170, 177, 178
state space, 6
stationary, 20, 21, 29, 132, 155, 163
thrust programnming, 116
trajectory, 6
value function, 2, 4, 181
Zermelo, 125, 143, 146, 149
zero sum, 193, 195
225
AMS / MAA TEXTBOOKS
Optimal control theory concerns the study of dynamical systems
where one operates a control parameter with the goal of optimizing
a given payoff function. This textbook provides an accessible,
examples-led approach to the subject. The text focuses on systems
modeled by differential equations, with applications drawn from a
wide range of topics, including engineering, economics, fi nance,
and game theory. Each topic is complemented by carefully prepared
exercises to enhance understanding.
The book begins with introductory chapters giving an overview of the subject and covering
the necessary optimization techniques from calculus. After this, Pontryagin’s method is
developed for control problems on one-dimensional state spaces, culminating in the study
of linear-quadratic systems. The core material is rounded out by the consideration of high-
er-dimensional systems. The text concludes with more advanced topics such as bang-bang
controls and differential game theory. A fi nal chapter examines the calculus of variations,
giving a brief overview of the Euler-Lagrange theory and general isoperimetric problems.
Designed for undergraduates in mathematics, physics, or economics, Optimal Control
Theory can be used in a structured course or for self-study. The treatment is highly acces-
sible and only requires a familiarity with multivariable calculus, differential equations, and
basic matrix algebra.
TEXT/75
For additional information
and updates on this book, visit
www.ams.org/bookpages/text-75