Annals of the
International Society of
Dynamic Games
David M. Ramsey
Jérôme Renault
Editors
Advances
in Dynamic
Games
Games of Conflict, Evolutionary
Games, Economic Games, and Games
Involving Common Interest
Annals of the International Society of Dynamic
Games
Volume 17
Series Editor
Tamer Başar, University of Illinois at Urbana-Champaign, IL, USA
Editorial Board
Pierre Bernhard, University of Nice-Sophia Antipolis, France
Maurizio Falcone, Sapienza University of Rome, Italy
Jerzy Filar, University of Queensland, Australia
Alain Haurie, ORDECSYS, Switzerland
Andrzej S. Nowak, University of Zielona Góra, Poland
Leon A. Petrosyan, St. Petersburg State University, Russia
Alain Rapaport, INRIA, France
More information about this series at http://www.springer.com/series/4919
David M. Ramsey • Jérôme Renault
Editors
Advances in Dynamic Games
Games of Conflict, Evolutionary Games,
Economic Games, and Games Involving
Common Interest
Editors
David M. Ramsey
Faculty of Computer Science
and Management
Wrocław University of Science
and Technology
Wrocław, Poland
Jérôme Renault
Toulouse School of Economics
University Toulouse Capitole and ANITI
Toulouse, France
```
ISSN 2474-0179 ISSN 2474-0187 (electronic)
```
Annals of the International Society of Dynamic Games
```
ISBN 978-3-030-56533-6 ISBN 978-3-030-56534-3 (eBook)
```
```
https://doi.org/10.1007/978-3-030-56534-3
```
Mathematics Subject Classification: 91A25, 91A22, 91A23, 91A24, 91A26, 91A80
```
© The Editor(s) (if applicable) and The Author(s), under exclusive license to Springer Nature
```
Switzerland AG 2020
This work is subject to copyright. All rights are solely and exclusively licensed by the Publisher, whether
the whole or part of the material is concerned, specifically the rights of translation, reprinting, reuse of
illustrations, recitation, broadcasting, reproduction on microfilms or in any other physical way, and
transmission or information storage and retrieval, electronic adaptation, computer software, or by similar
or dissimilar methodology now known or hereafter developed.
The use of general descriptive names, registered names, trademarks, service marks, etc. in this
publication does not imply, even in the absence of a specific statement, that such names are exempt from
the relevant protective laws and regulations and therefore free for general use.
The publisher, the authors and the editors are safe to assume that the advice and information in this
book are believed to be true and accurate at the date of publication. Neither the publisher nor the
authors or the editors give a warranty, expressed or implied, with respect to the material contained
herein or for any errors or omissions that may have been made. The publisher remains neutral with regard
to jurisdictional claims in published maps and institutional affiliations.
This book is published under the imprint Birkhäuser, www.birkhauser-science.com by the registered
company Springer Nature Switzerland AG
The registered company address is: Gewerbestrasse 11, 6330 Cham, Switzerland
Preface
Game theory can be used to model the interaction between decision-makers in a
wide range of scenarios spanning from pure conflict to situations in which the
participants have clear common interests. This is illustrated by the variety of
chapters in this volume, many of which are based on papers presented at the
International Symposium on Dynamic Games and Applications, which took place
in Grenoble, France in July 2018. The chapters are grouped into four sections,
```
namely: Games of Conflict, Evolutionary Games, Economic Games and Games
```
Involving Common Interest.
The first section, which includes five papers, presents games that model situa-
tions in which there is a clear conflict between the interests of the participants.
These games can be interpreted, sometimes loosely and sometimes strictly, as
pursuit-evasion games. In the chapter “Quick Construction of Dangerous
Disturbances in Conflict Control Problems”, Martynov et al. consider a model of
a differential game with linear controls. One player, the controller, aims to reach a
point in the target set at the termination time, whilst the aim of the other player, the
disturber, aims to stop the controller from arriving at such a point at the appointed
time. The authors present an example illustrating how this approach can be applied
to flight simulators.
In the chapter “Isaacs’ Two-on-One Pursuit-Evasion Game”, Pachter considers
differential games in which there are two pursuers and one evader. Isaacs’ results on
such games are adapted in order to classify these games into two situations: cases
where only one pursuer is required and those where co-ordination between the two
pursuers is required. Models of this type can illustrate both conflict and cooperation.
Whilst there exists pure conflict between the pursuers and the evader, when the
pursuers can be interpreted as individual decision-makers, then they often need to
co-ordinate their actions in order to achieve a joint goal.
In the chapter “A Normal Form Game Model of Search and Pursuit”, Alpern and
Lee consider a searcher-evader game in which the evader can choose from a finite
set of hiding places. The amount of time a searcher requires to investigate a hiding
place, as well as the probability of finding the evader given that it is located there,
depends on the place. The goal of the searcher is to find the evader in a fixed
v
amount of time. The authors consider both models where the probabilities of finding
the evader in a given location are known and those where these probabilities can
take one of two values and the searcher uses Bayesian inference.
In the chapter “Computation of Robust Capture Zones Using Interval-Based
Viability Techniques in Presence of State Uncertainties”, Turetsky and Le Ménec
consider a differential pursuit-evasion game, where there is one pursuer and one
evader. They derive robust capture zones, sets of locations of the pursuer relative to
the evader which guarantee that the pursuer can capture the evader within a fixed
time regardless of the strategy of the evader.
To conclude this section, in the chapter “Convergence of Numerical Method for
Time-Optimal Differential Games with Lifeline”, Munts and Kumkov consider a
similar game to the one presented in the opening chapter. However, whilst the goal
of one player is to guide the system to a state in the target set, the other player can
win not just by avoiding such a situation, but by attaining a state in the so-called
lifeline set.
The second section contains three chapters devoted to the field of evolutionary
games. In the chapter “A Partnership Formation Game with Common Preferences
and Scramble Competition”, Ramsey considers a mate choice game in which a
large set of players all search for a partner at the start of the breeding season. This
game models scramble competition, i.e. as players form pairs and thus leave the
mating pool, the distribution of the attractiveness of prospective partners changes
and it generally becomes harder to find a partner.
In the chapter “The Replicator Dynamics for Games in Metric Spaces: Finite
Approximations”, Mendoza-Palacios and Hernández-Lerma consider the evolu-
tionary dynamics of games in which the strategy sets are metric spaces. This is
illustrated by a game in which the players choose their level of aggression from the
```
interval ½0; 1. They derive conditions stating when the evolution of such a system
```
can be approximated by a sequence of dynamical systems defined on finite spaces.
At the end of this section, in the chapter “Eco-evolutionary Spatial Dynamics of
Nonlinear Social Dilemmas”, Gokhale and Park consider the relation between
spatial dynamics and the evolution of behaviour in generalised public goods games.
In public goods games, the higher the level of cooperation between members of a
group, the greater the benefits obtained by the group as a whole. However, indi-
viduals who cooperate the least obtain the greatest payoff. As a result, such games
```
are clear illustrations of the role of conflict and cooperation in games (or in evo-
```
lutionarily terms, the role of selection at the level of individuals and selection at the
```
level of groups).
```
The third section contains three chapters presenting models that can be applied
in the field of economics. In the chapter “Heuristic Optimization for Multi-Depot
Vehicle Routing Problem in ATM Network Model”, Platonova et al. consider an
optimisation model that considers the location of branches of a bank and cash
machines in order to provide the best service to customers whilst minimise costs.
Although this model is not strictly game-theoretic, descriptions of how it can be
adapted to game-theoretic scenarios are presented.
vi Preface
In the chapter “Load Balancing Congestion Games and Their Asymptotic
Behavior”, Altman et al. consider a game which has applications to communication
networks. The players are atomic, i.e. the actions of an individual can affect the
level of congestion along a given link. The authors show that in such games
multiple equilibria can exist.
To conclude this section, in the chapter “Non-deceptive Counterfeiting and
Consumer Welfare: A Differential Game Approach”, Crettez et al. present a dif-
ferential game that models the effect of the counterfeiting of goods produced by a
prestigious brand. The originality of this model lies in the fact that it considers the
welfare of consumers. This allows new insight to policy-makers on how such
situations are legislated.
The final section contains two chapters presenting models of games in which
there are common interests. Both papers consider the consumption of a commonly
held resource. In the chapter “Equilibrium Coalition Structures of Differential
Games in Partition Function Form”, Hoof presents a model of the consumption of a
non-renewable resource as a cooperative game. The extraction rates are chosen by
the players, such that the overall rate at which a resource is extracted is proportional
```
to the amount of the resource available (the constant of proportionality is equal to
```
```
sum of the rates chosen). By cooperating, coalitions of players maximise the dis-
```
counted payoff of the coalition as a whole, rather than individually maximising the
payoff of each player, given the behaviour of others.
In the final chapter, Kordonis considers a different approach to achieving
cooperation based on the concept of Kant’s Categorial Imperative. This concept
states that members of a population should use the rule that would maximise the
overall payoff to the population when this rule is adopted by the population as a
whole. The general model is illustrated by an example based on a fishing game, i.e.
a model of the consumption of a renewable resource.
The chapters were evaluated by independent reviewers. We thank the authors for
their contributions and the reviewers for their benevolent work and expert com-
ments. Overall, this volume of Advance in Dynamic Games presents the full range
between pure competition and cooperation, as well as applications of these ideas to
various scientific disciplines. We wish the reader a pleasant journey.
Wrocław, Poland David M. Ramsey
Toulouse, France Jérôme Renault
Preface vii
Nikolai Botkin Memorial
On September 14, 2019, Nikolai Dmitrievich Botkin, who made a great contribu-
tion to the theory of differential games and numerical methods, passed away.
Nikolai Botkin was born on March 22, 1956, and raised in the city of Sysert,
Sverdlovsk region, Russia. His father was a mathematics teacher and his mother, a
physics teacher. Nikolai was fond of natural subjects since childhood and in 1973,
he entered the Faculty of Mathematics and Mechanics of the Ural State University
```
in Sverdlovsk (now Yekaterinburg). During his studies, Nikolai became interested
```
in Bellman’s dynamic programming principle. After graduation, he was accepted
into the department of Dynamical Systems headed by A. I. Subbotin, which is part
of the Institute of Mathematics and Mechanics of the Ural Branch of the Russian
Academy of Sciences.
His works, performed in the early 80s under the guidance of V. S. Patsko, were
connected with the theory of differential games and its numerical methods that had
just begun to develop. Nikolai Botkin created the first algorithms for solving linear
```
differential games; he obtained a posteriori estimates of the accuracy of numerical
```
solutions and developed algorithms for optimal positional control in such problems.
In 1983, Nikolai Botkin defended his Ph.D. thesis on “Numerical solution of linear
ix
differential games.” The methods developed by him were successfully applied in
1982–1992 to aviation problems of optimal control of an aircraft in the presence of
wind disturbances in frames of joint research with the Academy of Civil Aviation in
Leningrad. Based on an analysis of the asymptotic behaviour of solutions to non-
linear differential games in 1992, he proposed an algorithm for computing the
discriminating kernel of differential inclusion.
After receiving a grant from the Humboldt Foundation in 1992, Nikolai Botkin
```
lived and worked in Germany (1992–1993 University of Würzburg, 1993–1999 and
```
2006–2019 Technical University of Munich, 1999–2006 Research Center caesar,
```
Bonn). His research interests covered many areas of applied mathematics. As a
```
leading researcher, he participated in numerous scientific projects in the field of
elasticity theory, hydrodynamics, thermodynamics, homogenization theory,
phase-field models, optimization and optimal control of ordinary differential equa-
tions and distributed systems. Whilst working at the center of advanced European
```
studies and research (caesar) in close contact with physicists, biologists and engi-
```
neers, he was actively engaged in the creation of innovative devices and instruments
in the field of composite materials, sensors, cryopreservation of living cells and
tissues. This motivated him to develop new mathematical models, theoretical
methods and computational algorithms. Returning in 2006 to the chair of
Mathematical Modelling at the Technical University of Munich headed at that time
by K.-H. Hoffmann, and continuing to work on the cryopreservation project, and
then participating in a joint project with King Abdullah University of Science and
Technology on CO2 sequestration, Nikolai resumed work on numerical methods for
solving differential games. One of his brilliant achievements at this time was the
```
development of a grid method (implemented in the form of an algorithm and cor-
```
```
responding programs) for solving a wide class of multidimensional nonlinear dif-
```
ferential games with state constraints. Using these algorithms, Nikolai Botkin, with
his students, formulated and investigated a number of aircraft control problems in the
presence of wind disturbances. He also applied methods and algorithms for solving
differential games to study biomedical problems, which is extremely unique.
N. Botkin spent considerable time reviewing articles for various mathematical
journals.
As an enthusiastic and versatile mathematician, Nikolai Botkin had a rare quality of
solving complex applied problems, starting with the development of the model, its
theoretical investigation, and ending with the development of algorithms for com-
puting solutions up to their implementation in real systems and devices. Colleagues
and students appreciated his deep knowledge, determination and perseverance. Other
students, not only from the mathematics faculty, came to him for help with completing
a diploma or other work, knowing that Nikolai could solve a variety of problems.
```
Nikolai was a friendly and cheerful person; he loved to joke and tell funny
```
stories, was a keen table tennis player, and fond of reading books on physics and
science fiction.
A sudden, premature death prevented the implementation of many of his sci-
entific ideas and plans but his scientific results remain in 243 published works, of
which about 100 are devoted to differential games.
x Nikolai Botkin Memorial
Contents
Part I Games of Conflict
Quick Construction of Dangerous Disturbances in Conflict
Control Problems . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 3
Kirill Martynov, Nikolai D. Botkin, Varvara L. Turova,
and Johannes Diepolder
Isaacs’ Two-on-One Pursuit-Evasion Game . . . . . . . . . . . . . . . . . . . . . . 25
Meir Pachter
A Normal Form Game Model of Search and Pursuit . . . . . . . . . . . . . . . 57
Steve Alpern and Viciano Lee
Computation of Robust Capture Zones Using Interval-Based Viability
Techniques in Presence of State Uncertainties . . . . . . . . . . . . . . . . . . . . 75
Stéphane Le Ménec and Vladimir Turetsky
Convergence of Numerical Method for Time-Optimal Differential
Games with Lifeline . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 101
Nataly V. Munts and Sergey S. Kumkov
Part II Evolutionary Games
A Partnership Formation Game with Common Preferences
and Scramble Competition . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 133
David M. Ramsey
The Replicator Dynamics for Games in Metric Spaces:
Finite Approximations . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 161
Saul Mendoza-Palacios and Onésimo Hernández-Lerma
Eco-evolutionary Spatial Dynamics of Nonlinear Social Dilemmas . . . . . 185
Chaitanya S. Gokhale and Hye Jin Park
xi
Part III Applications to Economics
Heuristic Optimization for Multi-Depot Vehicle Routing Problem
in ATM Network Model . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 201
Valeria Platonova, Elena Gubar, and Saku Kukkonen
Load Balancing Congestion Games and Their Asymptotic
Behavior . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 229
Eitan Altman, Corinne Touati, Nisha Mishra, and Hisao Kameda
Non-deceptive Counterfeiting and Consumer Welfare:
A Differential Game Approach . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 253
Bertrand Crettez, Naila Hayek, and Georges Zaccour
Part IV Games where Players have Common Interests
Equilibrium Coalition Structures of Differential Games
in Partition Function Form . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 299
Simon Hoof
A Model for Partial Kantian Cooperation . . . . . . . . . . . . . . . . . . . . . . . 317
Ioannis Kordonis
xii Contents
Games of Conflict
Quick Construction of Dangerous
Disturbances in Conflict Control
Problems
Kirill Martynov, Nikolai D. Botkin, Varvara L. Turova,
and Johannes Diepolder
Abstract The paper is devoted to the construction of dangerous disturbances in
linear conflict control problems. Using the technique of sequential linearization,
dangerous disturbances can also be constructed for nonlinear systems such as air-
craft dynamics equations, including filters, servomechanisms, etc. The procedure
proposed is based on a dynamic programming method and consists in the backward
integration of ordinary matrix differential equations defining centers, sizes, and orien-
tations of time-dependent parallelotopes forming a repulsive tube in the time-space
domain. A feedback disturbance strategy can keep the state vector of the conflict
control system outside the repulsive tube for all admissible inputs of the control.
1 Introduction
One of the important problems in control engineering is generation of extremal
disturbances for various types of dynamical systems. This is of interest in many
application areas because such disturbances can be used to evaluate the robustness
of models and quality of controllers.
K. Martynov (B)
Department of Informatics, Technical University of Munich, Boltzmannstr. 3, 85748 Garching
near Munich, Germany
e-mail: kirill.martynov@tum.de
N. D. Botkin · V. L. Turova
Mathematical Faculty, Technical University of Munich, Boltzmannstr. 3, 85748 Garching near
Munich, Germany
e-mail: botkin@ma.tum.de
V. L. Turova
e-mail: turova@ma.tum.de
J. Diepolder
Institute of Flight System Dynamics, Technical University of Munich, Boltzmannstr. 15, 85748
Garching near Munich, Germany
e-mail: johannes.diepolder@tum.de
```
© The Editor(s) (if applicable) and The Author(s), under exclusive license
```
to Springer Nature Switzerland AG 2020
D. M. Ramsey and J. Renault (eds.), Advances in Dynamic Games,
Annals of the International Society of Dynamic Games 17,
```
https://doi.org/10.1007/978-3-030-56534-3_1
```
3
4 K. Martynov et al.
This paper concerns with generation of feedback disturbances for linear conflict
control systems where the aim of the disturbance is to deflect the state vector from a
target set at a fixed termination time for all admissible controls. It is assumed that the
target set and the constraints imposed on the control and disturbance variables are
represented by parallelotopes. Starting with the parallelotope representing the target
set and integrating backward in time a system of ordinary vector-matrix differential
equations yield parallelotopes forming a repulsive tube in the time-space domain.
It is proven that a certain feedback disturbance can keep all trajectories outside the
repulsive tube, and therefore outside the target set at the termination time.
It should be noted that the minimal repulsive tube can be computed using general
grid methods for solving differential games [3, 4, 8]. Nevertheless, such methods
require large computation resources on multiprocessor computer platforms. More
appropriate for linear conflict control problems are methods proposed in [5, 12]
where repulsive tubes are approximated by polyhedrons, which however involves
solving a lot of linear programming problems. Therefore, such methods also require
significant computer resources. In contrast, the scheme suggested in the current
paper is computationally cheap so that it can run in real time on a common computer.
Moreover, high-dimensional models can be effectively treated with this method.
Finally, disturbances for nonlinear models can be constructed by applying techniques
of sequential linearization. Thus, the approach presented in this paper is rather general
and can be used in various areas. As a demonstration of the method, generation of
dangerous disturbances for aircraft control problems is considered.
The paper is structured as follows: In Sect. 2, a formal statement of the prob-
lem and some definitions are given. Section 3 contains a detailed description of the
method for constructing repulsive feedback disturbances and provides a proof of their
correctness. In Sect. 4, some numerical aspects of the method are addressed. It is
shown that the method can be implemented in the discrete-time scheme. In Sect. 5, the
method is applied to a three-dimensional linear differential game. This simple exam-
ple allows us to visualize and clearly demonstrate in which extent the constructed
repulsive tube is minimal. Section 6 considers the problem of aircraft take-off under
windshear conditions. This example demonstrates a technique of generating dan-
gerous disturbances for nonlinear models. Section 7 describes the construction of
disturbances for a linearized aircraft closed-loop system for the lateral dynamics.
2 Problem Formulation
First, introduce the following notation. For a set V ⊂ [0, θ] × Rd and t ∈ [0, θ],
```
the set V(t) := {x ∈ Rd : (t, x) ∈ V} is called cross section of V at t. For a vector
```
```
x ∈ Rd , the norm ‖x‖∞ is defined as max{|x i |, i = 1, ..., d}. Let the superscript T
```
denotes the transposition operation.
Quick Construction of Dangerous Disturbances in Conflict Control Problems 5
Fig. 1 Repulsive tube V
```
with a sample trajectory x(t)
```
θ0
```
(t0, x(t0))
```
```
x(t)
```
V
Consider a linear conflict control problem
```
˙x = A x + u + v, x ∈ Rd , t ∈ [0, θ], x(θ) ∈ M ⊂ Rd . (1)
```
Here, u and v, respectively, denote the control and disturbance variables constrained
```
as follows: u(t) ∈ R ⊂ Rd , v(t) ∈ Q ⊂ Rd . The problem is considered on a time
```
interval [0, θ]. The aim of the control is to meet the target set M at the termination
time θ, whereas the aim of the disturbance is opposite. The objective of this paper is
```
to propose a method of constructing a feedback disturbance v(t, x) which deflects all
```
trajectories from the target set at the termination time. More precisely, the problem
is formulated as follows:
```
Problem 1 Find a tube V ⊂ [0, θ] × Rd , V(θ) = M such that there exists a feed-
```
```
back disturbance v(t, x) fulfilling the following condition: If (t0, x(t0)) /∈ int (V),
```
```
then (t, x(t)) /∈ int (V), t ∈ [t0, θ], for all possible controls.
```
```
Remark 1 In what follows, V and v(t, x) from the formulation of Problem 1 are
```
called repulsive tube and repulsive disturbance, respectively. It will be shown below
that the knowledge of a repulsive tube allows us to find explicitly a repulsive distur-
bance appearing in the formulation of Problem 1.
The main property of repulsive tubes is illustrated in Fig. 1.
3 Construction of Repulsive Tubes
This section describes the computation of time-dependent parallelotopes that form
a repulsive tube in [0, θ] × Rd and define a repulsive feedback disturbance. This
approach raises from the idea by E. K. Kostousova to use parallelotopes for con-
structing feedback controls, see a detailed description in [7].
A parallelotope is defined as
```
VP [ p, P] := {x ∈ Rd |x = p + P ε, ‖ε‖∞ ≤ 1}, (2)
```
6 K. Martynov et al.
Fig. 2 Two-dimensional
parallelotope VP with the
axes p1, p2 and the
corresponding distance
h1, h2 h2
h1 p2
p1
where p ∈ Rd and P ∈ Rd× ˆd , ˆd ≤ d, are its center and shape matrix, respectively.
Note that ˆd = d in our consideration. The columns of the matrix P are called axes
```
of the parallelotope VP and denoted as p1, ..., p ˆd ∈ Rd . Furthermore, let h i (VP )
```
be the euclidean distance between two opposite faces of VP along the axis p i ,
```
and h min (VP ) = min{h i (VP ) | 1 ≤ i ≤ ˆd}. Figure 2 shows p i and h i for a two-
```
dimensional parallelotope.
Further, it is assumed that the following problem data are represented by paral-
```
lelotopes:
```
```
M = VP [ p f , P f ], p f ∈ Rd , P f ∈ Rd×d , det P f  = 0,
```
```
R = VP [r, R], R ∈ Rd×d1 , Q = VP [q, Q], Q ∈ Rd×d2 .
```
```
(3)
```
Remark 2 The system matrix A as well as the constraints on the control and distur-
```
bance inputs may depend on time. Thus, in general, A = A(t), R = VP [r(t), R(t)],
```
```
and Q = VP [q(t), Q(t)]. In the following, this time-dependence is not shown explic-
```
itly in order to simplify the notation.
Remark 3 Parallelotope-shaped representation of the control and disturbance con-
straints is fairly generic and allows to capture different common types of constraints.
For example, consider a control u ∈ R2 subject to
```
− ˆu1(t) ≤ u1(t) ≤ ˆu1(t)
```
```
− ˆu2(t) ≤ u2(t) ≤ ˆu2(t).
```
Such constraints can be easily represented with the parallelotope notation discussed
above by choosing:
```
R = VP
```
```
[(0
```
0
```
)
```
,
```
( ˆu
```
```
1(t) 0
```
```
0 ˆu2(t)
```
```
)]
```
.
```
With the assumptions introduced in (3), the following system of ODEs defines a
```
```
repulsive tube VP (t) = VP [ p(t), P(t)], t ∈ [0, θ] :
```
dp
```
dt = A p + r + q, p(θ) = p f , (4)
```
d P
```
dt = A P + P diag β(t, P) + Q Γ (t), P(θ) = P f , (5)
```
Quick Construction of Dangerous Disturbances in Conflict Control Problems 7
```
β = −Abs(P−1 R) e, where (Abs(P))i j = |Pi j |, e = (1, 1, ..., 1)T ∈ Rd1 , (6)
```
```
Γ (t) ∈ Rd2 ×d , max1≤i≤d2
```
d∑
```
j=1
```
```
|Γi j (t)| ≤ 1. (7)
```
```
In (6) and (7), the matrices diag β and Γ , respectively, represent the influence of the
```
control and disturbance capacities on the repulsive tube. Note that the time evolution
```
of the matrix Γ , satisfying the condition (7), should be chosen in such a way that the
```
repulsive tube maximally decreases backward in time. Below, this principle will be
discussed more exactly.
A repulsive feedback disturbance appearing in the statement of Problem 1 may
be defined as follows:
```
v(t, x) = q(t) + Q(t) Γ (t) P(t)
```
```
−1 (x − p(t))
```
```
max(‖P(t)−1 (x − p(t))‖∞, 1) . (8)
```
```
Theorem 1 Let Eqs. (4)–(5), with relations (6)–(7), be solvable on [0, θ], and
```
det
```
(
```
```
P(t)
```
```
)
```


```
= 0, t ∈ [0, θ], then the tube VP (·) and the disturbance strategy (8)
```
provide a solution to Problem 1.
Proof Observe that the condition det
```
(
```
```
P(t)
```
```
)
```


= 0, t ∈ [0, θ], define the vector func-
tion
```
ξ(t, x) := P(t)−1(x − p(t))
```
```
and note that the vector ξ(t, x) ∈ Rd defines relative coordinates of any point x in
```
```
the parallelotope VP (t). It is easily seen that a point x lies outside the interior of the
```
```
parallelotope VP (t) whenever ‖ξ(t, x)‖∞ ≥ 1.
```
```
Let x(·) be a trajectory of (1) corresponding to the disturbance (8) and starting from
```
```
a position (t0, x0) such that ‖ξ(t0, x0)‖∞ ≥ 1. Denote K (t) := cl
```
```
(
```
```
Rd \ VP (t)
```
```
)
```
and
```
prove that x(t) ∈ K (t), t ∈ [t0, θ]. Bearing in mind that ‖ξ(t, x)‖∞ = max
```
j∈1,d
```
|ξ j (t, x)|
```
introduce the functions
```
g j (t, x) =
```
```
{
```
```
ξ j (t, x), j ∈ 1, d
```
```
−ξ j (t, x), j ∈ d + 1, 2d . (9)
```
```
Obviously, the graph K of the mapping K (·) on [t0, θ] is given as follows:
```
```
K =
```
2d⋃
```
j=1
```
```
K j , where K j = {(t, x) : g j (t, x) ≥ 1, t0 ≤ t ≤ θ, x ∈ Rd }. (10)
```
```
According to [2, Table 4.1], the contingent cone to K at any point (t, x) ∈ K is
```
given by the formula
8 K. Martynov et al.
```
T K (t, x) =
```
⋃
```
j∈J (t,x)
```
```
T K j (t, x),
```
```
where J (t, x) = { j ∈ 1, 2d : (t, x) ∈ K j }, and T K j (t, x) is the contingent cone to
```
```
K j at (t, x).
```
```
Following to [2, Chap. 4.1.1], it holds for (t, x) ∈ K j , t ∈ [t0, θ):
```
```
T K j (t, x) =
```
⎧
⎪⎨
⎪⎩
```
R × Rd , if t > t0, g j (t, x) > 1,
```
```
R+ × Rd , if t = t0, g j (t, x) > 1,
```
```
{(τ ∈ R, η ∈ Rd ) : τ ∂g j∂t (t, x) + ηT ∇x g j (t, x) ≥ 0}, if t > t0, g j (t, x) = 1,
```
```
{(τ ∈ R+, η ∈ Rd ) : τ ∂g j∂t (t, x) + ηT ∇x g j (t, x) ≥ 0}, if t = t0, g j (t, x) = 1.
```
```
(11)
```
```
According to [1, Theorem 11.1.3], the condition (1, ˙x(t)) ∈ T K
```
```
(
```
```
t, x(t)
```
```
)
```
,
```
t ∈ [t0, θ), guarantees the inclusion x(t) ∈ K (t), t ∈ [t0, θ]. Let us prove the valid-
```
ity of that condition.
```
If ‖ξ(t, x(t))‖∞ > 1, one of the first two relations of (11) holds for some index
```
j ∈ J
```
(
```
```
t, x(t)
```
```
)
```
```
, which provides the desired result due to (10).
```
```
The “boundary” case, ‖ξ(t, x(t))‖∞ = 1, is being treated as follows: Obviously,
```
```
there exists an index j0 ∈ J (t, x(t)) such that the third relation of (11) holds. Assume
```
```
that j0 ∈ 1, d (the case j0 ∈ d + 1, 2d is considered analogously). The full time
```
derivative of the vector function ξ
```
(
```
```
t, x(t)
```
```
)
```
reads
dξ
```
dt = −P
```
−1 d P
dt P
```
−1(x − p) + P−1 d
```
```
dt (x − p) =
```
```
= −P−1(A P + QΓ + Pdiag β)ξ + P−1(A (x − p) + (v − q) + (u − r))
```
```
if formulas (1), (4), (5), and the definition of ξ are used. Note that every admissible
```
control u satisfies the relation u − r = Rα at time t, where α is a vector such that
```
‖α‖∞ ≤ 1. Additionally, using (8) yields
```
dξ
```
dt = −P
```
```
−1 QΓ (ξ − ξ
```
```
max(‖ξ ‖∞), 1) ) − (diag β)ξ + P
```
−1 Rα.
```
The equalities ‖ξ(t, x(t))‖∞ = 1 and ξ j0 (t, x(t)) = 1 yield the relations
```
dξ j0
```
dt = −(β j0 ξi0 ) + (P
```
```
−1 Rα) j0 ≥ −β j0 − (Abs(P−1 R), e) j0 = 0, (12)
```
and therefore,
dξ j0
```
dt =
```
∂g j0
```
∂t (t, x(t)) + ˙x(t)
```
```
T ∇x g j0 (t, x(t)) ≥ 0, (13)
```
Quick Construction of Dangerous Disturbances in Conflict Control Problems 9
```
which implies that (1, ˙x(t)) ∈ T K (t, x(t)) according to (10) and (11). Thus, in
```
```
all cases, (1, ˙x(t)) ∈ T K (t, x(t)), t ∈ [t0, θ), and therefore, x(t) ∈ K (t), t ∈ [t0, θ],
```
```
because of the continuity of x(t) and K (t). Finally, since K (t) ∩ int
```
```
(
```
```
VP (t)
```
```
)
```
= ∅,
```
the condition x(t) /∈ int
```
```
(
```
```
VP (t)
```
```
)
```
, t ∈ [t0, θ], holds.
Remark 4 Note that the repulsive tube VP can degenerate so that det
```
(
```
```
P(ˆt)
```
```
)
```
= 0
```
for some ˆt ∈ [0, θ), and P(ˆt) is no longer invertible. In this case, the tube VP is con-
```
```
structed only on [ˆt, θ], and the disturbance may be set as v(t) ≡ q, t ≤ ˆt. Obviously,
```
```
x(ˆt) /∈ VP (ˆt), and the rule (8) can be used for t > ˆt.
```
```
As it was mentioned after formula (7), the choice of Γ is crucial for obtaining
```
```
a possibly smaller repulsive tube, which allows for the application of (8) to a pos-
```
sibly larger set of initial conditions. The following choice is used in the numerical
simulations in Sects. 5–7: The whole time interval [0, θ] is divided into subinter-
```
vals (τi , τi+1], i = 0, ..., N , with τ0 = 0 and τN = θ. The system (4)–(5) is then
```
```
integrated backward in time from θ to 0, and a constant matrix Γk satisfying (7) is
```
```
chosen for each subinterval (τk−1, τk ] to minimize the minimum distance between
```
```
the opposite faces of VP (τk−1). Intuitively, such a choice of Γ yields the strongest
```
contraction of the parallelotope tube along the direction of its shortest axis.
Note that the resulting Γ may be discontinuous at time instants τi . However, the
```
number of discontinuities is finite, and solutions of (4)–(5) remain continuous and
```
unique.
4 Numerical Implementation of Repulsive Feedback
Disturbances
```
The proof of appropriateness of the repulsive disturbance (8) is done in Sect. 3 under
```
the assumption of continuous-time scheme. In a discrete-time scheme, the feedback
```
repulsive disturbance (8) may not properly work because the condition (12) holds
```
only on the boundary of VP . In this section, an extended discrete-time control scheme
is presented, and a bound on the time step length of this procedure is evaluated.
Assume for simplicity that the discrete-time scheme involves equidistant time
instants ti corresponding to the step length Δt. As it was declared in the introduction,
the disturbance is basically associated with wind, and the maximum expected wind
speed can hardly be exactly predicted. Therefore, the extension of disturbance bounds
along all parallelotope axes by the factor 1 + δ, where δ > 0 is a small parameter, is
```
not prohibited. Thus, it is now assumed that v ∈ VP [q, (1 + δ) Q], and the repulsive
```
```
disturbance v(t, x) is computed by the formula
```
10 K. Martynov et al.
```
v(t, x) = q(t) + Q(t) Γ (t) P
```
```
−1(t) (x − p(t))
```
```
max(‖P−1(t) (x − p(t))‖∞/(1 + δ), 1) . (14)
```
```
Note that the function v in (14) is Lipschitzian on each time interval [ti , ti+1) in the
```
following sense:
```
|v(t, y) − v(ti , x)| ≤ L (|t − ti | + ‖x − y‖), t ∈ [ti , ti+1) (15)
```
```
if the matrix Γ is constant on each interval [ti , ti+1). Let x(·) be a trajectory
```
```
started from a position (t0, x0) such that ‖ξ(t0, x0)‖∞ ≥ 1 + δ and computed in the
```
```
continuous-time scheme using the disturbance (14). The same argumentation as in
```
```
the proof of Theorem 1 implies that ‖ξ(t, x(t))‖∞ ≥ 1 + δ, t ∈ [t0, θ].
```
```
Let xΔ (·) be the corresponding trajectory (the same control u(·) and the same
```
```
initial position (t0, x0)) computed in the discrete-time scheme using the disturbance
```
```
(14). In virtue of condition (15), it is possible to prove that
```
```
‖x(t) − xΔ (t)‖ ≤ GΔt, G = exp(H θ), H = maxt∈[0,θ] ‖A(t)‖ + L ,
```
```
and therefore, ‖ξ(t, xΔ (t))‖∞ ≥ 1 + δ − M GΔt, t ∈ [t0, θ], where M is the Lips-
```
```
chitz constant of the function ‖ξ(t, x)‖∞ in x. It remains to set Δt ≤ δ/(M G).
```
Remark 5 The theoretical bound on the step size Δt may be too small. However,
for simulations presented in the following sections, it is possible to maintain the
```
property ‖ξ(t, xΔ (t))‖∞ ≥ 1, t ∈ [t0, θ], for much larger time steps.
```
```
Finally, note that for any given problem dimension d (i.e., the state x ∈ Rd ), the
```
```
computational complexity of the proposed scheme is O(d3) per time step Δt as
```
it involves matrix equations of dimension d, which can be solved with, e.g., LU-
decomposition. Even for fairly low-dimensional problems, this dependency is far
superior to complexity of other common methods for construction of disturbances,
such as
```
• grid methods, e.g., [3], that scale as O(N d ) per time step, where N is the grid
```
resolution per dimension,
• methods that represent repulsive tubes with arbitrary convex polygons, e.g., [5],
```
that scale as O(d!m) per time step, where m is the number of inequalities describing
```
the polygon.
Clearly, the difference in complexity between these methods and the presented
approach quickly grows with the increasing problem dimension. Thus, the presented
method allows us to consider problems that would not be accessible with many other
techniques.
Quick Construction of Dangerous Disturbances in Conflict Control Problems 11
5 Application: Simple Example
In this section, the techniques developed in Sects. 3 and 4 are applied to compute a
repulsive disturbance in a linear three-dimensional differential game. This example is
appropriate to visualize repulsive tubes and demonstrate the proper work of repulsive
disturbances.
Consider the following differential game:
˙x1 = x1 + x2 + u1 + v1,
˙x2 = x3 + v2,
˙x3 = x1 + u2,
```
M = {x ∈ R3 : ‖x‖∞ ≤ 1}.
```
The system is considered on the time interval [0, 1]. The control and disturbance
variables are constrained as follows:
|u i | < 0.5, |vi | < 0.55, i = 1, 2.
```
The repulsive sets VP [ p(ti ), P(ti )] are constructed on the uniform time grid {ti =
```
```
iΔt} with Δt = 10−3 . The same time sampling is used in the forward integration of
```
```
the system including the repulsive disturbance (14).
```
```
It follows from the general theory of differential games (see [8]) that, in particular,
```
for linear problems there exists a minimal repulsive set V0 ⊂ [0, θ] × Rd . This set
is also the maximal solvability set and, therefore, it has the following property. If
```
(t0, x(t0)) /∈ V0 then there exists a feedback disturbance v(t, x) that prevents any
```
```
trajectory x(·) from the penetration into V0 . In the opposite case, there exists a
```
```
feedback control u(t, x) ensuring the condition (t, x(t)) ∈ V0, t ∈ [t0, θ], for all
```
trajectories. This alternative is sketched in Fig. 3.
```
For low-dimensional problems, V0 can be approximated using grid methods (see,
```
```
for example, [3] and [4]). In the following simulation, such a grid scheme is used to
```
```
approximate the cross sections V0(ti ) for all time instants ti = iΔt. For each current
```
```
state x(ti ) ∈ V0(ti ) it is possible to compute a control u(ti , x(ti )) which pushes the
```
```
state vector into the next cross section V0(ti+1) so that the feedback control u(ti , x(ti ))
```
```
can approximately keep (in the discrete-time scheme) all trajectory inside V0 if the
```
Fig. 3 Property of minimal
repulsive tubes
0 θ
```
x(t)
```
```
x(t)
```
```
(t0, x(t0))
```
```
(t0, x(t0))
```
12 K. Martynov et al.
```
Fig. 4 The sets VP (t)
```
```
(green) and V0(t) (red) as
```
well as the current state
```
vectors (for various initial
```
```
conditions) at t = 0.0 (left)
```
```
and t = 0.2 (right)
```
initial state lies there. This control is used to implement the strategy of the first player
in the simulation.
To test the constructed repulsive disturbance, twenty-five initial conditions were
```
generated in the proximity of origin but outside of VP [ p(0), P(0)]. Resulting tra-
```
jectories as well as cross sections of the repulsive tubes VP and V0 are shown in
```
Figs. 4–6. The results are consistent with the theory: V0(ti ) ⊂ VP (ti ) for all ti , and
```
none of the trajectories penetrates into the tube VP . Furthermore, one can see that the
parallelotope tube VP provides a rather good upper estimate of the minimal repulsive
tube V0 along the shortest axis of the parallelotope. This is in agreement with the
previously discussed choice of the matrix Γ involved in the construction of VP .
Remark 6 Note that the view direction in Figs. 4, 5, and 6 is always chosen orthog-
```
onal to the minimum width face of VP (ti ). Therefore, the view direction is rotating
```
together with the tube VP . In this way, it is possible to visually demonstrate that all
trajectories remain outside of VP throughout the whole simulation.
Quick Construction of Dangerous Disturbances in Conflict Control Problems 13
```
Fig. 5 The sets VP (t) (green) and V0(t) (red) as well as the current state vectors (for various initial
```
```
conditions) at t = 0.4 (left) and t = 0.6 (right)
```
```
Fig. 6 The sets VP (t) (green) and V0(t) (red) as well as the current state vectors (for various initial
```
```
conditions) at t = 0.8 (left) and t = 1.0 (right)
```
6 Application: Nonlinear Model of Take-Off
In the following sections, the construction of a repulsive disturbance in a nonlinear
model of aircraft take-off is presented. The model has already been considered in
```
several papers devoted to aircraft control (cf. [10, 11]). In contrast to the mentioned
```
works, the problem of finding a dangerous wind disturbance is now considered. More
precisely, it is necessary to find a wind disturbance that maximizes the deviation
of aerodynamic velocity and kinematic path inclination angle from their reference
values.
14 K. Martynov et al.
6.1 Model Equations
A simplified aircraft model is under consideration.
First, the motion in a vertical plane is assumed. Second, the rigid body rotations
are neglected to obtain a point-mass model. Third, the thrust force of the engine is
kept constant.
The following notation is used:
```
V def= aerodynamic velocity of the aircraft, [m/s];
```
```
γ def= kinematic path inclination angle, [ ◦ ];
```
```
x def= horizontal distance, [m];
```
```
h def= altitude, [m];
```
```
α def= aerodynamic angle of attack, [ ◦ ];
```
```
σ def= thrust inclination angle, [ ◦ ];
```
```
m def= mass of the aircraft, [kg];
```
```
g def= gravitational constant, [m/s 2 ];
```
```
P def= thrust force, [N];
```
```
D def= drag force, [N];
```
```
L def= lift force, [N];
```
```
ρ def= density of air, [kg/m3 ];
```
```
S def= wing area of the aircraft, [m 2 ];
```
```
W xdef= horizontal wind velocity at the location of the aircraft, [m/s];
```
W hdef= vertical wind velocity at the location of the aircraft, [m/s].
The following equations describe the simplified aircraft dynamics:
```
m ˙V = P cos(α + σ ) − D − mg sin γ − m ˙W x cos γ − m ˙W h sin γ , (16)
```
```
mV ˙γ = P sin(α + σ ) + L − mg cos γ + m ˙W x sin γ − m ˙W h cos γ , (17)
```
```
˙x = V cos γ + W x , (18)
```
```
˙h = V sin γ + W h . (19)
```
```
The thrust, drag, and lift forces in (16), (17) are approximated by polynomials:
```
```
P = A0 + A1 V + A2 V 2,
```
```
D = 12 C D ρ SV 2 with C D = B0 + B1α + B2α2,
```
```
L = 12 C L ρ SV 2 with C L =
```
```
{
```
C0 + C1α, α ≤ α∗∗
```
C0 + C1α + C2(α − α∗∗)2, α > α∗∗.
```
Here, the angle of attack, α, is the single control input governed by the pilot.
The coefficients A i , i = 0, 1, 2, depend on the altitude and air temperature, whereas
Quick Construction of Dangerous Disturbances in Conflict Control Problems 15
Bi and C i , i = 0, 1, 2, are influenced by the position of flaps and chassis. Finally,
m, S, ρ, δ, α∗∗, A i , Bi , and C i are constant parameters corresponding to Boeing-
727 on take-off. The exact values of them can be found in [10].
```
The dynamics (16)–(19) is considered on the time interval [0, θ] with θ = 14 s,
```
and appropriate initial conditions are chosen.
The target set M is defined by maximum permissible deviation of V and γ from
their reference values V0 and γ0 at t = θ. That is,
```
|V (θ) − V0| ≤ ΔV, (20)
```
```
|γ (θ) − γ0| ≤ Δγ . (21)
```
The reference values V0 and γ0 will be discussed below in more detail.
6.2 Relaxed Nonlinear Model
```
It can be observed that the right-hand sides of Eqs. (16), (17) do not depend on x and h.
```
```
Therefore, these state variables and the corresponding Eqs. (18), (19) will be excluded
```
```
from the consideration, keeping in mind that x(t) and h(t) can be reconstructed from
```
```
V (t) and γ (t).
```
Moreover, jumps in the wind velocity components will be smoothed using first-
order filters defined by PT1 transfer functions, which assumes the introduction of
artificial disturbances v1 and v2 , the inputs of these filters.
Thus, similar to [11], we arrive at the following nonlinear model:
```
m ˙V = Pcos(α + σ ) − D − mg sin γ − m ˙W x cos γ − m ˙W h sin γ , (22)
```
```
mV ˙γ = P sin(α + σ ) + L − mg cos γ + m ˙W x sin γ − m ˙W h cos γ , (23)
```
```
˙W x = −k(W x − v1), (24)
```
```
˙W h = −k(W h − v2). (25)
```
Here, the coefficient k = 0.5 s−1 defines the smoothing rate of the wind velocity
```
components. The time derivatives ˙W x and ˙W h in (22), (23) are assumed to be replaced
```
```
by the right-hand sides of (24), (25). The constraints on the artificial disturbances,
```
v1 and v2 , are chosen as follows:
```
|v1| ≤ 13.7 m/s, |v2| ≤ 5.5 m/s. (26)
```
Similar as in [10], the control parameter is constrained by the inequalities
```
0 ≤ α ≤ 16◦. (27)
```
16 K. Martynov et al.
```
Remark 7 Note that any wind disturbance designed for the relaxed system (22)–
```
```
(25) produces, using (24) and (25), the same performance of V and γ in the original
```
```
system (16)–(19). Therefore, repulsive disturbances will be designed for the relaxed
```
system.
6.3 Linearization of the Relaxed Model
```
The relaxed system (22)–(25) is linearized around the reference values (cf. [11])
```
```
V = V0 = 84.1 m/s, γ = γ0 = 6.989◦, α = α0 = 10.367◦, W x = W x0 = 0, W h =
```
W h0 = 0, v1 = 0, and v2 = 0. Here, the values of V0, γ0 , and α0 are chosen such that
```
the right-hand sides of (22) and (23) are equal to zero. Note that the above reference
```
values define a straight ascending trajectory. Such a line would be a perfect take-off
```
path in the absence of wind disturbances. Denote x re f := (V0, γ0, W x0, W h0)T and
```
u re f := α0 .
6.4 Linear Conflict Control Problem
Having chosen the reference values, the linearization of the relaxed model yields the
```
following linear conflict control problem (cf. [11]):
```
```
˙x = A(x − x re f ) + B(u − u re f ) + Cv, for t ∈ [0, θ], (28)
```
```
x(0) = x re f . (29)
```
Here, x, u, v, A, B, and C are defined as
```
x :=
```
⎛
⎜⎜
⎜⎜
⎜⎝
V
γ
W x
W h
⎞
⎟⎟
⎟⎟
⎟⎠, A :=
⎛
⎜⎜
⎜⎜
⎜⎝
∂ ˙V∂ V∂ ˙V∂γ∂ ˙V∂ W
x
∂ ˙V∂ W
h∂ ˙γ
∂ V
∂ ˙γ
∂γ
∂ ˙γ
∂ W x
∂ ˙γ
∂ W h
0 0 −k 0
0 0 0 −k
⎞
⎟⎟
⎟⎟
⎟⎠,
```
B :=
```
⎛
⎜⎜
⎜⎜
⎜⎝
∂ ˙V∂α
∂ ˙γ
∂α
0
0
⎞
⎟⎟
⎟⎟
⎟⎠, u := α, C :=
⎛
⎜⎜
⎜⎜
⎜⎝
∂ ˙V∂v
1
∂ ˙V∂v
2∂ ˙γ
∂v1
∂ ˙γ
∂v2
k 0
0 k
⎞
⎟⎟
⎟⎟
⎟⎠, v :=
⎛
⎝v1
v2
⎞
```
⎠ . (30)
```
Quick Construction of Dangerous Disturbances in Conflict Control Problems 17
```
All partial derivatives are computed at x re f , u re f , and v = (0, 0)T . Note that the
```
state vector, control parameter, and disturbance inputs are the same as in the non-
```
linear relaxed model (22)–(25). Therefore, the target set M and the constraints on
```
the control and disturbance inputs remain the same as in the nonlinear relaxed model.
```
Remark 8 The system (28)–(30) can be reduced to the form (1) by setting x :=
```
```
x − x re f , u := B(u − u re f ) and v := Cv. Obviously, the new target set M and the
```
constraints on the new control u and disturbance vector v are of the parallelotope
type so that the new system satisfies the requirements of Sect. 3.
6.5 Generation of Disturbances
```
To construct a repulsive disturbance for the relaxed nonlinear model (22)–(25), a
```
```
parallelotope tube VP is constructed for the linearized problem (28)–(30). More
```
```
precisely, the cross sections VP (ti ) = VP [ p(ti ), P(ti )] are computed for a time sam-
```
pling. The disturbance in the relaxed nonlinear model at each time instant ti is being
```
chosen according to (8) based on the cross section VP (ti ).
```
```
It should be noted that the condition x(0) /∈ VP [ p(0), P(0)] is required for the
```
```
application of the feedback rule (8). To satisfy this condition, a scheme with multiple
```
target sets Mμ can be used. Here, μ ∈ R+ is a scaling factor applied to the original
target set M = VP [ p f , P f ]. Therefore,
```
Mμ = VP [ p f , μ P f ]. (31)
```
Further, a set of scaling factors μ1 < μ2 < ... < μM is chosen, and multiple target
```
sets Mμ1, ..., MμMare defined according to formula (31). For each Mμs, s ∈ 1, M,
```
the corresponding parallelotope repulsive tube VP μs is constructed. At the current
```
position (ti , x(ti )) an index s ∈ 1, M is chosen in such a way that x(ti ) /∈ VP μs (ti )
```
```
and x(ti ) ∈ VP μs+1 (ti ). The repulsive disturbance is computed according to formula
```
```
(8), based on VP μs (ti ) = [ p(ti ), Pμs (ti )] .
```
```
Remark 9 It is clear that VP μk (ti ) ⊂ VP μs (ti ) whenever μk < μs . Therefore, for
```
```
the linearized system (28)–(30), the repulsive property guarantees that the trajectory
```
does not penetrate into the sets VP μk with μk ≤ μs in future time steps. On the
```
other hand, if the control (pilot) plays nonoptimally, the disturbance can achieve that
```
```
x(tr ) /∈ VP μ j (tr ) with μ j > μs at some tr > ti . In such a case, the repulsive cross
```
```
section VP μ j (tr ) should be used at tr to increase the deviation of the trajectory from
```
the reference path.
```
The simulation results for the nonlinear relaxed model (22)–(25) with constraints
```
```
on the disturbance and control given by (26) and (27) are shown in Figs. 7, 8, 9.
```
Multiple target sets Mμs, s ∈ 1, 25, with μs uniformly distributed in the interval
```
[0.04; 1], are used. The right-hand sides of inequalities (20) and (21) are chosen
```
18 K. Martynov et al.
0 5 10
Time, [s]
70
75
80
85
90
95
100
V, [m/s]
0 5 10
Time, [s]
0
2
4
6
8
10
12
14
γ, [ ]
```
Fig. 7 Left: Aerodynamic velocity V of the aircraft and the reference value V0 (thin horizontal
```
```
line). Right: Kinematic path inclination angle γ and the reference value γ0 (thin horizontal line).
```
The vertical lines at t = 14 s show the corresponding projections of the target set
0 5 10
Time, [s]
-5
0
5
10
W x
, [m/s]
0 5 10
Time, [s]
-4
-2
0
2
4
W h
, [m/s]
```
Fig. 8 Left: Horizontal wind velocity W x along the trajectory (yielded by the disturbance command
```
```
v1 ). Right: Vertical wind velocity W h along the trajectory (yielded by the disturbance command v2 )
```
as ΔV = 15.2 m/s and Δγ = 5◦, respectively. The repulsive tubes are constructed
with the uniform time sampling ti+1 − ti = 10−3 s. To play against the repulsive
```
disturbance, a quasi-optimal feedback control strategy u(t, x) based on parallelotope
```
```
approximations of solvability tubes (see [7]) is used. Such a strategy has already been
```
```
successfully applied to problems of aircraft control (see [9]).
```
Simulation results show that the repulsive disturbance provides evasion from the
target set, whereas constant disturbances whose values coincide with the vertices of
```
the rectangle given by (26) cannot solve this problem. Figure 10 shows the com-
```
parison between the repulsive disturbance and the strongest constant disturbance,
v1 ≡ −13.7 m/s and v2 ≡ 5.5 m/s, providing the largest deviation among all con-
stant disturbances.
Quick Construction of Dangerous Disturbances in Conflict Control Problems 19
Fig. 9 Angle of attack α
```
(pilot’s control)
```
0 5 10
Time, [s]
8
10
12
14
16
[ ]
0 5 10
Time, [s]
70
75
80
85
90
95
100
V, [m/s]
0 5 10
Time, [s]
0
2
4
6
8
10
12
14
γ, [ ]
```
Fig. 10 Left: Aerodynamic velocity V for the repulsive (solid) and optimal constant (dashed)
```
```
disturbances. Right: Kinematic path inclination angle γ for the repulsive (solid) and optimal constant
```
```
(dashed) disturbances. The vertical lines at t = 14 s show the corresponding projections of the target
```
set. The thin horizontal lines depict the reference values V0 and γ0
7 Application: Linear Model of Aircraft Lateral Dynamics
In this section, a repulsive disturbance for a linearized aircraft closed-loop dynamics
```
of lateral motion (see [6]) is constructed. Such a model is derived under the assump-
```
tion of horizontal balanced flight, which results in decoupling the longitudinal and
lateral motions after the linearization.
7.1 Model Equations
The rigid body states for the linearized model of lateral motion are the yaw rate r,
roll rate p, side-slip angle β, and roll angle Φ. Furthermore, second-order transfer
functions of the form
20 K. Martynov et al.
```
G(s) = ω
```
20
```
s2 + 2dω0s + ω20(32)
```
with natural frequency ω0 and damping constant d are employed to model the actuator
dynamics of the primary control surfaces in the lateral plane. This results in additional
states for the aileron position ξpos and angular rate ξ vel , as well as the rudder position
ζpos and angular rate ζvel . Moreover, a wind disturbance VW,cmd is introduced by
using the following first-order lag filter
```
˙VW = τ −1W · (VW,cmd − VW ) (33)
```
with τW = 2, which produces smooth wind profiles for the wind state VW . Besides this
wind disturbance, we additionally consider worst case pilot commands as disturbance
inputs, which are the side load factor command δn y and the roll angle command
δΦ . As the control structure under investigation features a proportional and integral
part for both the roll angle command and the side load force command, we also
include the corresponding states of the integral parts denoted by eΦ and en y as states.
Summarizing, the state vector for the linear system
```
˙x = Ax + Cv, with x(0) = 0 (34)
```
comprises nine states, x =
[
eΦ , en y , r, β, p, Φ, ξpos , ξ vel , ζpos , ζvel
]T
, and the distur-
bance vector includes three components, v =
[
δn y , δΦ , VW,cmd
]T
, for the pilot and
wind disturbance commands. These components are constrained as follows:
```
|δn y | ≤ 0.1 rad, |δΦ | ≤ 0.9, |VW,cmd | ≤ 10 m/s. (35)
```
7.2 Construction of the Disturbance
```
In (34), the first two components of the state vector x stands for the integrated errors.
```
```
Therefore, the aim of the disturbance is to maximize the functional |x1(θ)| + |x2(θ)|.
```
This objective is associated with two-dimensional parallelotope target sets
```
Mc := VP
```
```
[(
```
0
0
```
)
```
,
```
( c√
```
2
c√
2
− c√2c√2
```
)]
```
```
= {x1, x2 : |x1| + |x2| ≤ c} (36)
```
defined for different positive values of the parameter c.
Note that the approach of Sect. 3 requires the full dimensionality of the target set,
```
i.e., it should involve all components of the state vector of system (34). In order to
```
```
remain in two dimensions, equations (34) will be transformed using the following
```
```
substitution:
```
```
y(t) = X (t, θ)x(t). (37)
```
Quick Construction of Dangerous Disturbances in Conflict Control Problems 21
```
Here, X (t, θ) is the fundamental matrix of the homogeneous system ˙x = Ax. More
```
```
precisely, X (t, θ) satisfies the equations
```
∂
```
∂t X (t, θ) = −X (t, θ)A, X (θ, θ) = I d, (38)
```
```
with the corresponding identity matrix I d. Since the matrix A in (34) is constant,
```
```
X (t, θ) can be computed as
```
```
X (t, θ) = e A(θ−t) . (39)
```
```
Combining (34), (37), and (38) yields the following system:
```
```
˙y = X (t, θ)Cv, with y(0) = 0. (40)
```
```
The properties of X imply that y(θ) = x(θ), and therefore, only the two first equa-
```
```
tions of (40) and the two-dimensional target sets Mc defined by (36) should be used.
```
Similar to Sect. 6.5, a repulsive disturbance will be constructed using the technique
```
of multiple target sets obtained by varying the parameter c in (36).
```
7.3 Validation Using Optimal Control Theory
It is interesting to compare the result obtained using the repulsive disturbance with
that gained from solving an appropriate optimal control problem. In this comparison,
```
the criterion to be maximized is the Mayer cost function J M = x1(θ) + x2(θ) which
```
is evaluated at the fixed time instant θ = 4 s. In order to solve this optimal control
problem numerically, the following trapezoidal collocation scheme, which assumes
the uniformly spaced time grid with the discretization step length ti+1 − ti = Δt =
0.004 s, is used:
```
x i+1 = x i + Δt · f (x i , vi ) + f (x i+1, vi+1)2 . (41)
```
```
Here f (x, v) = Ax + Cv according to the notation (34), and the low indices cor-
```
```
respond to the time sampling instants, e.g., x i = x(ti ) and vi = v(ti ). The initial
```
```
state x(t0) = 0 is enforced as equality constraint at the beginning of the time inter-
```
val and the final state is free. The parameter optimization problem resulting from
the discretization of the continuous-time optimal control problem is solved using an
interior point solver with a feasibility and optimality tolerance of 10−7 . See [6] for
more details.
22 K. Martynov et al.
0 1 2 3 4
Time, [s]
0
0.2
0.4
0.6
0.8
1
1.2
1.4
|eΦ
| +
|e n
y |
0 1 2 3 4
Time, [s]
-0.1
-0.05
0
0.05
0.1
δ n y
Fig. 11 Left: The absolute values sum of the error components eΦ and e n y obtained with the
repulsive disturbance. Right: Disturbance δn y
0 1 2 3 4
Time, [s]
-0.5
0
0.5
δΦ
0 1 2 3 4
Time, [s]
-10
-5
0
5
10
V W,cmd
Fig. 12 Left: Disturbance δ Φ . Right: Disturbance VW,cmd
7.4 Simulation Results
Simulation results for the time interval [0, θ], θ = 4 s, are shown in Figs. 11 and 12.
As discussed in Sect. 6.5, the repulsive disturbance can be compared with extreme
```
constant disturbances. In virtue of (35), there are eight extreme points of the dis-
```
turbance constraint. However, only four of them should be considered due to the
symmetry of the system equations. Figure 13 presents the comparison of the extreme
and repulsive disturbances. Note that the extreme disturbances perform well, but the
repulsive disturbance yields a better result.
Finally, the parallelotope-based repulsive disturbance is compared with that
```
obtained from optimal control theory (see Sect. 7.3). Theoretically, the parallelotope-
```
based repulsive disturbance cannot outperform the optimal one. Nevertheless, the
results produced by the both disturbances are very close to each other as it is shown
in Fig. 14. Furthermore, Figs. 14 and 15 demonstrate that the parallelotope-based
repulsive disturbance and the optimal one produce very similar input signals.
Quick Construction of Dangerous Disturbances in Conflict Control Problems 23
0 1 2 3 4Time, [s]0
0.2
0.4
0.6
0.8
1
1.2
1.4
|eΦ
| +
|e n
y |
Fig. 13 The absolute values sum of the error components eΦ and e n y obtained with the repulsive
```
disturbance (solid line) and all possible constant extreme disturbances (dashed lines)
```
0 1 2 3 4
Time, [s]
0
0.2
0.4
0.6
0.8
1
1.2
1.4
|eΦ
| +
|e n
y |
0 1 2 3 4
Time, [s]
-0.1
-0.05
0
0.05
0.1
δ n y
Fig. 14 Left: The absolute values sum of the error components eΦ and e n y obtained with the
```
repulsive disturbance (solid line) and the optimal control-based one (dashed line). Right: Disturbance
```
```
δn y , comparison of the repulsive disturbance (solid line) and the optimal control-based one (dashed
```
```
line)
```
0 1 2 3 4
Time, [s]
-0.5
0
0.5
δΦ
0 1 2 3 4
Time, [s]
-10
-5
0
5
10
V W,cmd
```
Fig. 15 Left: Disturbance δ Φ , comparison of the repulsive disturbance (solid line) and the optimal
```
```
control-based one (dashed line). The lines coincide. Right: Disturbance VW,cmd , comparison of the
```
```
repulsive disturbance (solid line) and the optimal control-based one (dashed line)
```
24 K. Martynov et al.
8 Conclusion
The results of Sects. 5–7 demonstrate that the method presented can be success-
fully applied to various types of control systems. In particular, promising results are
obtained for a nonlinear model considered in Sect. 6 and a complex linear system
treated in Sect. 7. As it is shown, the parallelotope-based repulsive disturbance is
expected to provide a near-optimal result. In any case, it significantly outperforms
constant extreme disturbances.
The main advantage of the method proposed is its applicability to high-dimensional
conflict control problems. The computational efforts are relatively low so that the
method may run in real time. Therefore, advanced aircraft models comprising numer-
ous state variables, controllers, filters, etc. can be tested with this approach. One of the
main future objectives is the implementation of the method on a real flight simulator.
Acknowledgments This work is supported by the DFG grant TU427/2-1 and HO4190/8-1 as well
as TU427/2-2 and HO4190/8-2. Computer resources for this project have been provided by the
Gauss Centre for Supercomputing/Leibniz Supercomputing Centre under grant: pr74lu.
References
1. Aubin, J.-P.: Viability Theory. Birkhäuser, Basel (2009)
2. Aubin, J.-P., Frankowska, H.: Set-Valued Analysis. Birkhäuser, Basel (2009)
3. Botkin, N. D., Hoffmann, K.-H., Turova, V. L.: Stable numerical schemes for solving Hamilton–
```
Jacobi–Bellman–Isaacs equations. SIAM J. Sci. Comput. 33(2), 992–1007 (2011)
```
4. Botkin, N. D., Hoffmann, K.-H., Mayer, N., Turova, V. L.: Approximation schemes for solving
disturbed control problems with non-terminal time and state constraints. Analysis 31, 355–379
```
(2011)
```
5. Botkin, N., Martynov, K., Turova, V., Diepolder, J.: Generation of dangerous disturbances for
```
flight systems. Dynamic Games and Applications 9(3), 628–651 (2019)
```
6. Diepolder, J., Gabrys, A., Schatz, S., Bittner, M., Grüter, B., Holzapfel, F., Ben-Asher, J. Z.:
Flight control law clearance using worst-case inputs. In: ICAS 30th International Congress of
```
the International Council of the Aeronautical Sciences. ICAS (2016)
```
7. Kostousova, E. K.: On target control synthesis under set-membership uncertainties using poly-
```
hedral techniques. In: Pötzsche, C. et al. (eds.) System Modeling and Optimization, vol. 443,
```
```
pp. 170–180. Springer-Verlag, Berlin, Heidelberg (2014)
```
8. Krasovskii, N. N., Subbotin, A. I.: Game-Theoretical Control Problems. Springer, New York
```
(1988)
```
9. Martynov, K., Botkin, N. D., Turova, V. L., Diepolder, J.: Real-time control of aircraft take-
off in windshear. Part I: Aircraft model and control schemes. In: 2017 25th Mediterranean
```
Conference on Control and Automation (MED), pp. 277–284. IEEE (2017)
```
10. Miele, A., Wang, T., Melvin, W. W.: Optimal take-off trajectories in the presence of windshear.
J. Optimiz. Theory App. 49(1), 1–45 (1986)
11. Turova, V. L.: Application of numerical methods of the theory of differential games to the
```
problems of take-off and abort landing. Trudy Inst. Math. Mech UrO RAN 2, 188–201 (1992)
```
[in Russian]
12. Zarkh, M. A., Patsko, V. S.: The second player’s strategy in a linear differential game. J. Appl.
```
Math. Mech-USS 51(2), 150–155 (1987)
```
Isaacs’ Two-on-One Pursuit-Evasion
Game
Meir Pachter
1 Introduction
In this paper, Isaacs’ “Two Cutters and a Fugitive Ship” differential game is revisited.
We consider the pursuit-evasion differential game in the Euclidean plane where
two pursuers P1 and P2 , say cutters, chase a fugitive ship, the evader E. All move
with simple motion à la Isaacs, the speeds of the cutters each being greater than
that of the fugitive ship. Coincidence of E with either one, or both, P1 and/or P2 ,
is capture, and time of capture is the payoff of E and the cost of the P1 & P2
team. Interestingly, the Two Cutters and Fugitive Ship pursuit game was posed by
Hugo Steinhaus back in 1925—his original paper was reprinted in 1960 in [2]. 1
The solution of the differential game, sans its justification, is presented in Isaacs’
ground breaking book [1, Example 6.8.3, pp. 148–149]. In [1] the players’ optimal
strategies were derived using a geometric method. In [3] a preliminary attempt at
justifying the geometric method was undertaken. In this paper, we provide a proof of
the correctness of the geometrically derived optimal pursuit and evasion strategies
1 Hugo Steinhaus, was a contemporary of Borel and Von Neumann who are credited with laying the
foundations of game theory. Borel and Von Neumann mainly considered static games, a.k.a. games in
normal form, while referring to dynamic games as games in extensive form, believing that dynamic
games can be easily transformed to static games. The requirement of time consistency/subgame
perfectness in dynamic games came to the attention of game theorists only in the seventies. From
the outset, Steinhaus was certainly attuned to thinking about dynamic games, a.k.a., differential
games.
The views expressed in this article are those of the author and do not reflect the official policy or
position of the United States Air Force, Department of Defense, or the US Government.
M. Pachter (B)
Air Force Institute of Technology, Dayton, OH, USA
e-mail: meir.pachter@afit.edu
```
© The Editor(s) (if applicable) and The Author(s), under exclusive license
```
to Springer Nature Switzerland AG 2020
D. M. Ramsey and J. Renault (eds.), Advances in Dynamic Games,
Annals of the International Society of Dynamic Games 17,
```
https://doi.org/10.1007/978-3-030-56534-3_2
```
25
26 M. Pachter
using Isaacs’ method for the systematic solution of differential games. The three
players’ state feedback optimal strategies are synthesized and the Value of the game
is derived. The geometric method for solving the Two Cutters and Fugitive Ship
differential game is fully justified. Some geometric features, perhaps overlooked by
Isaacs, but with a bearing on extensions, are addressed: The state space regions where
```
pursuit devolves into Pure Pursuit (PP) by either P1 or P2 , or into a pincer movement
```
pursuit by the P1 & P2 team who cooperatively chase the evader, are characterized.
Thus, a complete solution of the Game of Kind is provided. The analysis undertaken
herein provides a vehicle for discussing some salient features of general pursuit-
evasion differential games, and opens the door to employing the geometric method
to consider operationally relevant group pursuit/swarm attack tactics.
The paper is organized as follows. The geometric method employed by Isaacs to
solve the Two Cutters and Fugitive Ship differential game is expounded on in Sect.
2. In Sect. 3 a three-states reduced state space reformulation of the Two Cutters and
Fugitive Ship differential game is introduced and the geometric method is employed
to yield the players’ optimal state feedback strategies and the game’s Value function
in closed form. Furthermore, the state space regions where either one of the pursuers
captures the evader and the state space region where both pursuers cooperatively
and isochronously capture the evader are characterized, thus solving the Game of
Kind. The reduced state space formulation is required in order to apply Isaacs’
method for the systematic solution of differential games to the Two Cutters and
Fugitive Ship differential game and prove the correctness of the geometric method.
Due to symmetry, it is sufficient to present the solution of the differential game in
the positive orthant of the reduced state space. The solution process is presented in
Sect. 4: The protagonists’ strategies previously obtained using the geometric method
are recovered, thus validating the geometric method and providing the solution of
the Game of Degree. As it so often happens in differential games, the doctrinaire
employment of Isaacs’ method towards the solution of even this “simple” differential
game is not devoid of complexity. However, the intuition provided by the heuristic
geometric approach is instrumental in facilitating the solution process. The Two
Cutters and Fugitive Ship is a differential game whose Value function is C1 in the
positive orthant of the reduced state space. The reduced state space of the Two
Cutters and Fugitive Ship differential game comprises the first and third quadrants
```
of R3 . The half plane {(x, y, z) | x ≥ 0, y = 0} is a surface of symmetry and the half
```
```
plane {(x, y, z) | x ≥ 0, z = 0} is a surface of symmetry and also a dispersal surface,
```
where the Value function of the differential game is not differentiable. While dispersal
surfaces in differential games are prone to spawning singular surfaces of equivocal or
focal type, this is not the case in the Two Cutters and Fugitive Ship differential game.
The optimal flow field consists of regular trajectories only, and there are no singular
surfaces, except the above mentioned “benign” dispersal surface. Conclusions are
presented in Sect. 5, where possible extensions are also discussed. In this paper, the
solution of the Game of Kind is provided and the geometric method for obtaining
the solution of the Game of Degree and thus solving the Two Cutters and Fugitive
Ship differential game, is fully justified.
Isaacs’ Two-on-One Pursuit-Evasion Game 27
Interestingly, it has been suggested by one of the referees that Isaacs’ Two Cutters
and Fugitive Ship differential game could also have been addressed building on the
method expounded in Ref. [4].
2 The Geometric Method
Without much loss of generality, we assume that the fast pursuers P1 and P2 have
equal speed, which we normalize to 1. The problem parameter is the speed of the
evader E which is 0 ≤ μ < 1.
There are three players in the Euclidean plane so the realistic state space is obvi-
```
ously R6 ;, however, the state space could be reduced to R4 by collocating the origin
```
```
of a non- rotating (x, y) Cartesian frame at E’s instantaneous position. Since the
```
players are holonomic, the dynamics A matrix is 0—there are no dynamics. This,
and the fact that the performance functional is the time-to-capture, yields a Hamilto-
nian s.t. the costates are all constant. This suggests that the optimal flow field might
consist of straight line trajectories. Hence geometry might come into play. Thus,
Isaacs directly used a geometric method for the solution of pursuit-evasion games
with simple motion, well aware that this might not always be possible, as he amply
demonstrated with the Obstacle Tag Chase differential game where the presence of
a state constraint brings about the violation of the requirement in dynamic games
of time consistency/subgame perfectness. To obtain, albeit without proof, the Two
Cutters and Fugitive Ship differential game’s solution, Isaacs successfully employed
the geometric concept of an Apollonius circle—see Sect. 2.1 below—to delineate
```
the Safe Region (SR) and the Boundary of a Safe Region (BSR) for the Evader. The
```
Apollonius circle concept is conducive to the geometric solution of the Two Cutters
and Fugitive Ship differential game, as will be demonstrated in the sequel.
2.1 Apollonius Circle
For the sake of completeness, we provide the geometry of Apollonius circles which
will prominently feature in the geometric solution of this differential game with
two pursuers and one evader and also in extensions where multiple pursuers are
employed. An Apollonius circle is the locus of all points in the plane s.t. the ratio of
```
the distances to two fixed points in the plane, also referred to as foci, is constant; in
```
our case the ratio in question is the Pursuer/Evader speed ratio parameter μ < 1 and
the foci are the instantaneous positions of E and P. The Apollonius circle is illustrated
in Fig. 1.
The three points P, E and the center O of the Apollonius circle are collinear and
E is located between P and O. Let the E-P distance be d. The radius of the Apllonius
circle is then
28 M. Pachter
Fig. 1 Apollonius circle
```
ρ = μ1 − μ2 d (1)
```
and in Fig. 1 the coordinates of the center of the Apollonius circle are
x O = μ
2
```
1 − μ2 d, y O = 0. (2)
```
2.2 Isaacs’ Geometric Solution
We first present the solution of the Two Cutters and Fugitive Ship differential game
in the realistic plane using the geometric method. Two Apollonius circles, C1 , whose
foci are at E and P1 and the Apollonius circle C2 , whose foci are at E and P2 , feature in
this game. E is in the interior of both Apollonius disks but the two Apollonius circles
might or might not intersect. Concerning the calculation of the points of intersection,
if any, of the Apollonius circles C1 and C2 : Subtracting the equation of circle C1 from
the equation of circle C2 yields a linear equation in two unknowns, say, X and Y . One
can thus back out Y as a function of X and insert this expression into one of the circle
equations, thus obtaining a quadratic equation in X: The calculation of the two points
of intersection of the Apollonius circles C1 and C2 boils down to the solution of a
quadratic equation. The Apollonius circles intersect i f f the quadratic equation has
real solutions, in other words, the discriminant of the quadratic equation is positive.
When the discriminant of the quadratic equation is negative we are automatically
notified that the Apollonius circles don’t intersect, and because E is in the interior
of both Apollonius disks, we conclude that one of the Apollonius disks is contained
in the interior of the second Apollonius disk. If ρ2 > ρ1 , which is the case i f f E
```
is closer to P1 than to P2 —see Eq. (1)—the circle C2 is discarded, and vice versa.
```
The geometry is illustrated in Fig. 2. When the Apollonius circles don’t intersect, the
pursuer associated with the outer Apollonius circle is irrelevant to the chase. This
is so because the configuration is s.t. should P1 employs PP and E run for his life,
player P2 cannot reach E before the latter is captured by P1 because he is too far away
Isaacs’ Two-on-One Pursuit-Evasion Game 29
Fig. 2 One cutter action
from the P1/E engagement, or is too slow to close in and join the fight. This renders
player P2 irrelevant. As far as the geometric method is concerned, the Apollonius disk
associated with player P1 is then contained in the interior of the bigger Apollonius
disk associated with player P2 , as illustrated in Fig. 2. In this case, the pursuer P1 on
which the inner Apollonius circle is based will singlehandedly capture the evader:
He will optimally employ PP while the Evader runs for his life and will be captured at
```
I; the game with two pursuers devolved to the simple pursuit-evasion game with one
```
pursuer and one evader where P1 employs PP and E runs away from P1 . Similarly,
if the Apollonius disk associated with P2 is contained in the interior of the bigger
Apollonius disk associated with player P1 , player P2 will employ PP while E runs
```
for his life; P1 is then redundant.
```
The case considered in [1] where the discriminant of the quadratic equation is
positive and the Apollonius circles intersect is illustrated in Fig. 3. Since there are two
pursuers, similar to Fig. 6.8.5 in [1], a lens-shaped BSR is formed by the intersection
of the two Apollonius circles. To calculate the aim point I which is one of the two
points where the Apollonius circles C1 and C2 intersect requires solving a quadratic
```
equation; the quadratic equation has two real solutions and among the two points
```
of intersection of the Apollonius circles, the aim point I is the point farthest from
E. Thus, E heads toward the most distant point I on the BSR, and so do P1 and P2 .
Thus, it would seem that both pursuers P1 and P2 will be active and cooperatively and
isochronously capture the evader at point I, as shown in Fig. 3. It is noteworthy that
during optimal play the Apollonius circles shrink but the players’ aim point I remains
fixed. Thus, in contrast to the Obstacle Tag Chase game, time consistency/subgame
perfectness is not violated. This bodes well for the correctness of the geometric
approach.
When the discriminant of the quadratic equation is zero the quadratic equation
has a repeated real root. Geometrically this means that one of the Apollonius circles
is tangent from the inside to the second Apollonius circle. The following holds.
Proposition 1 Assume the Apollonius circles C1 and C2 are tangent, that is, the
discriminant of the quadratic equation vanishes. The aim point of the three players
30 M. Pachter
Fig. 3 Solution of two
cutters and fugitive ship
game
Fig. 4 PP by P1 and P2
is then the circles’ point of tangency, say T, that is, I=T, i f f the three players E, P1
and P2 are collinear and E is sandwiched between P1 and P2.
Thus, when the Apollonius circles C1 and C2 are tangent and their point of tangency
T is s.t. T = I, the points P2, T, O1 , E, O2 and P1 are collinear and both pursuers
employ PP to isochronously capture the evader. This is illustrated in Fig. 4. Note
however that when, as above, P1 , P2 and E are collinear and E is sandwiched
between P1 and P2 , but the Apollonius circles intersect, E will break out—see
Fig. 5. If the Apollonius circles C1 and C2 are tangent, however E is not on the
segment P1 P2 , the players’ aim point I is not the circles’ point of tangency T: If
the tangent Apollonius circles are s.t. the Apollonius circle C1 is contained in the
Apollonius disk formed by the Apollonius circle C2 , optimal play then consists of the
active player being P1 and employing PP while E runs away from P1 and player P2 is
```
redundant; and if the Apollonius circle C2 is contained in the Apollonius disk formed
```
by the Apollonius circle C1 , optimal play then consists of the active player being P2
```
and employing PP while E runs away from P2 , and now player P1 is redundant;
```
the circles’ point of tangency T plays no role here. This should alert us to the fact
that even though the Apollonius circles intersect at their point of tangency, that is,
C1 ∩ C2  = ∅ and T ∈ C1 ∩ C2 , the players’ aim point I /∈ C1 ∩ C2 . The fact that the
two Apollonius circles intersect does not automatically imply that during optimal
play both pursuers will cooperatively and isochronously capture the evader. As we
shall see, there are instances where although the Apollonius circles intersect, during
optimal play just one of the pursuers singlehandedly captures the evader.
Isaacs’ Two-on-One Pursuit-Evasion Game 31
Fig. 5 Breakout of E
Fig. 6 Solution of the game
of kind in the realistic plane
In summary, the solution in the realistic plane of the Game of Kind is illustrated
in Fig. 6. Given the position of the pursuers, during optimal play, when the evader is
initially in the region R1 to the right of the right broken line, he will be singlehandedly
```
captured by P1 in Pure Pursuit (PP), when he is initially in the region R2 to the left
```
of the left broken line, he will be singlehandedly captured by P2 in PP, and when the
evader is initially in the shaded region R1,2 between the right and left broken lines
he will isochronously be captured by both pursuers P1 and P2 . When the evader is
initially on the right broken line he will isochronously be captured by both pursuers
P1 and P2 , with P1 in PP and when the evader is initially on the left broken line he
will isochronously be captured by both pursuers P1 and P2 , with P2 in PP.
3 Geometric Solution in Reduced State Space
The dimension of the Two Cutters and Fugitive Ship game’s state space can be
reduced to three using a non-inertial, rotating reference frame, by pegging the x-
axis to P1 and P2 ’s instantaneous positions. The y-axis is the orthogonal bisector of
```
the P1 P2 segment. In this rotating (x, y) reference frame the states are E’s x- and
```
```
y-coordinates (x E , y E ) and the x-position x P of P1 . In this reduced state space the
```
32 M. Pachter
Fig. 7 Rotating reference
frame
```
y-coordinate of P1 will always be 0 and the position of P2 will be (−x P , 0). Due to
```
symmetry, without loss of generality we assume x E ≥ 0 and y E ≥ 0. The rotating
```
reference frame (x, y) is shown overlaid on the realistic plane (X, Y) in Fig. 7 where
```
the P1 , E and P2 players’ headings χ, φ and ψ are also indicated. Without loss of
```
generality, the rotating reference frame (x, y) is initially aligned with the inertial
```
```
frame (X, Y ). Using the rotating reference frame (x, y), the state space of the Two
```
Cutters and Fugitive Ship differential game is reduced to the first and third quadrant
of R3 , that is, the set R31 ∪ R33 , where
```
R31 ≡ {(x P , x E , y E ) | x P ≥ 0, y E ≥ 0}, R33 ≡ {(x P , x E , y E ) | x P ≥ 0, y E ≤ 0}.
```
```
There are two half planes of symmetry, {(x P , x E , y E ) | x P ≥ 0, x E = 0} and
```
```
{(x P , x E , y E ) | x P ≥ 0, y E = 0}, the latter also being a dispersal surface. Symmetry
```
allows us to confine our attention to the case where x E ≥ 0, y E ≥ 0, that is, the state
will evolve in the positive orthant of R3 , that is, in
```
R3+ = {(x P , x E , y E ) | x P ≥ 0, x E ≥ 0, y E ≥ 0},
```
where the three-state nonlinear dynamics of the Two Cutters and Fugitive Ship dif-
ferential game are
```
˙x P = 12 (cos χ − cos ψ), x P (0) = x P0 (3)
```
```
˙x E = μ cos φ − 12 (cos χ + cos ψ) + 12y Ex
```
P
```
(sin χ − sin ψ), x E (0) = x E0 (4)
```
```
˙y E = μ sin φ − 12 (sin χ + sin ψ) − 12x Ex
```
P
```
(sin χ − sin ψ), y E (0) = y E0 . (5)
```
Isaacs’ Two-on-One Pursuit-Evasion Game 33
3.1 Game of Kind in Reduced State Space
```
The solution of the Game of Kind in the reduced state space (x P , x E , y E ) using the
```
geometric method proceeds as follows.
We have two Apollonius circles: C1 is based on the instantaneous positions of
```
E and P1 , and C2 is based on the instantaneous positions of E and P2 . In the (x,y)
```
```
frame, see Fig. 6 and Eq. (2), the center O1 of the Apollonius circle C1 is at
```
```
x O1 = 11 − μ2 (x E − μ2 x P ), y O1 = 11 − μ2 y E
```
Similarly, the center O2 of the Apollonius circle C2 is at
```
x O2 = 11 − μ2 (x E + μ2 x P ), y O2 = 11 − μ2 y E
```
```
Thus, using Eq. (1), the equation of the Apollonius circle C1 is
```
```
[x − 11 − μ2 (x E − μ2 x P )]2 + (y − 11 − μ2 y E )2 = μ
```
2
```
(1 − μ2)2 [(x E − x P )
```
2 + y2E ]
```
(6)
```
and the equation of the Apollonius circle C2 is
```
[x − 11 − μ2 (x E + μ2 x P )]2 + (y − 11 − μ2 y E )2 = μ
```
2
```
(1 − μ2)2 [(x E + x P )
```
2 + y2E ]
```
(7)
```
```
In the (x, y) reference frame the y-coordinate of the C1 and C2 Apollonius circles’
```
centers is the same and therefore the distance d between the circles’ centers is
```
d = x O2 − x O1 = 2μ
```
2
1 − μ2 x P
Hence, because the radii of the Apollonius circles are s.t. ρ1 < ρ2 i f f x E > 0, the
Apollonius circles C1 and C2 intersect i f f d + ρ1 > ρ2 , that is,
2μx P + d1 > d2
In other words, the inequality holds
2μx P >
√
```
(x P + x E )2 + y2E −
```
√
```
(x P − x E )2 + y2E
```
34 M. Pachter
which yields the algebraic condition: The Apollonius circles C1 and C2 intersect i f f
```
μ2 y2E + (1 − μ2)(μ2 x2P − x2E ) ≥ 0. (8)
```
In light of this, the upper part R31 of the reduced state space is partitioned as follows:
```
R31 = R1 ∪ R2 ∪ R1,2.
```
During optimal play in R1 , E is captured solely by P1 while P2 is redundant, in R2 ,
E is captured solely by P2 while P1 is redundant, while in R1,2 E is isochronously
captured by P1 and P2 . At this point it appears that things stand as follows. If condition
```
(8) does not hold and x E > 0 the state is in R1 , where E is captured solo by P1 . If
```
```
condition (8) does not hold and x E < 0 the state is in R2 , where E is captured solo
```
```
by P2 : From a kinematic point of view, the state is in R1 if Collision Course (CC)
```
guidance won’t allow P2 to capture E who is running away from P1 , before P1 , using
```
Pure Pursuit (PP), captures E. Similarly, the state is in R2 if CC guidance won’t allow
```
P1 to capture E who is running away from P2 , before P2 , using PP, captures E. As far
as geometry is concerned, let Di denote the disk which corresponds to the Apollonius
circle Ci , i = 1, 2. In view of the discussion from above, it would appear that the set
```
R1 is characterized by D1 ⊂ D2 —see Fig. 2; similarly, the set R2 is characterized
```
```
by D2 ⊂ D1 , and if condition (8) holds—see Fig. 3 where the Apollonius circles
```
C1 and C2 intersect—one might then be inclined to think that the state is in R1,2 , so
that during optimal play E is isochronously captured by P1 and P2 . And as far as the
characterization of the sets R1 and R2 is concerned, since x E ≥ 0 implies ρ1 ≤ ρ2 ,
the disk D2 cannot be contained in the disk D1 , so either D1 ⊂ D2 or the Apollonius
circles C1 and C2 intersect. The geometric condition
D1 ⊂ D2 ⇒ d + ρ1 < ρ2
```
lets us recover the algebraic condition (8):
```
```
C1 ∩ C2  = ∅ ⇔ d + ρ1 > ρ2 ⇔ μ2 y2E + (1 − μ2)(μ2 x2P − x2E ) > 0,
```
```
as expected. The algebraic condition (8) delineates the set in R3+,
```
```
K1 = {(x P , x E , y E ) | x P ≥ 0, x E ≥ 0, μ2 y2E + (1 − μ2)(μ2 x2P − x2E ) < 0}.
```
This is a cone whose x E cross sections are arcs of ellipses—see Fig. 10. When the
state is in the interior of the elliptical cone K1 or in its projection onto the plane
y E = 0, D1 ⊂ D2 and so E is captured by P1 only. Thus, one is inclined to set
R1 ≡ K1 . Similarly, when the state is in the interior of the elliptical cone
```
K2 = {(x P , x E , y E ) | x P ≥ 0, x E ≤ 0, μ2 y2E + (1 − μ2)(μ2 x2P − x2E ) < 0}
```
Isaacs’ Two-on-One Pursuit-Evasion Game 35
```
or in its projection onto the plane y E = 0, D2 ⊂ D1 and so E is captured by P2 only;
```
the set K2 is the mirror image of the cone K1 about the plane x E = 0 and one is
inclined to set R2 ≡ K2 . The boundary of the elliptical cone K1 is the set of states
s.t. the Apollonius circle C1 is contained in the Apollonius disk formed by the bigger
```
circle C2 and is tangent to the Apollonius circle C2 ; similarly, the boundary of the
```
elliptical cone K2 is the set of states s.t. the Apollonius circle C2 is contained in the
Apollonius disk formed by the bigger circle C1 and is tangent to the Apollonius circle
C1 . When the state is on the boundary of the elliptical cones K1 or K2 the Apollonius
circles C1 and C2 are tangent, say, at point T . According to Proposition 1, the players’
aim point I is the point of tangency T of the Apollonius circles i f f y E = 0 and the
tangent to the Apollonius circles at T = I is the orthogonal bisector of the segment
```
P1 P2 ; and from Eq. (8) we deduce x E = μx P ; E is then isochronously captured by
```
```
P1 and P2 who employ PP—as illustrated in Fig. 4. Note that if x E = 0, condition (8)
```
```
holds, so the quarter plane {(x P , x E , y E ) | x P ≥ 0, x E = 0, y E ≥ 0} ⊂ R1,2 and E is
```
isochronously captured by P1 and P2 . Obviously E is also isochronously captured
by P1 and P2 when x P = 0. And so far, it would appear that during “optimal” play,
```
when the state is outside the elliptical cones K1 and K2 where the inequality (8)
```
holds, that is, the state is in what appears to be R1,2 , E will be isochronously captured
```
by the P1 &P2 team. Thus, at first blush it would appear that Eq. (8) characterizes
```
the set R1,2 . However, as will become apparent in the sequel, although in the set
```
R1,2 the inequality (8) holds, it also holds in subsets of R1 and R2 : Eq. (8) does not
```
characterize the set R1,2 .
We must properly characterize the state space regions R1 , R2 and R1,2 in R31 . The
```
inequality (8) does not provides the answer and it will be replaced by an alternative
```
condition. In this respect, consider the following. In Fig. 2 let the points E and
P2 be fixed while point P1 is moved in a clockwise direction, keeping the P1 − E
distance d1 constant so that the Apollonius circles C1 and C2 will eventually intersect,
```
whereupon the inequality (8) will hold. The radius ρ1 of the Apollonius circle C1
```
is kept constant while it is approaching the Apollonius circle C2 from the inside.
The Apollonius circle C1 first meets the Apollonius circle C2 tangentially and if
the segment P1 E rotates some more clockwise, the circles start intersecting. When
this initially happens, the point I in Fig. 2 is still in the interior of the disk formed
by the Apollonius circle C2 . Thus, although the Apollonius circles intersect and
```
condition (8) holds, E nevertheless flees toward point I with P1 in hot pursuit, as if
```
the configuration would have been as illustrated in Fig. 2 where the Apollonius circle
```
C1 is in the interior of the Apollonius disk formed by the Apollonius circle C2 ; it is
```
only when point I on the extension of the segment E O1 meets the Apollonius circle
C2 and then exists the disk formed by the Apollonius circle C2 , that both pursuers,
P1 and P2 cooperatively and isochronously capture E in a pincer maneuver. Thus,
although the Apollonius circles do intersect, it nevertheless might be the case that
neither one of their two points of intersection is the players’ aim point I, and as
before, only one of the pursuers is active while the Evader runs for his life from the
active pursuer. The BSR then has the shape of a thick lens and the Evader’s and the
active pursuer’s aim point I is the point on the thick lens—shaped BSR which is
farthest away from E—it is on the circumference of the smaller Apollonius circle,
36 M. Pachter
Fig. 8 Critical configuration
Fig. 9 Interception point I
on its diameter that runs through E, while at the same time it is in the interior of the
Apollonius disk formed by the bigger Apollonius circle. The critical configuration
where point I ∈ C2 is illustrated in Fig. 7. Since, without loss of generality, we
have assumed x E ≥ 0 and y E ≥ 0, our universe of discourse will be confined to the
positive orthant of R3 , R3+. To obtain a correct algebraic characterization of the sets
```
R1 , R2 and R1,2 which will supersede condition (8), proceed as follows.
```
```
Calculate the (x, y) coordinates of the critical point I on the circumference of the
```
Apollonius circle C1 which is antipodal to E, as shown in Fig. 8—see also Fig. 9:
We have
x P − x I
x P − x E=
ρ1 + E O1 + d1
d1,
y I
y E=
ρ1 + E O1 + d1
d1,
where
E O1 = μ
2
1 − μ2 d1, ρ1 =
μ
1 − μ2 d1.
Hence
```
x I = 11 − μ (x E − μx P ), y I = 11 − μ y E . (9)
```
Isaacs’ Two-on-One Pursuit-Evasion Game 37
By construction, I ∈ C1 and I is the critical aim point if in addition I ∈ C2 . To find
```
the points of intersection (x I , y I ) of the circles C1 and C2 boils down to the solution
```
of a quadratic equation:
x I = 0, y I =
y E +
√
```
μ2 y2E + (1 − μ2)(μ2 x2P − −x2E )
```
```
1 − μ2 . (10)
```
```
Combining Eqs. (9) and (10) we obtain the result
```
x E = μx P ,
and the solution of the Game of Kind is as follows.
Theorem 2 During optimal play the Evader is singlehandedly captured in PP by
```
P1 if the state is in the set R1; the set R1 is the wedge formed by the quarter planes
```
```
{(x P , x E , y E ) | x P = 0, x E ≥ 0, y E ≥ 0} and {(x P , x E , y E ) | x E = μx P , x P ≥ 0,
```
```
y E ≥ 0}. The Evader is singlehandedly captured in PP by P2 if the state is in the
```
```
set R2; the set R2 is the mirror image of R1 about the plane x E = 0. The Evader is
```
cooperatively and isochronously captured by P1 and P2 if the state is in the set
```
R1,2 = {(x P , x E , y E ) | −μx P ≤ x E ≤ μx P , x P ≥ 0, y E ≥ 0}
```
```
The cones K1 and K2 and/or condition (8) have no role to play here. The Apollonius
```
circles C1 and C2 intersect if −μx P ≤ x E ≤ μx P .
Remark 2 Proposition 1 is a corollary of Theorem 5.
In summary, the reduced state space of the Two Cutters and Fugitive Ship differential
```
game is the first quadrant of R3 , that is, R31 = {(x P , x E , y E ) | x P ≥ 0, y E ≥ 0}. The
```
```
state space R31 is symmetric about the plane x E = 0; the positive orthant R3+ half of
```
```
the state space where R1 (and K1 ) reside is illustrated in Fig. 9. Since point capture is
```
desired, the terminal set in the R1 subset of the R3+ state space illustrated in Fig. 10 is
```
the straight line {(x P , x E , y E ) | x E = x P , x P ≥ 0, y E = 0} and the terminal set in the
```
R1,2 subset of the state space is the origin. However, when the pursuers are endowed
with a circular capture set of radius l the set R1 is no longer a wedge—the surface
separating the R1 and R1,2 subsets of the state space is no longer planar. The terminal
set in the R1 subset of the state space is now half a cylinder of radius l raised above the
```
plane y E = 0 and it is centered on the straight line {(x P , x E , y E ) | x P = x E , y E = 0}.
```
The terminal set in the R1,2 subset of the state space is a quarter circle in the plane
x E = 0 of radius l, centered at the origin. The positive orthant R3+ of the state space
when l > 0 is notionally illustrated in Fig. 10 where the region K1 in the state space
where the Cartesian ovals 2 intersect is also shown. The reduced state space also
```
comprises the third quadrant R33 of the reduced state space (x P , x E , y E ) but due to
```
2 When P is endowed with a capture circle the Apollonius circle locus is replaced with a Cartesian
oval.
38 M. Pachter
Fig. 10 The positive orthant
symmetry we confine our attention to the first ortant of the reduced state space. The
reader is referred to Ref. [5] where the Two-on-One pursuit-evasion differential game
with a non-zero capture range is analyzed.
3.2 Game of Degree in Reduced State Space
3.2.1 Game in R1 and R2
In R1 the active pursuer P1 employs PP while the evader runs for his life. The actions
of pursuer P2 do not affect the outcome of the game and so, for exclusively illustrative
```
purposes, we stipulate that P2 mirrors the control of P1 . This ensures that the (x, y)
```
frame won’t rotate—it would just slide upward along the Y - axis of the realistic
plane, which then coincides with the y-axis. The optimal trajectories in R1 are the
family of straight lines
```
x P (t) = x P0 + x E0 − x P0√
```
```
(x P0 − x E0 )2 + y2E0
```
t
```
x E (t) = x E0 + μ x E0 − x P0√
```
```
(x P0 − x E0 )2 + y2E0
```
t
```
y E (t) = y E0 − (1 − μ) y E0√
```
```
(x P0 − x E0 )2 + y2E0
```
t.
Isaacs’ Two-on-One Pursuit-Evasion Game 39
```
The state y E (t) is monotonically decreasing and when parameterized by y E , the
```
optimal trajectories in R1 are the family of straight lines
```
x P = 11 − μ ( x P0 − x E0y
```
E0
```
y E + x E0 − μx P0 )
```
```
x E = 11 − μ (μ x P0 − x E0y
```
E0
```
y E + x E0 − μx P0 ).
```
```
In the case of point capture (l = 0) these trajectories terminate in the plane y E = 0, on
```
the straight line x P = x E . The optimal flow field in R1 consists of the family of straight
```
line trajectories from above, which terminate on the straight line {(x P , x E , y E ) | x E =
```
```
x P , y E = 0}. Similar considerations apply to R2 where the active pursuer is P2 . The
```
optimal flow field in R2 is a mirror image of the optimal flow field in R1 .
```
When x p = 0, P1 and P2 are collocated. The half plane {(x P , x E , y E ) | x P =
```
```
0, y E ≥ 0} ⊂ R1 ∪ R2 .
```
3.2.2 Game in R1,2
```
If the state is in R1,2 = {(x P , x E , y E ) | −μx P ≤ x E ≤ μx P , x P ≥ 0, y E ≥ 0} E will
```
be isochronously captured by the P1 & P2 team. Since P1 P2 I in Fig. 3 is isosceles,
```
the aim point I = (0, y) is obtained upon setting x = 0 in Eqs. (6) or (7), which yields
```
a quadratic equation in y. The discriminant of the quadratic equation is positive i f f
```
the Apollonius circles C1 and C2 intersect, which is the case i f f condition (8) holds
```
and is certainly the case if −μx P ≤ x E ≤ μx P , whereupon
```
y = 11 − μ2 [y E + sign(y E )
```
√
```
μ2 y2E + (1 − μ2)(μ2 x2P − x2E )],
```
where the function
```
sign(x) ≡
```
⎧
⎨
⎩
1 i f x > 0
0 i f x = 0
−1 i f x < 0
so
```
y I = 11 − μ2 [y E + sign(y E )
```
√
```
μ2 y2E + (1 − μ2)(μ2 x2P − x2E )]. (11)
```
Using the geometric method, the players’ optimal state feedback strategies in R1,2
are explicitly given by
40 M. Pachter
sin ψ∗ = y I√
x2P + y2I
, cos ψ∗ = x P√
x2P + y2I
```
(12)
```
sin χ∗ = y I√
x2P + y2I
, cos χ∗ = − x P√
x2P + y2I
```
(13)
```
sin φ∗ = y I − y E√
```
(y I − y E )2 + x2E
```
, cos φ∗ = − x E√
```
(y I − y E )2 + x2E
```
```
(14)
```
and the time-to-capture/Value function is
```
V (x P , x E , y E ) =
```
√
```
x2P + y2I , (15)
```
```
where the function y I (x P , x E , y E ) is given by Eq. (11).
```
```
When the initial state (x P0 , x E0 , y E0 ) ∈ R1,2 and P1 , P2 and E play optimally, the
```
closed- loop dynamics are
```
˙x P = − (1 − μ
```
```
2)x P
```
√
```
(1 − μ2)(x2P − x2E ) + (1 + μ2)y2E + 2y E
```
√
```
μ2 y2E + (1 − μ2)(μ2 x2P − x2E )
```
,
```
x P (0) = x P0
```
```
˙x E = − (1 − μ
```
```
2)x E
```
√
```
(1 − μ2)(x2P − x2E ) + (1 + μ2)y2E + 2y E
```
√
```
μ2 y2E + (1 − μ2)(μ2 x2P − x2E )
```
,
```
x E (0) = x E0
```
```
(16)
```
```
˙y E = − (1 − μ
```
```
2)y E
```
√
```
(1 − μ2)(x2P − x2E ) + (1 + μ2)y2E + 2y E
```
√
```
μ2 y2E + (1 − μ2)(μ2 x2P − x2E )
```
,
```
y E (0) = y E0 , 0 ≤ t.
```
```
The solution of the system (16) of strongly nonlinear differential equations is simply
```
```
x P (t) = (1 − tt f)x P0
```
```
x E (t) = (1 − tt f)x E0 (17)
```
```
y E (t) = (1 − tt f)y E0 , 0 ≤ t ≤ t f ,
```
where
Isaacs’ Two-on-One Pursuit-Evasion Game 41
t f = 11 − μ2
√
```
(1 − μ2)(x2P0 − x2E0 ) + (1 + μ2)y2E0 + 2y E
```
√
```
μ2 y2E0 + (1 − μ2)(μ2 x2P0 − x2E0 ).
```
```
(18)
```
```
Inserting Eqs. (17) into Eqs. (12)–(14) we obtain the players’ constant headings in both the (x, y)
```
```
and (X, Y ) frames
```
sin ψ∗ =
y E0 +
√
```
μ2 y2E0 + (1 − μ2)(μ2 x2P0 − x2E0 )
```
√
```
(1 − μ2)(x2P0 − x2E0 ) + (1 + μ2)y2E0 + 2y E0
```
√
```
μ2 y2E0 + (1 − μ2)(μ2 x2P0 − x2E0 )
```
```
cos ψ∗ = (1 − μ
```
```
2)x P0
```
√
```
(1 − μ2)(x2P0 − x2E0 ) + (1 + μ2)y2E0 + 2y E0
```
√
```
μ2 y2E0 + (1 − μ2)(μ2 x2P0 − x2E0 )
```
```
χ∗ = π − ψ∗ (19)
```
sin φ∗ = 1μ
μ2 y E0 +
√
```
μ2 y2E0 + (1 − μ2)(μ2 x2P0 − x2E0 )
```
√
```
(1 − μ2)(x2P0 − x2E0 ) + (1 + μ2)y2E0 + 2y E0
```
√
```
μ2 y2E0 + (1 − μ2)(μ2 x2P0 − x2E0 )
```
```
cos φ∗ = − 1μ(1 − μ
```
```
2)x E0
```
√
```
(1 − μ2)(x2P0 − x2E0 ) + (1 + μ2)y2E0 + 2y E0
```
√
```
μ2 y2E0 + (1 − μ2)(μ2 x2P0 − x2E0 )
```
.
```
The initial state (x P0 , x E0 , y E0 ) can momentarily be viewed as the current state and
```
```
as such, Eq. (19) are explicit state feedback “optimal” strategies, as provided by the
```
```
geometric method; the attendant Value function is given in Eq. (18).
```
When the geometric method is applied and P1 and P2 play “optimally”, from Eq.
```
(19) we deduce that in the (x, y) frame the headings of P1 and P2 are mirror images of
```
```
each other: χ∗ = π − ψ∗. Therefore, the (x, y) frame does not rotate and the players’
```
```
headings are constant also in the (inertial) (X, Y ) frame of the realistic plane. Hence,
```
in the realistic plane, the “optimal” trajectories are straight lines. Since initially the
```
rotating (x, y) frame is aligned with the (X, Y ) frame of the realistic plane, the y-axis
```
stays aligned with the Y-axis while the x-axis stays parallel to the X-axis moving
in the upward direction at a constant speed. Therefore the “optimal” trajectories
```
are also straight lines in the (x, y) frame. Thus, when the state feedback strategies
```
```
(19) synthesized using the geometric method are applied, the closed- loop system’s
```
“optimal” flow field in the R1,2 region of the reduced state space consists of the
```
family of straight line trajectories (17) which converge at the origin. Moreover, this
```
flow field, which was produced by the geometric method, covers the R1,2 region of
the reduced state space—this, by construction.
At this juncture it is important to recognize that in truth, the herein discussed
geometric method only yielded the solution of a related open- loop max- min optimal
control [6] problem, not the solution of the differential game we are after: The
```
optimal control problem solved so far for initial states (x P0 , x E0 , y E0 ) ∈ R1,2 is one
```
where a discriminated evader/ship is obliged to preannounce his control time history,
knowing that the pursuers/cutters will then chose a course of action s.t. his time—
42 M. Pachter
```
to—capture will be minimized; whereupon the evader will set his course so that the
```
```
time-to-capture is maximized; at best, a lower bound of the Value of the game has
```
```
been obtained; the optimality of the geometrically derived state feedback strategies
```
```
(19) has yet to be proved.
```
4 Isaacs’ Method
We now embark on applying Isaacs’ method for the systematic solution of differential
games to the Two Cutters and Fugitive Ship differential game. Following in Isaacs’
footsteps, we solve the Two Cutters and Fugitive Ship differential game in the three-
```
dimensional reduced state space R31 = {(x P , x E , y E ) | x P ≥ 0, y E ≥ 0}. In the R1
```
and R2 regions of the reduced state space only one pursuer is active and the game is
```
trivial: Optimal play entails classical PP and pure evasion; the optimal flow field in
```
the R1 and R2 regions of the reduced state space is provided in Sect. 3.2.1. The more
interesting game takes place in the R1,2 region of the reduced state space where under
optimal play both pursuers cooperatively and isochronously capture the evader. The
objective is to rigorously justify the geometric method in the R1,2 region of the state
```
space, that is, validate the tentatively optimal state feedback strategies (19) of the
```
```
pursuers and the evader and the differential game’s Value function (18) presented in
```
Sect. 3.2.2. Due to symmetry, we confine our attention to the part of R1,2 which is in
the positive orthant R3+. Isaacs’ method entails Dynamic Programming. We dutifully
start from the “end”.
The Two Cutters and Fugitive Ship differential game is played in R31 , the first
```
quadrant of the three-dimensional state space (x P , x E , y E ). In a three- dimensional
```
state space a proper terminal manifold must be a two-dimensional manifold—one
cannot really talk about point capture. Hence, we momentarily endow the pursuers
with circular capture sets of radius l and in due course we’ll let l → 0. Thus, the
terminal manifold in the reduced R31 state space is
```
T = {(x P , x E , y E ) | (x P − x E )2 + y2E = l2, x P ≥ 0, x E ≥ 0, y E ≥ 0}
```
```
∪{(x P , x E , y E ) | (x P + x E )2 + y2E = l2, x P ≥ 0, x E ≤ 0, y E ≥ 0}
```
The two- dimensional terminal manifold T is not smooth—it is not differentiable
```
in the quarter plane {(x P , x E , y E ) | x P ≥ 0, x E = 0, y E ≥ 0} ⊂ R1,2 . In general, at
```
points where a manifold is not smooth a normal to the surface might not exist, or, a
normal to the surface is not unique. When a normal to the surface is not unique, this
implies that multiple optimal trajectories will terminate at this point and in doing
so, cover a swath of the state space. The locus where the terminal manifold is not
differentiable is in the region of interest — it is in the R1,2 subset of the R31 state
space. In R1,2 —see Fig. 10—the terminal manifold is
```
T = {(x P , x E , y E ) | x2P + y2E = l2, x P ≥ 0, x E = 0, y E ≥ 0}.
```
Isaacs’ Two-on-One Pursuit-Evasion Game 43
It is a quarter circle in the plane x E = 0. Although we have eschewed point capture
and have taken the physically sound step of allowing for finite capture sets, the
terminal manifold T in the R1,2 region of the state space is of dimension one and not
of dimension two, as “required”—this being a manifestation of the fact that the two-
dimensional terminal manifold in the R31 state space of the Two Cutters and Fugitive
Ship differential game is not smooth. The terminal manifold in the R1,2 region of
the state space is “rank deficient” and it resides on the boundary of R1,2 . In the R1,2
region of the state space the optimal flow field is s.t. multiple optimal trajectories
will terminate at the same point on the quarter circle terminal manifold illustrated in
Fig. 10.
When solving the differential game, we are exclusively interested in the inward
pointing normals n to the terminal “surface” T because they set the terminal condi-
tions of the costate vector. But although the problem formulation is physically sound,
our terminal “surface” in R1,2 , T , is “rank deficient”: It is a circular arc in the plane
x E = 0 which we now parameterize as follows.
```
T = {(x P , x E , y E ) | x P = l cos ξ, x E = 0, y E = l sin ξ, 0 ≤ ξ ≤ π2 }. (20)
```
Because the terminal manifold is rank deficient, the normals to the terminal “surface”
```
at a point of the “surface” are not unique. From Eq. (20) we extract the information
```
pertinent to the terminal costates in the part of R1,2 which is in the positive orthant
R3+ of the state space where x E > 0:
```
λ(t f ) = −a
```
⎛
⎝
cos ξ
b
sin ξ,
⎞
⎠
```
where 0 ≤ ξ ≤ π2 and the scalars a > 0, b < 0; in the half of R1,2 which is not in the
```
positive orthant, b > 0 and in the plane x E = 0, b = 0. As far as the terminal costate
is concerned, the stipulated size l of the pursuers’ capture set plays no role here. This
is good because down the road we’ll be exclusively interested in point capture, that
is, l → 0.
The Hamiltonian
```
H = −1 + 12 λx P (cos χ − cos ψ) + λx E [μ cos φ − 12 (cos χ + cos ψ) + 12y Ex P(sin χ − sin ψ)]
```
```
+λy E [μ sin φ − 12 (sin χ + sin ψ) − 12x Ex P(sin χ − sin ψ)]
```
```
= −1 − 12 [(λy E + y E λx E − x E λy Ex P) sin ψ + (λx E + λx P ) cos ψ
```
```
+(λy E − y E λx E − x E λy Ex P) sin χ + (λx E − λx P ) cos χ] + μ(λy E sin φ + λx E cos φ). (21)
```
The costate vector λ is related to the partial derivatives of the Value function
```
V (x P , x E , y E ): λx P = −Vx P , λx E = −Vx E and λy E = −V y E . Maximizing the Hamil-
```
44 M. Pachter
tonian in χ and ψ and minimizing the Hamiltonian in φ yields the following char-
acterization of the optimal controls.
sin χ∗ =
y E λxE −x E λyEx
P − λy E√
```
(λx E − λx P )2 + (λy E − y E λxE −x E λyEx P )2
```
, cos χ∗ = λx P − λx E√
```
(λx E − λx P )2 + (λy E − y E λxE −x E λyEx P )2
```
```
(22)
```
sin ψ∗ =
x E λyE −y E λxEx
P − λy E√
```
(λx E + λx P )2 + (λy E + y E λxE −x E λyEx P )2
```
```
, cos ψ∗ = −(λx E + λx P )√
```
```
(λx E + λx P )2 + (λy E + y E λxE −x E λyEx P )2
```
```
(23)
```
sin φ∗ = − λy E√
λ2x E + λ2y E
, cos φ∗ = − λx E√
λ2x E + λ2y E
```
. (24)
```
In the part of R1,2 which is in the positive orthant R3+ where x E > 0, the attendant
costate equations are
˙λx P = 1
2
y E λx E − x E λy E
```
x2P(sin χ
```
```
∗ − sin ψ∗), λx P (t f ) = −a cos ξ
```
˙λx E = 1
2
λy E
```
x P(sin χ
```
```
∗ − sin ψ∗), λx E (t f ) = −ab (25)
```
˙λy E = − 1
2
λx E
```
x P(sin χ
```
```
∗ − sin ψ∗), λy E (t f ) = −a sin ξ,
```
```
where 0 ≤ ξ ≤ π2 ; the scalars a > 0, b < 0.
```
```
Insert the controls (22)–(24) into the dynamics equations (3)–(5) and into the
```
```
costate equations (25) and obtain the Euler-Lagrange/characteristics’ equations, a
```
set of six nonlinear differential equations in the variables x P , x E , y E , λx P , λx E , λy E .
˙x P = 12 [ λx P − λx E√
```
(λx E − λx P )2 + (λy E − y E λxE −x E λyEx P )2
```
- (λx E + λx P )√
```
(λx E + λx P )2 + (λy E + y E λxE −x E λyEx P )2
```
```
], x P (0) = x P0
```
˙x E = −μ λx E√
λ2x E + λ2y E
− 12 [ λx P − λx E√
```
(λx E − λx P )2 + (λy E − y E λxE −x E λyEx P )2
```
```
− (λx E + λx P )√
```
```
(λx E + λx P )2 + (λy E + y E λxE −x E λyEx P )2
```
]
Isaacs’ Two-on-One Pursuit-Evasion Game 45
- 12y Ex
P
[
y E λxE −x E λyE
x P − λy E√
```
(λx E − λx P )2 + (λy E − y E λxE −x E λyEx P )2
```
−
x E λyE −y E λxE
x P − λy E√
```
(λx E + λx P )2 + (λy E + y E λxE −x E λyEx P )2
```
```
], x E (0) = x E0
```
˙y E = −μ λy E√
λ2x E + λ2y E
− 12 [
y E λxE −x E λyE
x P − λy E√
```
(λx E − λx P )2 + (λy E − y E λxE −x E λyEx P )2
```
+
x E λyE −y E λxE
x P − λy E√
```
(λx E + λx P )2 + (λy E + y E λxE −x E λyEx P )2
```
]
− 12x Ex
P
[
y E λxE −x E λyE
x P − λy E√
```
(λx E − λx P )2 + (λy E − y E λxE −x E λyEx P )2
```
−
x E λyE −y E λxE
x P − λy E√
```
(λx E + λx P )2 + (λy E + y E λxE −x E λyEx P )2
```
```
], y E (0) = y E0
```
˙λx P = 1
2
y E λx E − x E λy E
x2P[
y E λxE −x E λyE
x P − λy E√
```
(λx E − λx P )2 + (λy E − y E λxE −x E λyEx P )2
```
−
x E λyE −y E λxE
x P − λy E√
```
(λx E + λx P )2 + (λy E + y E λxE −x E λyEx P )2
```
```
], λx P (t f ) = −a cos ξ
```
˙λx E = 1
2
λy E
x P[
y E λxE −x E λyE
x P − λy E√
```
(λx E − λx P )2 + (λy E − y E λxE −x E λyEx P )2
```
−
x E λyE −y E λxE
x P − λy E√
```
(λx E + λx P )2 + (λy E + y E λxE −x E λyEx P )2
```
```
], λx E (t f ) = −ab
```
46 M. Pachter
˙λy E = 1
2
λx E
x P[
x E λyE −y E λxE
x P − λy E√
```
(λx E + λx P )2 + (λy E + y E λxE −x E λyEx P )2
```
−
y E λxE −x E λyE
x P − λy E√
```
(λx E − λx P )2 + (λy E − y E λxE −x E λyEx P )2
```
```
], λx E (t f ) = −a sin ξ
```
Evidently, the parameters 0 ≤ ξ ≤ π2 , a > 0 and b will feature in the solution of the
Euler-Lagrange equations. The above equations yield a family of optimal trajecto-
ries/characteristics parameterized by the two independent parameters b and ξ , and
as such, can fill our three- dimensional state space region R1,2 .
```
In addition, inserting Eqs. (22)–(24) into the Hamiltonian (21) yields the optimal
```
smooth Hamiltonian
```
H = −1 + 12 [
```
√
```
(λx E − λx P )2 + (λy E − y E λx E − x E λy Ex
```
P
```
)2
```
+
√
```
(λx E + λx P )2 + (λy E + y E λx E − x E λy Ex
```
P
```
)2 ] − μ
```
√
λ2x E + λ2y E .
The Hamiltonian vanishes and evaluating the optimal Hamiltonian at t = t f allows
us to express the parameter a as a function of the parameters b and ξ :
1 = 12 [
√
```
a2(b − cos ξ )2 + (−a sin ξ − −abl sin ξl cos ξ )2 +
```
√
```
a2(b + cos ξ )2 + (−a sin ξ + −abl sin ξl cos ξ )2]
```
```
− μ√a2(b + sin ξ )2
```
= 12 a 1cos ξ [
√
```
(b − cos ξ )2 cos 2 ξ + (b − cos ξ )2 sin 2 ξ +
```
√
```
(b + cos ξ )2 cos 2 ξ + (b + cos ξ )2 sin 2 ξ ]
```
− μa | b + sin ξ | .
Hence
```
a = cos ξ1
```
```
2 (| b − cos ξ | + | b + cos ξ |) − μ | b + sin ξ | cos ξ
```
```
. (26)
```
```
In view of the relationship (26), the Euler-Lagrange equations are ultimately param-
```
```
eterized by 0 ≤ ξ ≤ π2 and b; the parameter a won’t feature in what follows.
```
```
Note that in the half plane of symmetry {(x P , x E , y E ) | x P ≥ 0, x E = 0}, b = 0,
```
so the smoothness of the Value function is retained under passage from the side of
R1,2 where x E > 0 and b < 0 to the side of R1,2 where x E < 0 and b > 0.
Isaacs’ method mandates that the Euler-Lagrange equations be integrated in ret-
rograde fashion “starting” out from the “initial” condition x P = 0, x E = 0, y E = 0,
λx P = −a cos ξ , λx E = −ab, λy E = −a sin ξ . One will obtain a family of optimal
```
trajectories (x P (·), x E (·), y E (·)) ∈ R1,2 ⊂ R31 parameterized by 0 ≤ ξ ≤ π2 and b,
```
which potentially covers the state space region R1,2 . At this point it would seem that
Isaacs’ Two-on-One Pursuit-Evasion Game 47
numerical integration is required. However, with the benefit of hindsight, the solution
of the Euler-Lagrange equations is embodied in the family of “optimal” trajectories
```
specified by Eq. (17) which, by construction, covers the state space region R1,2 : We
```
```
shall show that the trajectories (17) provided by the geometric method are in fact
```
the solution of the Euler-Lagrange equations. This will allow us to finally dispose of
the quotation marks when referring to the optimality of the state feedback strategies
```
(19) and the attendant Value function (18).
```
The proof proceeds as follows. We make the Ansatz that the family of trajectories
```
(17) which cover the state space region R1,2 and were generated by the geometric
```
method are the optimal trajectories, and we will show that:
```
∀ (x P0 , x E0 , y E0 ) ∈ R1,2 , ∃ “initial” costates 0 ≤ ξ ≤ π2 and b s.t. the Euler-
```
Lagrange equations are satisfied. Furthermore, the argument is reversible.
First, note that the following holds.
```
Proposition 3 If the state’s time history is given by Eq. (17), the players’ headings
```
are constant and moreover, the headings of the pursuers P1 and P2 satisfy
χ = π − ψ
```
Proof See Eq. (19).
```
```
We now turn our attention to Eqs. (3)–(5) and (22)–(25).
```
1. Applying Proposition 4 to the costate equations (25) yields
```
˙λx P = 0, λx P (t f ) = −a cos ξ
```
```
˙λx E = 0, λx E (t f ) = −ab
```
```
˙λy E = 0, λy E (t f ) = −a sin ξ
```
wherefrom we immediately deduce that the costate vector λ is constant:
```
λ(t) = −a
```
⎛
⎝
cos ξ
b
sin ξ
⎞
⎠ , ∀ 0 ≤ t ≤ t f
According to the Ansatz, during optimal play the state’s time history is given by Eq.
```
(17), and consequently, the costate’s constant components are
```
λx P = −a cos ξ, λx E = −ab, λy E = −a sin ξ.,
```
We now turn to the optimal control equations. From Eq. (24) we deduce that given
```
the parameters b and ξ , the optimal control φ∗ of the Evader is constant and
sin φ∗ = sin ξ√
b2 + sin 2 ξ
, cos φ∗ = b√
b2 + sin 2 ξ
.
48 M. Pachter
```
And because in view of Proposition 4 the (x, y) frame is not rotating, the optimal
```
```
course of the Evader is constant, so in the realistic plane (X, Y ) the path of the
```
Evader is a straight line. During optimal play E holds course, which is tantamount
to E deciding on his course at the initial time t = 0. Hence, it stands to reason that
without incurring a loss in optimality, also P1 and P2 can chose their course at time
```
t = 0. That this is indeed so follows from the following argument.
```
```
From Eq. (23) we deduce that given the parameters b and ξ , the optimal control
```
```
ψ∗(t) of P2 is specified as follows.
```
```
sin ψ∗ =(1 −
```
xEx
```
P ) sin ξ + b
```
yEx
P√
```
(b + cos ξ )2 + [(1 − xEx P ) sin ξ + b yEx P ]2 , cos ψ
```
∗ = b + cos ξ√
```
(b + cos ξ )2 + [(1 − xEx P ) sin ξ + b yEx P ]2 .
```
```
(27)
```
```
Now, since l = 0, if the family of optimal trajectories is indeed specified by Eq. (17),
```
```
the state component ratios featuring in Eq. (27) are constant:
```
```
x E (t)
```
```
x P (t) =
```
x E0
x P0,
```
y E (t)
```
```
x P (t) =
```
y E0
x P0.
```
In view of Eq. (27) we conclude that the optimal control ψ∗ of P2 is constant.
```
This, being the case, we evaluate the optimal control of P2 at time t f where
```
(x P , x E , y E ) |t f = (l cos ξ, 0, l sin ξ ). The state component ratios at t = t f are
```
x E
x P|t f = 0,
y E
```
x P|t f = tan ξ, ∀ l ≥ 0 (28)
```
```
Inserting Eq. (28) into Eq. (27) we calculate
```
```
sin(ψ∗(t f )) = sin ξ, cos(ψ∗(t f )) = cos ξ,
```
that is,
```
ψ∗(t f ) = ξ.
```
Hence, given the parameters b and ξ , if indeed, according to the Ansatz, the family
```
of optimal trajectories is given by Eq. (17), the constant headings of the pursuers P1
```
and P2 are
χ∗ ≡ π − ξ, ψ∗ ≡ ξ.
2. Applying Proposition 4 to the dynamics Eqs. (3)–(5) yields
˙x P = − cos ψ∗
˙x E = μ cos φ∗
˙y E = μ sin φ∗ − sin ψ∗
Isaacs’ Two-on-One Pursuit-Evasion Game 49
and inserting therein the parameterized by b and ξ optimal controls χ∗, ψ∗ and φ∗,
we obtain
```
˙x P = − cos ξ, x P (0) = x P0
```
˙x E = μ b√
b2 + sin 2 ξ
```
, x E (0) = x E0
```
˙y E = μ sin ξ√
b2 + sin 2 ξ
```
− sin ξ, y E (0) = y E0 .
```
Integrating the above differential equations in retrograde fashion and recalling that
the trajectories terminate at the origin, we calculate
```
x P0 = cos ξ · t f (29)
```
x E0 = −μ b√
b2 + sin 2 ξ
```
· t f (30)
```
```
y E0 = (1 − μ 1√
```
b2 + sin 2 ξ
```
) sin ξ · t f (31)
```
Note Because y E0 ≥ 0, the parameters b and ξ we are after must satisfy b2 + sin 2 ξ ≥
μ2 . That this is so will become apparent in the sequel.
To complete the proof it behooves on us to show that
```
∀ (x P0 , x E0 , y E0 ) ∈ R1,2 , ∃ b, 0 < ξ < π2 and t f > 0 s.t. Eqs. (29)–(31) hold—we
```
```
must be able to solve the three Eqs. (29)–(31) in the three unknowns b, ξ and t f .
```
We first remove t f from further consideration and, provided b  = 0, obtain two
equations in the two unknowns b and ξ :
x P0
x E0= −
√
b2 + sin 2 ξ
```
μb cos ξ (32)
```
y E0
```
x P0= (1 −
```
μ√
b2 + sin 2 ξ
```
) tan ξ. (33)
```
```
We use Eq. (32) to express b as a function of ξ ,
```
```
b = − sin ξ cos ξ√
```
```
μ2( x P0x E0)2 − cos 2 ξ
```
```
sign(x E0 ).
```
```
Note: In the R1,2 region of the state space | x E0 |≤ μx P0 , so the expression under the
```
square root is positive. Also, in the positive orthant, where x E0 > 0,
```
b = − sin ξ cos ξ√
```
```
μ2( x P0x E0)2 − cos 2 ξ
```
```
. (34)
```
50 M. Pachter
We also calculate
√
b2 + sin 2 ξ =
```
μ( x P0x E0) sin ξ
```
√
```
μ2( x P0x E0)2 − cos 2 ξ
```
```
. (35)
```
```
We insert the expression (35) into Eq. (33) and obtain the equation in ξ
```
y E0
x P0= [1 −
√
```
μ2( x P0x E0)2 − cos 2 ξ
```
```
( x P0x E0) sin ξ ] tan ξ
```
which yields
y E0 cos ξ = x P0 sin ξ −
√
```
μ2 x2P0 − x2E0 cos 2 ξ . (36)
```
Note that in the R1,2 region of the state space the expression under the square root is
positive.
```
Concerning the existence of a solution of Eq. (36), considers the function
```
```
f (ξ ) ≡ y E0 cos ξ − x P0 sin ξ +
```
√
μ2 x2P0 − x2E0 cos 2 ξ , 0 ≤ ξ ≤ π2 .
We calculate
```
f (0) = y E0 +
```
√
```
μ2 x2P0 − x2E0 > 0, f ( π2 ) = −(1 − μ)x P0 < 0.
```
```
Hence, ∃ 0 < ξ < π2 s.t. f (ξ ) = 0. Solving Eq. (36) analytically boils down to the
```
solution of a quadratic equation. Let
x ≡ cos 2 ξ.
We obtain the quadratic equation in x
```
(x4P0 + x4E0 + y4E0 + 2x2E0 y2E0 + 2x2P0 y2E0 − 2x2P0 x2E0 )x2 − 2x2P0 [(1 − μ2)(x2P0 − x2E0 )
```
```
. + (1 + μ2)y2E0 ]x + (1 − μ2)2 x4P0 = 0.
```
The discriminant of the quadratic equation
```
= 4x4P0 y2E0 [μ2 x2P0 − x2E0 + μ2(x2E0 + y2E0 )].
```
In the state space region R1,2 , | x E0 |< μx P0 , and therefore the discriminant > 0.
Thus, the quadratic equation has two real roots. Furthermore, consider the quadratic
Isaacs’ Two-on-One Pursuit-Evasion Game 51
polynomial
```
g(x) ≡ (x4P0 + x4E0 + y4E0 + 2x2E0 y2E0 + 2x2P0 y2E0 − 2x2P0 x2E0 )x2
```
```
−2x2P0 [(1 − μ2)(x2P0 − x2E0 ) + (1 + μ2)y2E0 ]x + (1 − μ2)2 x4P0 .
```
```
We calculate g(0) = (1 − μ2)2 x4P0 > 0 and g(1) = (μ2 x2P0 − x2E0 − y2E0 )2 > 0,
```
wherefrom we conclude that the roots of the quadratic equation satisfy 0 < x < 1,
as required. The solution of the quadratic equation is
```
x = x2P0
```
```
(1 − μ2)(x2P0 − x2E0 ) + (1 + μ2)y2E0 + 2y E0
```
√
```
μ2(x2P0 + y2E0 ) − (1 − μ2)x2E0
```
x4P0 + x4E0 + y4E0 + 2x2E0 y2E0 + 2x2P0 y2E0 − 2x2P0 x2E0
and
```
ξ = Arccos(√x).
```
```
Finally, from Eq. (34),
```
```
b = −
```
√√
```
√√ (1 − x)x
```
```
μ2( x P0x E0)2 − x sign(x E ).
```
Next, consider the case where the parameter b = 0. The parameter b = 0 generates
the optimal flow field in the plane of symmetry, that is, the plane x E = 0. Now b = 0
```
and Eqs. (29) and (31) yield
```
x P0 = cos ξ · t f
```
y E0 = (sin ξ − μ) · t f .
```
We have two equations in the two unknowns ξ and t f .
```
Proposition 4 ∀ x P > 0 and x E > 0, ∃ ξ > Arcsin(μ) and t f > 0 which satisfy
```
the two equations from above.
Proof We first eliminate t f and calculate ξ as follows.
y E0
x P0=
sin ξ − μ
cos ξ
and we obtain the quadratic equation in cos ξ ,
```
(x2P0 + y2E0 ) cos 2 ξ + 2μx P0 y E0 cos ξ − (1 − μ2)x2P0 = 0
```
whereupon
52 M. Pachter
sin ξ =
μ + y E0x P0
√
```
1 − μ2 + ( y E0x P0)2
```
```
1 + ( y E0x P0)2 , cos ξ =
```
√
```
1 − μ2 + ( y E0x P0)2 − μ y E0x P0
```
```
1 + ( y E0x P0)2
```
and sin ξ > μ because
μ + y E0x
P0
√
```
1 − μ2 + ( y E0x
```
P0
```
)2 > μ + μ( y E0x
```
P0
```
)2
```
because
√
```
1 − μ2 + ( y E0x
```
P0
```
)2 > μ y E0x
```
P0
because
```
1 − μ2 > (μ2 − 1)( y E0x
```
P0
```
)2
```
because
```
1 > −( y E0x
```
P0
```
)2.
```
Thus, the following holds.
Theorem 5 The Two Cutters and Fugitive Ship differential game’s solution is
```
presented in the three-dimensional reduced state space {(x P , x E , y E ) | x P ≥ 0}
```
```
where there are two half planes of symmetry, {(x P , x E , y E ) | x P ≥ 0, y E = 0} and
```
```
{(x P , x E , y E ) | x P ≥ 0, x E = 0}. Hence, it is sufficient to confine one’s attention to
```
the positive orthant of the reduced state space. In the state space region R1,2 where
both Pursuers P1 and P2 actively engage the Evader and which is in the positive
```
orthant, the players’ optimal state feedback strategies are derived from Eqs. (19),
```
that is,
sin ψ∗ = y E +
√
```
μ2 y2E + (1 − μ2)(μ2 x2P − x2E )√
```
```
(1 − μ2)(x2P − x2E ) + (1 + μ2)y2E + 2y E
```
√
```
μ2 y2E + (1 − μ2)(μ2 x2P − x2E )
```
```
cos ψ∗ = (1 − μ
```
```
2)x P
```
√
```
(1 − μ2)(x2P − x2E ) + (1 + μ2)y2E + 2y E
```
√
```
μ2 y2E + (1 − μ2)(μ2 x2P − x2E )
```
χ∗ = π − ψ∗
sin φ∗ = 1μμ
```
2 y E +√μ2 y2E + (1 − μ2)(μ2 x2P − x2E )
```
√
```
(1 − μ2)(x2P − x2E ) + (1 + μ2)y2E + 2y E
```
√
```
μ2 y2E + (1 − μ2)(μ2 x2P − x2E )
```
Isaacs’ Two-on-One Pursuit-Evasion Game 53
```
cos φ∗ = − 1μ(1 − μ
```
```
2)x E
```
√
```
(1 − μ2)(x2P − x2E ) + (1 + μ2)y2E + 2y E
```
√
```
μ2 y2E + (1 − μ2)(μ2 x2P − x2E )
```
```
and the Value function, derived from Eq. (18), is
```
```
V (x P , x E , y E ) = 11 − μ2
```
√
```
(1 − μ2)(x2P − x2E ) + (1 + μ2)y2E + 2y E
```
√
```
μ2 y2E + (1 − μ2)(μ2 x2P − x2E ) .
```
The field of primary optimal trajectories covers the entire state space and the Value
```
function is C1, except on the half plane of symmetry {(x P , x E , y E ) | x P ≥ 0, y E = 0}
```
```
which is a dispersal surface; no additional singular surfaces are present. The field of
```
```
optimal trajectories is symmetric about the half planes {(x P , x E , y E ) | x P ≥ 0, y E =
```
```
0} and {(x P , x E , y E ) | x P ≥ 0, x E = 0} and the optimal trajectories in the half plane
```
```
{(x P , x E , y E ) | x P ≥ 0, x E = 0} stay there all along. The geometric method yields
```
the correct solution of the differential game.
Similar to the quadratic cost Ansatz used in the solution of the Linear-Quadratic
```
Differential Game, the Ansatz artifice used herein concerning the trajectories (17)
```
is a self fulfilling prophesy. The geometric method yields the correct solution and
one has avoided the need to numerically integrate the Euler-Lagrange system of
nonlinear differential equations arising when Isaacs’ method is dogmatically applied
to the Two Cutters and Fugitive Ship differential game.
In summary, only when we have a complete set of optimal trajectories f illing
a capture region separated from the escape region by a closed barrier, or possibly,
the region of capturability is the whole state space—this, as specified by the solution
of the Game of Kind—has a differential game been solved. There are only a few
3-D pursuit-evasion differential games solved, none in a higher dimension. Games
in 3-D with no singular surfaces, at least, for a range of parameters and still an
acceptable model of conflict situations of interest so that their relevance is preserved,
are instances where interesting pursuit-evasion differential games in 3-D have been
solved. We refer to the Two Cutters and Fugitive Ship Differential Game, the Dif-
ferential Game of Guarding a Target [7], and the Active Target Defense Differential
Game [8]. The secret sauce is provided by the following.
Theorem 6 The solution of zero-sum differential games by solving the max min
open-loop optimal control problem using the two sided Pontryagin Maximum Prin-
ciple and synthesizing the players’ state feedback optimal strategies in receding
horizon optimal control fashion is valid if and only if the application of Isaacs’
method results in primary optimal trajectories only, a.k.a., regular characteristics,
which cover the capture zone. The optimal flow field must cover the entire capture
zone which was provided by the solution of the Game of Kind, so there is no need for
singular surfaces, except a dispersal surface.
When this is the case and the players have simple motion the geometric method
applies. This is the reason why in the Two Cutters and Fugitive Ship differential game
the geometric method is applicable and therefore the correctness of Isaacs’ solution
54 M. Pachter
has been proved. In this paper, we have proven that the application of Isaacs’ method
yields an optimal flow field which covers the reduced 3-D state space. Having the
geometric solution facilitated the proof.
5 Conclusion and Extensions
In this paper Isaacs’ Two Cutters and Fugitive Ship differential game has been revis-
ited. The solution of the Game of Kind is provided, that is, the state space regions
where under optimal play just one of the pursuers captures the evader, and also the
state space region where both pursuers cooperatively capture the target, have been
characterized. The solution of the Game of Degree has been obtained using Isaacs’
method. Thus, the elegant geometric solution provided by Isaacs is now fully jus-
tified. As it so often happens in differential games, the doctrinaire employment of
Isaacs’ method towards the solution of even the “simple” Two Cutters and Fugi-
tive Ship differential game was not devoid of complexity. However, the intuition
provided by the heuristic geometric approach, and also visualizing the game in the
realistic plane, are instrumental in facilitating the solution process. The Two Cutters
and Fugitive Ship is an interesting differential game where the optimal flow field
consists of regular trajectories only. The Value function is C1 , except on a half plane
which is a dispersal surface, and there are no additional singular surfaces.
Concerning extensions, the cutters’ speed need not be equal, provided that it
is higher than the speed of the fugitive ship. Furthermore, it is interesting to also
consider the case where the speed of just one of the two cutters, say P1 , is higher
than the speed of the fugitive ship while the speed of P2 is equal to the speed of the
fugitive ship. In this case, upon employing the now validated geometric method, the
Apollonius circle which is based on E and P2 devolves into the orthogonal bisector
of the segment E P2 . It makes sense to also stipulate that the cutters P1 and P2
are endowed with circular capture sets with radii l1 > 0 and l2 > 0 respectively. In
this case, the elegant Apollonius circles will be replaced by Cartesian ovals and the
boundary separating the R1 , R2 , and R1,2 regions of the state space won’t be planar
and will be replaced by a more complex surface as illustrated in Fig. 11.
Isaacs’ Two-on-One Pursuit-Evasion Game 55
Fig. 11 Positive orthant,
l > 0
References
1. R. Isaacs: “Differential Games: A Mathematical Theory with Applications Warfare and Pursuit,
Control and Optimization”, Wiley 1965, pp. 148-149.
2. Hugo Steinhaus: “Definitions for a Theory of Games of Pursuit”, Naval Research Logistics
Quarterly, Vol. 7, No 2, pp. 105-108, 1960.
3. E. Garcia, Z. Fuchs, D. Milutinovic, D. Casbeer, and M. Pachter: “A Geometric Approach for
the Cooperative Two-Pursuers One-Evader Differential Game”, Proceedings of the 20th World
Congress of IFAC, Toulouse, France, pp. 15774-15779, July 9-14, 2017.
4. S. I. Tarlinskii: “On a Linear Game of Convergence of Several Controlled Objects”, Soviet Math.
Dokl., Vol. 17, No. 5, 1976, pp. 1354-1358.
5. P. Wasz, M. Pachter and K. Pham: “Two-On-One Pursuit with a Non-Zero Capture Radius”,
Proceedings of the Mediterranean Control Conference, Akko, Israel, July 1-4, 2019.
6. L. S. Pontryagin, V. G. Boltyanskii, R. V. Gamkrelidze, E.F. Mishchenko: “The Mathematical
Theory of Optimal Processes”, Interscience, 1962, New York, Chapter 4, Sect. 28.
7. M. Pachter, E. Garcia and D. Casbeer: “The Differential Game of Guarding a Target”, AIAA
Journal of Guidance, Control and Dynamics, Vol. 40, No. 11, November 2017, pp. 2986-2993.
8. M. Pachter, E. Garcia and D. Casbeer: “Toward a Solution of the Active Target Defense Differ-
ential Game”, Dynamic Games And Applications, Appeared electronically on march 19, 2018.
Vol. 9, No. 1, pp. 165-216, February 2019.
A Normal Form Game Model of Search
and Pursuit
Steve Alpern and Viciano Lee
1 Introduction
Traditionally, search games and pursuit games have been studied by different people,
using different techniques. Pursuit games are usually of perfect information and are
solved in pure strategies using techniques involving differential equations. Search
games, on the other hand, typically require mixed strategies. Both Pursuit and Search
games were initially modelled and solved by Rufus Isaacs in his book [8]. The first
attempt to combine these games was the elegant paper of Gal and Casas [6]. In
```
their model, a hider (a prey animal in their biological setting) begins the game by
```
```
choosing among a finite set of locations in which to hide. The searcher (a predator)
```
```
then searches (or inspects) k of these locations, where k is a parameter representing
```
the time or energy available to the searcher. If the hiding location is not among those
inspected, the hider wins the game. If the searcher does inspect the location containing
the hider, then a pursuit game ensues. Each location has its own capture probability,
known to both players, which represents how difficult the pursuit game is for the
searcher. If the search-predator successfully pursues and captures the hider-prey, the
searcher is said to win the game. This is a simple but useful model that encompasses
both the search and the pursuit portions of the predator-prey interaction.
This paper has two parts. In the first part, we relax the assumption of Gal and
Casas that all locations are equally easy to search. We give each location its own
search time and we give the searcher a total search time. Thus he can inspect any set
of locations whose individual search times sum to less than or equal to the searcher’s
```
total search time, a measure of his resources or energy (or perhaps the length of
```
S. Alpern (B) · V. Lee
University of Warwick, Coventry, UK
e-mail: Steve.Alpern@wbs.ac.uk
V. Lee
e-mail: V.Lee.6@warwick.ac.uk
```
© The Editor(s) (if applicable) and The Author(s), under exclusive license
```
to Springer Nature Switzerland AG 2020
D. M. Ramsey and J. Renault (eds.), Advances in Dynamic Games,
Annals of the International Society of Dynamic Games 17,
```
https://doi.org/10.1007/978-3-030-56534-3_3
```
57
58 S. Alpern and V. Lee
```
daylight hours, if he is a day predator). We consider two scenarios. The first scenario
```
concerns n hiding locations, in which the search time at each location is inversely
proportionate with the capture probability at that location. In the second, we consider
that there are many hiding locations, but they come in only two types, identifiable to
the players. Locations within a type have the same search time and the same capture
probability. There may be any number of locations of each type.
The second part of the paper relaxes the assumption that the players know the
capture probability of every location precisely. Rather, we assume that a distribution
of capture probabilities is known. The players can learn these probabilities more
precisely by repeated play of the game. We analyse a simple model with only two
locations and two periods, where one location may be searched in each period. While
simple, this model shows how the knowledge that the capture probabilities will be
```
updated in the second period (lowered at a location where there was a successful
```
```
escape) affects the optimal play of the game.
```
2 Literature Review
An important contribution of the paper of Gal and Casas discussed in the Introduction
is the analysis involves finding a threshold of locations beyond which the searcher can
inspect. If this is sufficiently high, for example, if he can inspect all locations, then
the hider adopts the pure strategy of choosing the location for which the probability
of successful pursuit is the smallest. On the other hand, if k is below this threshold
```
(say k = 1), the hider mixes his location so that the probability of being at a location
```
```
multiplied by its capture probability (the desirability of inspecting such a location)
```
is constant over all locations.
The paper of Gal and Casas [6] requires that the searcher knows his resource level
```
(total search time) k. In a related but not identical model of Lin and Singham [10]
```
it is shown that sometimes the optimal searcher strategy does not depend on k. This
paper is not directly related to our findings but reader may find it useful to know the
distinction between this paper and ours.
Alpern et al. [2] extended the Gal-Casas model by allowing repeated play in the
case where the searcher chose the right location but the pursuit at this hiding location
is not successful. They found that the hider should choose his location more randomly
when the pursuing searcher is more persistent.
More recently, Hellerstein et al. [7] introduced an algorithm similar to that of
the fictitious play where the searcher recursively updates his optimal strategy after
knowing the response of the opponent’s. They apply this technique to games similar
to those we consider here. Their algorithm is likely to prove a powerful technique
for solving otherwise intractable search games.
More generally, search games are discussed in Alpern and Gal [1] and search and
pursuit problems related to robotics are categorized and discussed in Chung et al.
[5].
A Normal Form Game Model of Search and Pursuit 59
3 Single Period Game with General Search Times
Consider a game where the searcher wishes to find the hider at one of n locations and
then attempt to pursue and capture it, within a limited amount of resources denoted
by k. Each location i has two associated parameters: a search time ti required to
search the location and a capture probability pi > 0 that if found at location i the
searcher’s pursuit will be successful. Both ti and pi are known to the searcher and
the hider.
```
The game G (n, t, p, k) , where t = (t1, . . . , t n ) and p = ( p1, . . . , p n ) represent
```
the time and capture vectors, is played as follows. The hider picks a location i ∈
```
N ≡ {1, 2, ..., n} in which to hide. The searcher can then inspect search locations in
```
any order, as long as their total search time does not exceed k. The searcher wins
```
(payoff = 1) if he finds and then captures the hider; otherwise the hider wins (payoff
```
```
= 0). We can say that this game is a constant sum game where the value V = V (k)
```
is the probability that the predator wins with given total search time k.
A mixed strategy for the hider is a distribution vector h ∈ H, where
```
H =
```
```
{
```
```
h = (h1, h2, . . . , h n ) : h i ≥ 0,
```
n∑
1
h i = 1
```
}
```
.
A pure strategy for the searcher is a set of locations A ⊂ N which can be searched
```
in total time k. His pure strategy set is denoted by a(k), where
```
```
a(k) = {A ⊂ N : T (A) ≡
```
∑
i∈A
```
ti ≤ k}.
```
The statement above simply states that a searcher can inspect any set of locations for
which the total search time does not exceed his maximum search time k. A mixed
search strategy is a probabilistic choice of these sets.
The payoff P from the perspective of the maximizing searcher is given by
```
P(A, i) =
```
```
{
```
pi if i ∈ A, and
0 if i /∈ A.
As part of the analysis of the game, we may wish to consider the best response
problem faced by a searcher who knows the distribution h of the hider. The "benefit"
of searching each location i is given by bi = h i pi , the probability that he finds
```
and then captures the hider (prey). Thus when h is known, the problem for the
```
```
searcher essentially is to choose the set of locations A ∈ α (k) which maximizes
```
```
b(A) = ∑i∈A bi . This is a classic Knapsack problem from the Operations Research
```
```
literature (A seminal book of the Knapsack problem is by Kellerer et al. [9]). The
```
objects to be put into the knapsack are the locations i. Each has a “weight” ti and a
benefit bi . He wants to fill the knapsack with as much total benefit subject to a total
weight restriction of k.
60 S. Alpern and V. Lee
The knapsack approach illustrates a simple domination argument: the searcher
```
should never leave enough room (time) in his knapsack to put in another object.
```
However to better understand this observation, we show the definition of Weakly
dominant below
```
Definition 1 Strategy X weakly dominates strategy Y iff (i) X never provides a
```
```
lower payoff than Y against all combinations of opposing strategies and (ii) there
```
exists at least one combination of strategies for which the payoffs for X and Y are
equal.
Having stated this, we write this simple observation as follows.
```
Lemma 1 Fix k. The set A ∈ α (k) is weakly dominated by the set A′ ∈ α (k) if
```
A ⊂ A′ and there is a location j ∈ A′ − A.
```
Proof If i is in both A or i is not in A′, then P (A, i) = P
```
```
(
```
A′, i
```
)
```
. If i ∈ A′ − A then
P
```
(
```
A′, i
```
)
```
```
= pi > 0 = P (A, i).
```
3.1 An Example
To illustrate the general game we consider an example with n = 4 locations. The
```
search times are given by t = (5, 3, 4, 7) and the respective capture probabilities are
```
```
given by p = (.1, .2, .15, .4). In this example it is easiest to name the locations by
```
their search time, so for example the capture probability at location 7 is 0.4. The
searcher has total search time given by k = 7, so he can search any single location
```
or the pair {3, 4}. The singleton sets {3} and {4} are both dominated by {3, 4}. We put
```
the associated capture time next to the name of each location. Thus the associated
reduced matrix game is simply
```
A\location 5 (.1) 3 (.2) 4 (.15) 7 (.4)
```
```
{5} .1 0 0 0
```
```
{7} 0 0 0 .4
```
```
{3, 4} 0 .2 .15 0
```
Solving the matrix game using online solver [4] shows that the prey hides in the
```
four locations with probabilities (12/23, 0, 8/23, 3/23) while the searcher inspects
```
```
{5} with probability 12/23, {7} with probability 3/23, and {3, 4} with probability
```
8/23. The value of the game, that is, the probability that the predator-searcher finds
and captures the prey-hider, is 6/115. Our approach in this paper is not to solve games
in the numerical fashion, but rather to give general solutions for certain classes of
games, as Gal and Casas did for the games with ti = 1.
A Normal Form Game Model of Search and Pursuit 61
3.2 The Game with t i Constant
Choosing all the search times ti the same, say 1, we may restrict k to integers. This
is the original game introduced and solved by Gal and Casas [6]. Since the ti are
the same, we may order the locations by their capture probabilities, either increasing
or decreasing. Here we use the increasing order of the original paper. Clearly if
```
k = 1 the hider will make sure that all the locations are equally good for the searcher
```
```
( pi h i =constant) and if k = n the hider knows he will be found so he will choose
```
```
the location with the smallest capture probability (here location 1). The nice result
```
says that there is a threshold value for k which divides the optimal hiding strategies
into two extreme types.
```
Proposition 1 (Gal and Casas [6]) Consider the game G (n, t, p, k) where ti = 1
```
for all i and the locations are ordered so that p1 ≤ p2 ≤ · · · ≤ p n . Define λ =∑n
```
i=1 1/ pi . The value of this game is given by min (kλ, p1). If k < p1/λ then the
```
unique optimal hiding distribution is h i = λ/ pi , i = 1, . . . , n. If k ≥ p1/λ then the
unique optimal hiding strategy is to hide at location 1.
3.3 The Game with t i = i, p i Decreasing, k = n Odd
We now consider games with ti = i and pi decreasing. In some sense locations with
higher indices i are better for the hider in that they take up more search time and have
a lower capture probability. Indeed if the searcher has enough resource k to search all
```
the locations (k = ∑ni=1 ti = n (n + 1) /2) then of course the hider should simply
```
hide at location n and keep the value down to p n . Note that if k < n, the hider can
win simply by hiding at location n, which takes time t n = n to search. We give a
```
complete solution for the smallest nontrivial amount of resources (total search time)
```
of k = n. Let us first define the following two variables which will be widely used
in our main result.
```
S( p) = ∑2m+1j=m+1 1/ p j ; ¯h j = 1/
```
```
(
```
```
p j S ( p)
```
```
)
```
.
```
Proposition 2 Consider the game G (n, t, p, k) , where ti = i, pi is decreasing in
```
i and k = n = 2m + 1. Then
1. An optimal strategy for the searcher is to choose the set { j, n − j} with probability
1/
```
(
```
```
p j S ( p)
```
```
)
```
for j = m + 1, . . . , n.
2. An optimal strategy for the hider is to choose location j with probability ¯h j for
j ≥ m + 1 and not to choose locations j ≤ m at all.
3. The value of the game is V = 1S( p) .
62 S. Alpern and V. Lee
Proof Suppose the searcher adopts the strategy suggested above. Any location i
```
that the hider chooses belongs to one of the sets of the form { j, n − j} for j =
```
```
m + 1, . . . , n, where the set {n, 0} denotes the set {n}. Since for j ≥ m + 1 we have
```
j > n − j and the pi are decreasing, the hider is better off choosing location j. In
this case he is found with probability 1/
```
(
```
```
p j S ( p)
```
```
)
```
and hence he is captured with
probability at least p j
```
(
```
1/
```
(
```
```
p j S ( p)
```
```
))
```
```
= 1/S ( p).
```
Suppose the hider adopts the hiding distribution suggested above. Note that no
pure search strategy can inspect more than one of the locations j ≥ m + 1. Suppose
that location j is inspected, then the probability that the searcher finds and captures
the hider is given by ¯h j p j = 1/
```
(
```
```
p j S ( p)
```
```
)
```
```
p j = 1/S ( p). It follows that S ( p) is the
```
value of the game.
It is natural to also analyse if Proposition 2 still holds true for k = n = even
number. For the simplicity of our notation and better readability of Proposition 2, we
decided to write this separate section for even number. In the case where k = n =
even, the solution is exactly the same as their odd counterpart. More specifically
```
k = n = 2m has the same value and optimal strategies as k = n = 2m + 1. However,
```
it is important to note that in the even case, both the searcher’s and hider’s optimal
strategy is unique. For instance, k = n = 4 has the same value and optimal strategies
as k = n = 5. The same can be said for 6 and 7, 8 and 9, etc.
Corollary 1 Assuming the pi are strictly decreasing in i, the hider strategy ¯h given
above is uniquely optimal, but the searcher strategy is not.
Proof Let h∗ = ¯h be a hiding distribution. We must have h∗j + h∗n− j > ¯h j + ¯h n− j =
1/
```
(
```
```
p j S ( p)
```
```
)
```
```
for some j ≥ m + 1; otherwise the total probability given by h∗ would
```
be less than 1. Against such a distribution h∗, suppose that the searcher inspects
the two locations j and n − j. Then the probability that the searcher wins is given
by p j h∗j + p n− j h∗n− j ≥ p j
```
(
```
h∗j + h∗n− j
```
)
```
because p j < p n− j . But by our previous
estimate h∗j + h∗n− j > 1/
```
(
```
```
p j S ( p)
```
```
)
```
this means the searcher wins with probability at
least p j
```
(
```
1/
```
(
```
```
p j S ( p)
```
```
))
```
```
= 1/S ( p) and hence h∗ is not optimal.
```
Next, consider the searcher strategy which gives the same probability as above
```
for all the sets { j, n − j} for j ≥ m + 2 but gives some of the probability assigned
```
```
to {m + 1, m} to the set {m + 1, m − 1}. Let’s say the probability of {m + 1, m − 1}
```
```
is a small positive number ε. The total probability of inspecting location m + 1 (and
```
```
all larger locations) has not changed. The probability of inspecting location m has
```
gone down by ε. So the only way the new searcher strategy could fail to be optimal
is potentially when the hider chooses location m. In this case the probability that the
searcher wins is given by
```
((1/ ( p m+1 S ( p))) − ε) p m .
```
A Normal Form Game Model of Search and Pursuit 63
Comparing this to the value of the game, we consider the difference
```
((1/ ( p m+1 S ( p))) − ε) p m − 1S ( p) = p m − p m−1p
```
```
m S ( p)
```
− ε p m .
Since the first term on the right is positive because p m > p m−1, the difference will
be positive for sufficiently small positive ε.
We will now consider an example to show how the solution changes as k goes up
from the solved case of k = n. We conjecture that there exist a threshold with respect
to k in which above that threshold, the hider ’s optimal strategy is to hide at location
n. To determine that threshold we use the following idea.
```
Proposition 3 The game G (n, p, t, k) has value v = p n if and only if the value v′ of
```
```
the game G (n − 1, ( p1, . . . , p n−1) , (1, 2, . . . , n − 1) , k − n) (with the last location
```
```
removed and resources reduced by n) is at least p n .
```
Proof Suppose v = p n . Every search set with positive probability must include
location n, otherwise simply hiding there implies v < p n . So the remaining part of
every search set has k′ = k − n. With this amount of resources, the searcher must
find the hider in the first n locations with probability at least p n , which is stated
in the Proposition. Otherwise, the searcher will either have to not search location n
```
certainly (which gives v < p n ) or not search the remaining locations with enough
```
resources to ensure v ≥ p n .
3.4 An Example with k = 10, n = 5
```
Consider the example where p = (.5, .4, .3, .2, .1) with k = 10, n = 5. Here
```
```
p n = .1. The game with p′ = (.5, .4, .3, .2) and k′ = k − n = 5 has value at least .1
```
```
because of the equiprobable search strategy of {1, 4} and {2, 3}. Here each location
```
in the new game is inspected with the same probability 1/2 and consequently the best
the hider can do is to hide in the best location 4, and then the searcher wins with
```
probability (1/2) (.2) = .1. It follows from Proposition 3 that the original game has
```
the minimum possible value of v = p n = p5 = .1.
3.5 Illustrative Examples
In this section, we will use an example to further illustrate Proposition 2 and
Corollary 1.
64 S. Alpern and V. Lee
```
First, we consider the game where k = n = 5, ti = i, and p = (.5, .4, .3, .2, .1).
```
The game matrix, excluding dominated search strategies, is given by
A\location 1 2 3 4 5
```
{5} 0 0 0 0 .1
```
```
{1, 4} .5 0 0 .2 0
```
```
{2, 3} 0 .4 .3 0 0
```
```
{1, 3} .5 0 .3 0 0
```
```
{1, 2} .5 .4 0 0 0
```
```
The unique solution for the optimal hiding distribution is (0, 0, 2/11, 3/11, 6/11)
```
```
and the value is 6/110 = 1/ (1/.3 + 1/.2 + 1/.1) .055 . The optimal search strat-
```
```
egy mentioned in Proposition 2 is to play {5} , {1, 4} and {2, 3} with respective prob-
```
```
abilities 6/11, 3/11 and 2/11. Another strategy is to play {5} and {1, 4} the same but
```
```
to play {2, 3} and {1, 3} with probabilities 3/22 and 1/22. It is of interest to see how
```
the solution of the game changes when k increases from k = n = 5 to higher values.
We know that we need go no higher than k = 10 from Proposition 3 because in the
```
game on locations 1 to 4 with k′ = 10 − 5 = 5, the searcher can inspect {4, 1} with
```
```
probability 2/3 and {3, 2} with probability 1/3 to ensure winning with probability
```
```
at least 1/10 = p5 (Table 1).
```
So we know the solution of the game for k = 5 and k ≥ 10. The following table
gives the value of the game and the unique optimal hiding distribution for these and
```
intermediate values. (The optimal search strategies are varied and we don’t list them,
```
```
though they are easily calculated).
```
We know that the value must be nondecreasing in k, but we see that it is not strictly
```
increasing. Roughly speaking (but not precisely), the hider restricts towards fewer
```
and better locations as k increases, staying always at the best location 5 for k ≥ 10.
However there is the anomalous distribution for k = 9 which includes sometime
hiding at location 2.
Table 1 Optimal hiding distribution and values, k ≥ 5
k\i 1 2 3 4 5 Value
5 0 0 2/11 3/11 6/11 3/55 0.0545
6 0 0 2/11 3/11 6/11 3/55 0.0545
6 0 0 0 1/3 2/3 1/15 0.06 67
8 0 0 0 1/3 2/3 1/15 0.06 67
9 0 3/37 4/37 6/37 24/37 18/185 0.0943
≥ 10 0 0 0 0 1 1/10 = 0.1
A Normal Form Game Model of Search and Pursuit 65
3.6 Game with Two Types of Locations
In this section we analyse a more specific scenario where all available hiding locations
are of two types. This model might be vaguely applied to military practices. Suppose
a team of law enforcement is to capture a hiding fugitive in an apartment complex,
then all possible hiding locations can be reduced to a number of types, e.g. smaller
rooms have similar shorter search times and higher capture probability than a parking
lot. Here we solve the resulting search-pursuit game.
```
Suppose there are two types of locations (hiding places). Type 1 takes time t1 = 1
```
```
(this is a normalization) to search, while type 2 takes time t2 = τ to search, with τ
```
being an integer. Now let type 1 locations have capture probability p while type 2
locations have capture probability q. Moreover, suppose there are a locations of type
1 and b locations of type 2. The searcher has total search time k. To simplify our
```
results we assume that k is small enough such that a ≥ k (the searcher can restrict
```
```
all his searches to type 1) and bτ ≥ k (he can also restrict all his searches to type 2
```
```
locations).
```
Let m = k/τ be the maximum number of type 2 locations that can be searched.
```
The searcher’s strategies are to search j = 0, 1, . . . , m type 2 locations (and hence
```
```
k − τ j locations of type 1). Since all locations of a given type are essentially the
```
same, the decision for the hider is simply the probability y to hide at a randomly
```
chosen location of type 1 (and hence hide at a randomly chosen location of type 2
```
```
with probability 1 − y).
```
```
Then the probability P ( j, y) that the searcher wins the game is given by
```
```
yp( k − τ ja ) − (1 − y)q( jb )
```
= ka py +
```
( q
```
```
b (1 − y) −
```
1
a pyτ
```
)
```
j.
This will be independent of the searcher’s strategy j if
q
```
b (1 − y) −
```
1
a pyτ = 0, or
```
y = ¯y ≡ aqaq + bpτ .
```
For y = ¯y, the capture probability is given by
```
P( j, ¯y) = pqkaq + bpτ .
```
```
By playing y = ¯y, the hider ensures that the capture probability (payoff) does not
```
```
exceed P( j, ¯y).
```
66 S. Alpern and V. Lee
We now consider how to optimize the searcher’s strategy. Suppose the searcher
searches j locations of type 2 with probability x j , j = 0, 1, . . . , m. If the hider is at
a type 2 location then he is captured with probability
m∑
```
j=0
```
x jq jb = qb
m∑
```
j=0
```
j x j = qb ˆj , where
ˆj =
m∑
```
j=0
```
j x j
is the mean number of searches at type 2 locations. Similarly, if the hider is at a type
1 location, the hider is captured with probability
m∑
```
j=0
```
```
x jp(k − τ j)a = pka − pτa
```
m∑
```
j=0
```
j x j
= pka − pτa ˆj .
It follows that the capture probability will be the same for hiding at either location
if we have
q
b ˆj =
pk
a −
pτ
a ˆj , or,
ˆj = pbkbpτ + aq .
```
So for any probability distribution over the pure strategies j ∈ {0, 1, . . . , m} with
```
mean ˆj , the probability of capturing a hider located either at a type 1 or a type 2
location is given by
q
b ˆj =
pk
a −
pτ
a ˆj =
pqk
aq + bpτ .
To summarize, we have shown the following.
Proposition 4 Suppose all the hiding locations are of two types: a locations of type
```
1 with search time 1 and capture probability p; b locations of type 2 with search
```
time τ and capture probability q. Suppose a and b are large enough so the searcher
```
can do all his searching at a single location type, that is, k ≤ max(a, τ b). Then the
```
unique optimal strategy for the hider is to hide in a random type 1 location with
probability ¯y = aqaq+bpτ and in a random type 2 location with probability 1 − ¯y. Note
that this is independent of k. A strategy for the searcher which inspects j locations
A Normal Form Game Model of Search and Pursuit 67
```
of type 2 (and thus, k − jτ for type 1) with probability x j is optimal if and only if
```
the mean number ˆj = ∑mj=0 j x j , m = k/τ of type 2 locations inspected is given
by ˆj = pbkbpτ +aq . If this number is an integer, then the searcher has an optimal pure
strategy. The value of the game is given by pqkaq+bpτ .
4 Game Where Capture Probabilities Are Unknown But
Learned
In this section we determine how the players can learn the values of the capture
probabilities over time, starting with some a priori values and increasing these at
locations from which there have been successful escapes. This of course requires
that the game is repeated. Here we consider the simplest model, just two rounds. So
after a successful escape in the second round, we consider that the hider-prey has
```
won the game (Payoff 0). More rounds of repeated play are considered in Gal et al.
```
[2], but learning is not considered there.
We begin our analysis with two hiding locations, one of which may be searched
in each of the two rounds. If the hider is found at location i, he is captured with
```
a probability 1 − q i (escapes with complementary probability q i ). There are two
```
```
rounds. If the hider is not found (searcher looks in the wrong location) in either
```
round, he wins and the payoff is 0: If the hider is found and captured in either round,
the searcher wins and the payoff is 1: If the Hider is found but escapes in the first
round, the game is played one more time and both players remember which location
```
the hider escaped from. If the hider escapes in the second (final) round, he wins and
```
the payoff is 0.
The novel feature here is that the capture probabilities must be learned over time.
At each location, the capture probability is chosen by Nature before the start of the
```
game, independently with probability 1/2 of being h (high) and probability 1/2 of
```
```
being l (the low probability), with h > l. In the biological scenario, this may be the
```
general distribution of locations in a larger region in which it is easy or hard to escape
from. A more general distribution is possible within our model, but this two point
distribution is very easy to understand. If there is escape from location i in the first
round, then in the second round the probability that the capture probability at i is h
```
goes down (to some value less than 1/2). This is a type of Bayesian learning, which
```
only takes place after an escape, and only at the location of the escape.
Our model contributes to the realistic interaction between searching-predator and
hiding-prey acting in a possibly changing environment. Most often in nature, the
searcher has no or incomplete information during the search and pursuit interaction.
Particularly in Mech et al. [11], a pack of wolves has to learn over time the difficulty
of pursuing their prey in specific terrain. Moreover, hiding-prey such as elk seems to
prefer areas with lots toppled dead trees, creating an entanglement of logs difficult to
travel through. We focus here on asking questions if learning the capture probabilities
will affect the searching and hiding behaviour. More specifically, suppose an elk
68 S. Alpern and V. Lee
manages to escape through the deep forest, should it stay there where he believes the
capture probability is low enough, or hide at a different location?
4.1 Normal Form of the Two-Period Learning Game
We use the normal form approach, rather than a repeated game approach. A strategy
```
for either player says where he will search/hide in the two periods (assuming the
```
```
game goes to the second period). Due to the symmetry of the two locations, both
```
players cannot but choose their first period search or hide locations randomly. Thus
```
the players have two strategies: rs (random, same) and rd (random, different). If
```
there is a successful escape from that location, they can either locate in the same
```
location (strategy rs) or the other location (strategy rd). This gives a simple two
```
```
by two matrix game. In this subsection we calculate its normal form; in the next
```
subsection we present the game solution.
```
First we compute the payoff for the strategy pair (rs, rs): Half the time both
```
```
players (searcher and hider) go to different locations in first period, in which case the
```
```
hider wins and the payoff is 0. So we ignore this, put in a factor of (1/2), and assume
```
they go to the same location in the first period. There is only one location to consider,
suppose it has escape probability x. Then, as they both go back to this location in the
second period if the hider escapes in the first period, the expected payoff is given by
```
Px (rs, rs) = (1/2) ((1 − x)1 + x(1 − x)). (1)
```
Since x takes values l and h equiprobably we have
```
P(rs, rs) = Ph (rs, rs) + Pl (rs, rs)2
```
= 2 − h
2 − l2
```
4 . (2)
```
```
It is worth noting two special cases: If both escape probabilities are 1 (escape is
```
```
certain), then the hider always wins and the payoff is 0. If both escape probabilities
```
are 0 then the searcher wins if and only if they both choose the same location, which
has probability 1/2.
```
Next we consider the strategy pair (rd, rd). Here we can assume they both go to
```
```
location 1 in the first period (hence we add the factor of 1/2) and location 2 in the
```
second period. The escape probabilities at these ordered locations 1 and 2 can be any
of the following: hh, ll, hl, lh. The first two are straightforward as it is the same as
```
going to the same location twice (already calculated in (2)). We list the calculation
```
```
of the four ordered hiding locations below, where Px is given in (1).
```
A Normal Form Game Model of Search and Pursuit 69
```
Phh (rd, rd) = Ph (rs, rs)
```
```
Pll (rd, rd) = Pl (rs, rs)
```
```
Plh (rd, rd) = (1/2)((1 − l)1 + l(1 − h))
```
```
Phl (rd, rd) = (1/2)((1 − h)1 + h(1 − l)).
```
Taking the average of these four values gives
```
P(rd, rd) = 4 − h
```
2 − l2 − 2hl
8 =
```
4 − (h + l)2
```
```
8 . (3)
```
```
Now consider the strategy pair (rs, rd). If they go to different locations in the first
```
period, the game ends with payoff 0. So again, we put in factor of 1/2 and assume
they go to same location in first period. This means that if an escape happens in the
```
first period, the hider wins (payoff 0) in the second period. So the probability the
```
searcher wins is
```
P(rs, rd) = P(rd, rs) = (1/2)
```
```
(
```
```
1/2((1 − h) + (1 − l))
```
```
)
```
```
= 2 − (h + l)4 . (4)
```
Thus, we have completed the necessary calculations and the game matrix for the
strategy pairs rs and rd, with searcher as the maximizer.
To solve this game, we begin with the game matrix as follows:
```
A = A(l, h) =
```
```
[ P (rs, rs) P (rs, rd)
```
```
P (rd, rs) P (rd, rd)
```
]
=
```
[ 2−(h2 +l2 )
```
```
42−(h+l)42−(h+l)
```
```
44−(h+l)
```
2
8
]
Then we take out the fraction 1/8 to the left-hand side of the equation, and we
have
8A =
[−2h2 − 2l2 + 4 4 − 2h − 2l
```
4 − 2h − 2l 4 − (h + l)2
```
]
At this point we try to make the right-hand side of the equation to be a diagonal
matrix so we can easily compute it. Therefore we can write the equation as follows:
```
8A − (4 − 2h − 2l)
```
[1 1
1 1
]
= Y =
[−2h2 + 2h − 2l2 + 2l 0
```
0 2h + 2l − (h + l)2
```
]
.
70 S. Alpern and V. Lee
```
Note that V (A) is the value of the matrix A. From the equation above, it shows
```
that the right-hand side of the equation is a diagonal matrix, and a simple formula
for the value of diagonal matrix games is as follows:
V
```
([a 0
```
0 b
```
])
```
```
= 1/ (1/a + 1/b) .
```
Using the above formula, we have
V
```
(
```
```
8A − (4 − 2h − 2l)
```
[1 1
1 1
```
])
```
```
= V (Y ) = 11
```
```
−2h2 +2h−2l2 +2l + 12h+2l−(h+l)2
```
.
Computing this for the value of game matrix A, we have the following equation
```
for V (A),
```
```
V (A) = 12 − 14l − 14 h − 1
```
8
```
( 1
```
```
2h2 −2h+2l2 −2l − 12h+2l−(h+l)2
```
```
) . (5)
```
It is also important to note that in a diagonal game, players adopt each strategy
with a probability inversely proportional to its diagonal element. To obtain this we
```
first calculate the value of V (Y ) given above. Then, both the searcher and hider
```
```
should choose rs and rd with probabilities V (Y )/a and V (Y )/b, respectively.
```
We can now see that, as expected, a successful escape from a location makes that
location more attractive to the hider as a future hiding place. This is confirmed in the
following.
Proposition 5 In the learning game when l < h, after a successful escape both
players should go back to the same location with probability greater than 1/2.
Proof Let a and b denote, as above, the diagonal elements of Y . We have
a − b =
```
(
```
−2h2 + 2h − 2l2 + 2l
```
)
```
−
```
(
```
```
2h + 2l − (h + l)2
```
```
)
```
```
= − (h − l)2 < 0.
```
```
This means that b > a and V /a > V /b. Hence by observation (5) the strategy rs
```
```
should be played with a higher probability (V /a) than rd (probability V /b), in
```
particular with probability more than 1/2.
4.2 An Example with l = 1/3 and h = 2/3
A simple example is when the low escape probability is l = 1/3 and the high escape
probability is h = 2/3. This gives the matrix A as
A Normal Form Game Model of Search and Pursuit 71
```
A(l, h) =
```
[ 13
36141
438
]
```
with value V = V (1/3, 2/3) = 21/68, and where each of the player optimally plays
```
rs with probability 9/17 and rd with probability 8/17.
Suppose there is an escape in the first period at say location 1, then in the sec-
ond period the hider goes to location 1 with probability 9/17. Since the subjective
probability of capture at location 2, from the point of view of either player, remains
```
unchanged at (1/3 + 2/3) /2 = 1/2; this corresponds to a certain probability x at
```
location 1, that is, a matrix
[x 0
0 1/2
]
We then have that
```
(9/17)x = (8/17)(1/2) or,
```
```
x = 4/9.
```
This corresponds to the probability of escape probability l = 1/3 of q, where
```
q1/3 + (1 − q)2/3 = 4/9 or,
```
```
q = 2/3.
```
Thus, based on the escape at location 1 in the first period, the probability that the
escape probability there is 1/3 has gone up from the initial value of 1/2 to the higher
value of 2/3.
5 Summary
The breakthrough paper of Gal and Casas [6] gave us a model in which both the search
and pursuit elements of predator-prey interactions could be modelled together in a
single game. In that paper the capture probabilities depended on the hiding location
but the time required to search a location was assumed to be constant. In the first
part of this paper, we drop that simplifying assumption. We first consider a particular
scenario where we order the locations such that the search times increase while the
capture probabilities decrease. We solve this game for the case of a particular total
search time of the searcher. We then consider a scenario where there are many hiding
locations but they come in only two types. Locations of each type are identical in
72 S. Alpern and V. Lee
that they have the same search times and the same capture probabilities. We solve
the resulting search-pursuit game.
In the second part of the paper we deal with the question of how the players
```
(searcher-predator and hider-prey) learn the capture probabilities of the different
```
locations over time. We adopt a simple Bayesian approach. After a successful escape
from a given location, both players update their subjective probabilities that it is a
```
location with low or high capture probability; the probability that it is low obviously
```
increases. In the game formulation, the players incorporate into their plan the knowl-
edge that if there is an escape, then that location becomes more favourable to the
hider in the next period.
The search-hide and pursuit-evasion game is quite difficult and finding a solution
for the most general case is quite challenging. Most probably, it is a good idea for
the next step to solve for a more specific question in the problem.
We consider a possible extension to Proposition 4 by analysing larger k . Consider
```
the example a = b = 1; t1 = 1; t2 = 3; k = 4; and say p < q ( p1 < p2 as in Gal and
```
```
Casas [6]). The Searcher inspects both cells (one of each type), so he certainly finds
```
the Hider. He captures him with probability p if the hider is at location 1, and q if at
location type 2. So the Hider should hide at location of type 2 as it has lower capture
probability. The main question will be: How big does k have to be for this to occur?
And are there only two solution types as in Gal and Casas [6]? We conjecture that,
as in Gal-Casas, there is a critical value of k = ˆk such that for k < ˆk, Proposition 4
applies, and for k ≥ ˆk the Hider locates in a cell of the type with the lower capture
probability.
The game with learning model has also been analysed using dynamic form [3].
This allows more effective analysis for more than two locations and two rounds.
Moreover, we believe the next avenue of research is to consider the non-zero-sum
game. Indeed, one may argue that a game between a predator and a prey may not
```
necessarily be a (or in our case, constant-sum game), as the predator is hunting it’s
```
dinner while the prey is running for survival. This is important if challenging aspect
to deal with for future studies.
References
1. Alpern, S., Gal, S.: The Theory of Search Games and Rendezvous. Kluwer Academic Publish-
```
ers, Dordrecht (2006)
```
2. Alpern, S., Gal, S., Casas, J.: Prey should hide more randomly when a predator attacks more
```
persistently. Journal of the Royal Society Interface 12, 20150861 (2015)
```
3. Alpern, S., Gal, S., Lee, V., Casas, J.: A stochastic game model of searching predators and
```
hiding prey. Journal of the Royal Society Interface, 16(153), 20190087 (2019)
```
4. Avis, D., Rosenberg, G., Savani, R., Stengel, B. von: Enumeration of Nash Equilibria for Two-
```
Player Games. Economic Theory 42, 9-37 (2010). Online solver available at http://banach.lse.
```
ac.uk.
5. Chung, T., Hollinger, G., Isler, V.: Search and pursuit-evasion in mobile robotics. Autonomous
```
Robots, 31(4):299–316 (2011)
```
A Normal Form Game Model of Search and Pursuit 73
6. Gal, S., Casas, J.: Succession of hide–seek and pursuit–evasion at heterogeneous locations.
```
Journal of the Royal Society Interface 11, 20140062 (2014).
```
7. Hellerstein, L., Lidbetter, T., Pirutinsky, D.: Solving Zero-sum Games using Best Response
```
Oracles with Applications to Search Games, Operations Research, 67(3):731–743 (2019)
```
8. Isaacs, R.: Differential Games. Wiley, New York (1965)
9. Kellerer, H., Pferschy, U., Pisinger, D.: Knapsack problems. Berlin: Springer (2004)
10. Lin, K. Y., Singham, D.: Finding a hider by an unknown deadline. Operations Research Letters
```
44, 25–32 (2016)
```
11. Mech, L. D., Smith, D. W., MacNulty, D. R.: Wolves on the hunt: the behavior of wolves
```
hunting wild prey. University of Chicago Press (2015)
```
Computation of Robust Capture Zones
Using Interval-Based Viability
Techniques in Presence of State
Uncertainties
Stéphane Le Ménec and Vladimir Turetsky
1 Introduction
The problem of intercepting a maneuverable target admits different mathematical
```
formulations. It can be formulated as a differential game (quantitative or qualitative)
```
where the interceptor and target play the role of the pursuer and evader, respectively.
The optimal pursuer strategies in these games are of a bang-bang type [11]. The other
formulation, adopted in this paper, is a robust control problem in a prescribed class
of feedback strategies, namely in the classes of linear and saturated linear strategies.
If the pursuer strategy is assigned, the first question is: does this strategy guarantee
the capture robustly against any evader’s bounded control? If a strategy has such a
property, it is called a robust capturing strategy. Note that in this definition, no
differential game formulation is assumed. The notion of a robust capturing strategy
refers to a given strategy and does not mean an optimal strategy in some differential
game. However, if it is, for example, a linear strategy, the capture can be achieved
by using an excessively large gain thus violating technical and physical control
constrains. This implies the next question: from what set of initial conditions this
strategy robustly guarantees the capture in such a way that the control constraints are
satisfied along any trajectory. Such a set is called robust capture zone of an assigned
strategy. The problem of constructing a robust capture zone has close connections
with invariant set theory [4], stable bridges construction [5, 9], viability theory [3]
and other fields of control theory and applications.
S. Le Ménec (B)
Airbus / MBDA, 1, Avenue Réaumur, 92358 Le Plessis-Robinson Cedex , France
e-mail: stephane.le-menec@mbda-systems.com
V. Turetsky
Department of Applied Mathematics, Ort Braude College of Engineering, 51 Snunit Str,
2161002 Karmiel, Israel
e-mail: turetsky1@braude.ac.il
```
© The Editor(s) (if applicable) and The Author(s), under exclusive license
```
to Springer Nature Switzerland AG 2020
D. M. Ramsey and J. Renault (eds.), Advances in Dynamic Games,
Annals of the International Society of Dynamic Games 17,
```
https://doi.org/10.1007/978-3-030-56534-3_4
```
75
76 S. Le Ménec and V. Turetsky
It is crucially important to have an accurate description or a good approximation
of the robust capture zone before making a decision in favor of implementing this or
```
another capturing strategy. Choosing a linear (a saturated linear) strategy in practical
```
implementations is caused both by their simple structure and by a non-chattering
```
performance (see, e.g., [13, 14]). Verifying that a linear or saturated linear strategy is
```
robust capturing, and constructing their robust capture zones are based on the robust
controllability theory developed by [7].
We apply viability theory tools to reformulate the concept of robust capture zones
in terms of capture basin. An interval implementation of capture basin computation
is used to numerically approximate robust capture zones. For comparison purpose,
we first provide results dealing with linear kinematics that are already obtained in an
analytical manner. Then, new results are performed using the same interval analysis
based algorithms, the same kinematics, but considering noisy measurements that
analytical methods are not able to deal with.
2 Problem Statement and Preliminaries
2.1 Engagement Model
```
A planar engagement between two moving object—an interceptor (pursuer) and a
```
```
target (evader)—is considered. The schematic view of this engagement is shown in
```
Fig. 1. The X-axis of the coordinate system is aligned with the initial line of sight.
```
The origin is collocated with the initial pursuer position. The points (x p , y p ), (x e, ye)
```
```
are the current coordinates; V p and Ve are the velocities and a p , a e are the lateral
```
```
accelerations of the pursuer and the evader, respectively; ϕp , ϕe are the respective
```
```
angles between the velocity vectors and the reference line of sight; and y = ye − y p
```
is the relative separation normal to the initial line of sight.
Fig. 1 Interception
geometry
Computation of Robust Capture Zones Using … 77
It is assumed that the dynamics of each object is expressed by a first-order transfer
```
function with the time constants τp and τe, respectively. The velocities and the bounds
```
of the lateral acceleration commands of both objects are constant. The dynamics of the
pursuer and the evader are described by nonlinear systems of differential equations:
```
˙x p = V p cos ϕp , x p (t0) = 0,
```
```
˙y p = V p sin ϕp , y p (t0) = 0,
```
```
˙ϕp = a p /V p , ϕp (t0) = ϕp0,
```
```
˙a p = (umaxp u p − a p )/τp , a p (t0) = 0,
```
```
(1)
```
```
˙x e = −Ve cos ϕe, x e(t0) = r0,
```
```
˙ye = Ve sin ϕe, ye(t0) = 0,
```
```
˙ϕe = a e/Ve, ϕe(t0) = ϕp0,
```
```
˙a e = (umaxe u e − a e)/τe, a e(t0) = 0,
```
```
(2)
```
where t0 ≥ 0 is the initial time instant, r0 is the initial distance between the missiles,
u p and u e are the normalized lateral acceleration commands of the pursuer and the
evader, respectively. Below, the strategies of the first player are chosen as functions
measurable on time and Lipschitzian on the state variable. So, the trajectory of the
system generated by some feedback strategy of the first player and some measurable
realization of the second player’s control can be considered as a solution of the
corresponding Cauchy problem obtained by substituting these control functions into
```
the system dynamics. The functions u p (t) and u e(t) should satisfy the constraints
```
```
|u p(t)| ≤ 1, |u e(t)| ≤ 1, (3)
```
amaxp and amaxe are the maximal lateral accelerations. The final time instant of the
engagement is
```
t f = t f (u p (·), u e(·), t0, ϕp0, ϕe0, r0) =
```
```
max{t > 0 : ˙r(t) ≤ 0}, (4)
```
where
```
r(t) =
```
√
```
(x e(t) − x p (t))2 + (ye(t) − y p (t))2, (5)
```
```
is the current distance between the missiles. The practical definition (4) means that the
```
engagement is considered in the time interval where the distance between the missiles
decreases. Note that in this paper, we do not formulate and solve any nonlinear
pursuit-evasion differential game.
78 S. Le Ménec and V. Turetsky
2.2 Robust ε-Capture Zone
The objective of the pursuer is to nullify, or at least to make small, the final distance
```
J = J (u p (·), u e(·), t0, ϕp0, ϕe0, r0, amaxp , amaxe ) = r(t f ). (6)
```
```
Consider the class U of feedback strategies u(t, X p , X e), where X i = (x i , yi ,
```
```
ϕi , ai )T , i = p, e. Note that it is not assumed that |u(t, X p , X e)| ≤ 1 for all (t, X p ,
```
```
X e). For a given initial distance r0 , for a given pursuer’s strategy u p (·) ∈ U and for
```
```
a given number ε > 0, the set Φ = Φ(u p (·)) of initial positions (t0, ϕp0, ϕe0) ∈ R3
```
```
is called the robust ε-capture zone if for all (t0, ϕp0, ϕe0) ∈ Φ,
```
1. the final distance (6) satisfies
```
J ≤ ε, (7)
```
2. the pursuer’s control time realization
```
u p (t) = u p (t, X p (t), X e(t)) satisfies the constraint (3)
```
```
for any evader’s control u e(t) satisfying (3).
```
The problem of constructing the robust ε-capture zone can be formulated for two
```
information patterns: (i) both state vectors X p (t) and X e(t) are known to the pursuer
```
```
(complete information), (ii) the evader’s state vector X e(t) is estimated assuming a
```
bounded estimation error.
2.3 Linearized Model
Let the relative separation between the missiles be denoted by y = ye − y p . The
corresponding relative velocity is ˙y. If the aspect angles ϕp and ϕe are small during
```
the engagement then the system (1)–(2) can be linearized [11]:
```
```
˙x = Ax + bu p + cu e, x(0) = x0, (8)
```
```
where the state vector is x = (x1, x2, x3, x4)T = (y, ˙y, a e, a p )T , the superscript T
```
denotes the transposition,
```
A =
```
⎡
⎢⎢
⎣
0 1 0 0
0 0 1 −1
0 0 −1/τe 0
0 0 0 −1/τp
⎤
⎥⎥
```
⎦ , (9)
```
```
b = (0, 0, 0, amaxp /τp )T , c = (0, 0, amaxe /τe, 0)T , (10)
```
```
x0 = (0, x20, 0, 0)T , x20 = Veϕe0 − V p ϕp0. (11)
```
Computation of Robust Capture Zones Using … 79
In the linearized system, the final time moment is
```
t f = r0/(V p + Ve). (12)
```
```
The cost functional (6) becomes
```
```
Jx = |x1(t f )|. (13)
```
```
The robust capture zone (for ε = 0) of a feedback strategy u p (t, x) is the set
```
```
Φx = Φx (u p (·)) =
```
```
{
```
```
(t0, ϕp0, ϕe0) :
```
```
Jx = 0, |u p (t, x(t))| ≤ 1, ∀ u e(·) : |u e(t)| ≤ 1
```
```
}
```
```
. (14)
```
2.4 Problem Scalarization
Let introduce the function
```
z(t) = d T X (t f , t)x(t), (15)
```
```
where x(t) is the state vector of (8), X (t f , t) is the transition matrix of the homo-
```
```
geneous system ˙x = Ax, d T = (1, 0, 0, 0). The value of the function z(t) has the
```
following physical interpretation. If u ≡ 0 and v ≡ 0 on the interval [t, t f ], then the
```
miss distance |x1(t f )| equals |z(t)|. Therefore, this function is called the zero-effort
```
```
miss distance (ZEM). It is given explicitly by
```
```
z(t) = x1(t) + (t f − t)x2(t)+
```
τ 2e ψ
```
(
```
```
(t f − t)/τe
```
```
)
```
```
x3(t) − τ 2p ψ
```
```
(
```
```
(t f − t)/τp
```
```
)
```
```
x4(t), (16)
```
where
```
ψ(ξ )  exp(−ξ ) + ξ − 1 > 0, ξ > 0. (17)
```
```
By direct differentiation, z(t) satisfies the differential equation
```
```
˙z = h p(t)u p + h e(t)u e, z(0) = z0  t f x20. (18)
```
where
```
h p (t) = −τp amaxp ψ((t f − t)/τp ), h e(t) = τe amaxe ψ((t f − t)/τe). (19)
```
```
Since z(t f ) = x1(t f ), the performance index (13) can be rewritten as Jz = |z(t f )|.
```
80 S. Le Ménec and V. Turetsky
```
For the scalar system (18), the robust capture zone (RCS) of a feedback strategy
```
```
u(t, z) becomes
```
```
Φz = Φz (u p (·)) =
```
```
{
```
```
(t0, z0) :
```
```
Jz = 0, |u p (t, z(t))| ≤ 1, ∀ u e(·) : |u e(t)| ≤ 1
```
```
}
```
```
. (20)
```
2.5 Robust Capture Zone for Linear System
General theoretical results on the properties and the structure of the RCS of linear
and saturated linear strategies are outlined in Appendix. In this paper, we deal with
linear feedback strategies of the following form:
```
u p (t, z) = K (t)z(t
```
```
f − t) α
```
```
, (21)
```
```
where K (t) is a positive continuously differentiable function for t ∈ [0, t f ], α > 0.
```
```
Note that for the coefficient functions h p(t), h e(t) given by (19), and for linear
```
```
strategies (21), the numbers N p , C p, N e, C e, N K and C, defined by (53) and (57),
```
are
N p = N e = 2, C p = − 12τ
p
, C e = 12τ
e
```
, N K = α + 1, C = αK (t f ). (22)
```
```
Note that the conditions (I)–(IV) and (VI) of Theorem 1 are satisfied. The condition
```
```
(V) is formulated as
```
```
(IV-α) either
```
```
α > 3, (23)
```
or
```
α = 3 and K (t f ) > 6τp . (24)
```
```
Thus, due to Theorem 1, the strategy (21) is robust capturing, if the condition (IV-α)
```
holds.
In what follows, we consider the class of linear robust capturing strategies
```
U =
```
```
{
```
```
u p (t, z) = K (t)z(t
```
```
f − t) α
```
:
```
(α > 3) ∨
```
```
(
```
```
(α = 3) &(K (t f ) > 6τp amaxp )
```
```
) }
```
```
(25)
```
Computation of Robust Capture Zones Using … 81
```
where K (t) > 0 is continuously differentiable. Due to [7] (see Theorems 2–6), the
```
```
robust capture zone of u p (·) ∈ U has a form
```
```
Φz (u p (·)) = Φz (K (·), α) =
```
```
{
```
```
(t0, z0) :
```
```
t0 ∈ (tin , t f ), |z0| ≤ Z0(t0)
```
```
}
```
```
, (26)
```
```
where tin ∈ [0, t f ), Z0(t) ≥ 0 is a continuous function satisfying
```
```
Z0(t) ≤ (t f − t)
```
α
```
K (t) . (27)
```
This condition means that the robust capture zone is a subset of the domain where the
```
constraint |u(t, z(t))| ≤ 1 is satisfied. The boundary function Z0(t) and the moment
```
```
tin are obtained constructively (see for the details in Appendix section “Robust Cap-
```
```
ture Zone of Linear RCS”).
```
```
Similar results were established by [7] (see Appendix section “Robust Capture
```
```
Zone of Saturated Linear RCS”) for the class of saturated linear robust capturing
```
strategies
U s =
```
{
```
```
u sp = sat(u p (t, z)), u p (·) ∈ U
```
```
}
```
```
, (28)
```
```
with sat(·) function defined as follows:
```
```
sat(x) = max (min (x, 1), −1). (29)
```
```
For u sp (·) ∈ U s ,
```
```
Φz (u sp (·)) =
```
```
{
```
```
(t0, z0) : t0 ∈ (t sin , t f ), |z0| ≤ Z s0(t0)
```
```
}
```
```
, (30)
```
```
where the boundary function Z s0(t) and the moment t sin ∈ [0, t f ) are obtained con-
```
```
structively (see for the details in Appendix section “Robust Capture Zone of Saturated
```
```
Linear RCS”).
```
```
Due to (15) and (18), for the strategies u p (t, x) = u p (t, d T X (t f , t)x) and
```
```
u sp (t, x) = u sp (t, d T X (t f , t)x), the original robust capture zones Φx are
```
```
Φx (u p (·)) =
```
```
{
```
```
(t0, ϕp0, ϕe0) :
```
```
t0 ∈ (tin , t f ), |Veϕe0 − V p ϕe0| ≤ Z0(t0)/t f
```
```
}
```
```
, (31)
```
and
```
Φx (u sp (·)) =
```
```
{
```
```
(t0, ϕp0, ϕe0) :
```
82 S. Le Ménec and V. Turetsky
```
t0 ∈ (t sin , t f ), |Veϕe0 − V p ϕe0| ≤ Z s0(t0)/t f
```
```
}
```
```
, (32)
```
respectively.
2.6 Connections Between Optimal Capture Zones and Robust
Capture Zones
Before to provide interval-based results in the case of perfect information and in the
case of noisy measurements, we summarize classical results about DGL1 kinematic
```
models (differential game approaches). DGL1 stands for pursuit-evasion linear dif-
```
```
ferential game with terminal criterion (terminal miss distance) and bounded controls.
```
Several versions of DGL like games considering different kinematics have been stud-
ied in an extensive manner by researchers as J. Shinar and co-authors [12]. DGL1
```
describes the player dynamics using first-order transfer functions (between their con-
```
```
trols and the achieved accelerations). We summarized the analytical results obtained
```
```
when applying robust control techniques as well (strategies of the pursuer restricted
```
```
to linear state feedbacks). In addition, we underline the wording we use to describe
```
capture zones in each case.
```
The theory of differential games that defines what is an equilibrium (saddle point,
```
```
Nash equilibrium in the case of the aforementioned pursuit-evasion games) aims to
```
compute optimal strategies for both players and as a consequence Optimal Capture
```
Zones (OCZ). In the case of DGL1, the optimal strategies are bang-bang controls
```
```
(according to the sign of the Zero-Effort-Miss). According to the kinematic parame-
```
```
ters (μ = a
```
maxp
```
a maxEand ε = τEτp ), the shape of the DGL1 optimal capture zones differs: it is
```
```
“open” (case 1, μ > 1, top drawing of Fig. 4) or “closed” (case 2, μ < 1 and μ ε ≥ 1,
```
```
top drawing of Fig. 5). Other cases (other numerical parameter settings) may occur;
```
however, case 1 and 2 are the most common, i.e, the most interesting situations.
```
Robust controllability aims to compute Robust Capture Zones (RCZ) in the pres-
```
```
ence of uncertainties (the evader controls; bang-gang controls in the present situation)
```
assuming that the pursuer applies a state feedback law in place of its optimal strat-
egy. It is of first importance to compare the bang-bang capture zones that are the
maximum capture zones respect to the robust capture zones that are smaller but that
consider more realistic pursuit strategies. The feedback laws we consider for the
```
pursuer (as described in Sect. 2.5 for K (t) ≡ K ) are of the following type:
```
```
u p (t, z) = K z(t
```
```
f − t) α
```
```
(33)
```
```
K being a positive real number, α being a positive integer and u p (z, t) being satu-
```
```
rated: u sp = sign(u p ), when |u p | > 1.
```
Several cases may happen when applying a robust controllability approach:
Computation of Robust Capture Zones Using … 83
```
• We may chose K and α in a way to have u p (t, z) not reaching the controller limits
```
```
(saturations). One advantage is then that the u p (t, z) strategy is a continuous
```
```
function all along the trajectories.
```
```
• We may also apply larger gain values in the Pursuer’s feedback guidance law (33).
```
Then, the feedback guidance law has to be saturated. Two situations may occur:
– If the feedback guidance law reaches saturation all along the boundaries of the
```
optimal (differential game) capture zones, then we obtain robust (controllability)
```
capture zones that are similar to the ones we obtain considering the bang-bang
```
differential game optimal pursuit strategies (top drawings of Figs. 4 and 5).
```
– For some K and α values, the feedback guidance law is not reaching maximum
values as the differential game strategy does at the optimal capture zone limits
```
and as a consequence the robust capture zone is smaller (bottom drawings of
```
```
Figs. 4 and 5).
```
3 Interval Algorithm Approximation
3.1 Viability Kernel and Capture Basin
Viability theory [3] provides a set of concepts and techniques to study continuous
dynamical systems. According to viability wording and definitions, a dynamical
```
system is represented by a state variable x(t) ∈ K ⊂ X = Rn , K compact, regulated
```
```
by one or more controls (u p (.) and u e(.) in the present situation), which evolution
```
is ruled by a continuous dynamic law,
```
˙x(t) = f (x(t), u p (t, x(t)), u e(t, x(t))) ∈ X,
```
```
u p (.) ∈ U ,
```
```
u e(.) ∈ V .
```
Viability theory systematically studies the properties of viability of the evolutions in
```
some environment (set K corresponding to the subset of the state space X satisfying
```
```
a list of constraints, an example would be |u p (·)| ≤ 1) at any time or until a finite
```
```
prescribed time where the evolution reaches a given target (r(t f ) ≤ ε in the present
```
```
case). Final time is defined by τ = t f − t = 0 with t regular time, i.e, forward time
```
and τ backward time.
For that purpose it introduces, respectively, the notions of viability kernels and
```
capture basins. The viability kernel of the environment is the subset (possibly empty)
```
of the states in the environment from which starts at least one viable evolution
```
(remaining all the time, i.e., infinite time, in K). The capture basin of the target
```
viable in K is the subset of the states in K from which starts at least one viable
```
evolution (i.e., remaining in K) until it reaches the target in finite time (capture zones
```
```
of differential games). There exists one valid u p (t, x(t)) strategy (retro-actions) for
```
```
all admissible u e(t, x(t)) strategies that forces the system to end in the target set.
```
```
Capture basins design retro-actions (feedbacks) which allow to pilot the evolutions
```
so as to maintain viability until, if any, capturing a target.
84 S. Le Ménec and V. Turetsky
3.2 Capture Basin Enclosure
First, we start by describing viability algorithms in a general manner before to explain
how we use these algorithms in the specific case of the paper. Then, in following
sections, we explain how these algorithms are implemented using interval analysis.
```
In a nutshell, once a differential inclusion ˙x(t) ∈ F(x(t)) has been discretized in time
```
```
by x m+1 ∈ Υ (x m ), and “restricted” to grids of the finite-dimensional vector space,
```
```
then the viable capture basin CaptΥ (K, C) of elements of K from which an evolution
```
```
(x m ) viable in K reaches the target C in finite discrete time can be obtained by two
```
algorithms [10]:
1. The capture basin algorithm. It is based on the formula :
```
CaptΥ (K, C) =
```
⋃
m≥0
```
C m (34)
```
```
where the increasing sequence of subsets C m ⊂ CaptΥ (K, C) is iteratively
```
defined by
```
{ C
```
0 = C
```
∀ m ≥ 1, C m+1 := K ∩ (C m ∪ Υ −1(C m )) (35)
```
2. The viability kernel algorithm. Whenever K\C is repeller (for all x ∈ K \ C, all
```
evolutions x(·) leave K \ C in finite time), there is another class of general algo-
```
```
rithms allowing to compute viable capture basins (in this context, at convergence,
```
```
V iabΥ (K, C) is CaptΥ (K, C)):
```
```
ViabΥ (K, C) =
```
⋂
m≥0
```
K m (36)
```
```
where the decreasing sequence of subsets K m ⊃ ViabΥ (K, C) is iteratively
```
defined by:
```
{ K
```
0 = K
```
∀ m ≥ 1, K m+1 := C ∪ (K m ∩ Υ −1(K m )) (37)
```
Naturally, both subsets C m and K m are computed at each iteration on a grid of the
state space. The convergence of the C m and K m subsets follows from convergence
```
theorems presented in Chap. 19, p. 769, of Viability Theory. New Directions, [1] (see
```
```
for instance Theorem 19.3, p. 774).
```
The way we rebuild a robust capture zone is by solving several capture basin and
viability kernel problems over time interval slices. The number of capture basin and
viability kernel problems we consider is related to the Euler discrete time step we
```
assume (see the interval implementation described in 3.5 for complementary expla-
```
```
nations). The viability problems we solve are attainability between set C at t and set
```
Computation of Robust Capture Zones Using … 85
```
C at t + 1 considering a small time step, C(t) being the target set. After convergence
```
```
of the enclosure process, C(t + 1) is the target set for the next viability problem to
```
solve. The robust capture zone is then the collection of the capture basins we com-
```
pute. Convergence of the overall process (robust capture zone shape), i.e., the fact
```
```
we do not contract the time dimension (and that we mainly take care of the geometric
```
```
space only) is related to the fact we use at each time step a capture basin algorithm
```
```
(over-approximation), and a viability kernel algorithm (under-approximation). In a
```
rough manner, in the application we consider, we may say the capture basin algorithm
```
solves the problem “reach the target set C(t) in Δt time by increasing an empty set
```
```
(at first iteration) up to C(t + 1).” The viability kernel algorithm with target set C(t)
```
solves the problem “stay viable,” i.e., in K during a Δt period of time by decreasing
```
an initial guess equal to K at first iteration up to C(t + 1). In this context (viability
```
```
kernel with target set), “stay viable” means reach the target set C(t) after a Δt time
```
```
period. Convergence of both algorithms to the capture basin (Δt robust capture zone,
```
```
Δt slice) is strongly related to the repeller assumption stated above.
```
3.3 Interval Arithmetics
Interval computation [8] is about guaranteed numerical methods for approximating
```
sets, and their application to engineering. Guaranteed means here that outer (and
```
```
inner if needed depending on the application) approximations of the sets of interest
```
are obtained, which can, at least in principle, be made as precise as desired. It thus
```
becomes possible to achieve tasks such as computing (over and under-approximating)
```
capture basins or capture zones of differential games.
The main tool to be used, so-called interval analysis, is based upon the very
simple idea of enclosing real numbers in intervals and real vectors in boxes, i.e, sub-
pavings. Interval computation is a special case of computation on sets. The operations
on sets fall into two categories. The first one such as union or intersection consists
of operations that have a meaning only in a set-theoretic context. The union of two
disconnected intervals can be over-approximated by an interval even if it is not an
```
interval in the set-theoretic sense. The second one (thanks to natural arithmetics)
```
```
consists of the extension of operations that are already defined for numbers (or
```
```
vectors): addition, multiplication, etc.
```
Intervals are boxes of dimension one. Inner and outer approximations of sets
```
are sub-pavings. Sub-pavings belong to IRn (boxes of finite dimension representing
```
```
bounded continuous values). For compactness reasons, boxes are written [x], x being
```
a state vector with state variables in R. In a way similar to the definition of elementary
operations as addition, multiplication, all the functions in Rn can be extended to
intervals. Composition of elementary functions allows to define inclusion functions:
[ f ] : IRn → IRm is an inclusion function of f if
```
∀[x] ∈ IRn , f ([x]) ⊂ [ f ]([x]). (38)
```
86 S. Le Ménec and V. Turetsky
```
Fig. 2 Inclusion function (drawing with courtesy of Prof. Luc Jaulin, UBO, Brest, France); []
```
```
denotes in an usual way intervals and inclusion functions (box over-approximations of function
```
```
images); in addition, symbol ∗ denotes the minimal inclusion function, which is considered as
```
```
optimal (reason to use the ∗ symbol).
```
```
Inclusion functions provide guaranteed over-approximations (wrapping effect) in
```
```
IRm (see Fig. 2 for illustration purpose).
```
```
Thanks to these properties and fast interval-based algorithms (guaranteed inte-
```
```
gration of sub-pavings, contractor programming [6]) it is possible to implement the
```
viability kernel and capture basin algorithms in a way to solve problems such as those
described in [5, 9]. Set invariance [4] has also an interval-based implementation.
3.4 Contractor Programming
Set membership techniques are tools to compute sets X ⊂ Rn , X being a general set
```
(not necessary a box) described by constraints (states that are solutions of constraints).
```
```
Constraints are geometric conditions on state variables (equalities, inequalities) but
```
```
also constraints defined by Ordinary Differential Equations (ODE as those govern-
```
```
ing the player evolutions in differential games). The operator CX : IRn → IRn is a
```
contractor for X ⊂ Rn if
∀[.] ∈ IRn ,
```
{ C
```
```
X([.]) ⊂ [.] (contractance),
```
```
CX([.]) ∩ X = [.] ∩ X (completness) (39)
```
After contraction by a CX operator, all solutions in box [.] that satisfy the X
```
constraint remain in CX([.]) (completness property). However, CX operator is not
```
```
necessarily minimal. After contraction, CX([.]) may still contain values that do not
```
```
satisfy the X constraint. Contractor programming has been used to re implement (in
```
```
a sightly different way) the viability kernel and capture basin algorithms described
```
in Sect. 3.2.
Computation of Robust Capture Zones Using … 87
3.5 Interval-Based Backward Reachable Set Computation
1. ODE constraints
```
Capture zones have been built in an iterative manner (iterative algorithm) follow-
```
ing a backward reachable set approach. A backward reachable set is the set of
states from which trajectories start that reach some given target set. The backward
```
reachable sets we compute are on fixed limited time horizons with quantifiers (∀,
```
```
∃) on controls (differential game context). The target set we consider at time τ
```
to compute reachability in backward time over a time period dt is the backward
reachable set computed at time τ − dt where τ is backward time, i.e, τ = t f − t,
```
dt is a (small) positive time step. A backward reachable set is represented by
```
```
an interval [z] = [z min , z max ]. At time τ = dt (first step of the algorithm), the
```
```
target set we consider is [z f ] = [−ε, ε] (ε-Capture Zone). A capture zone con-
```
sists in the sum of the so computed backward reachable sets. At each iteration
of the algorithm, each backward reachable set is over- and under-approximated
using contractor programming. The over-approximation is a viability kernel with
target and the under-approximation is a capture basin as described in Sect. 3.2.
```
The boxes we considered when implementing contractors are [z(τ − dt), z(τ )]
```
which are boxes of dimension twice with respect to the problem dimension. In the
present case, the boxes are of size 2. ODE contractors are state evolution contrac-
tors, i.e., operators that integrate ODE, i.e., that compute state trajectories. ODE
```
are then (time) state constraints. [z(.)] in previous equation are both intervals (of
```
```
dimension 1). We defined the two following ODE numerical constraints (and the
```
```
associated contractors):
```
```
∃u p, ∀u e | [z(τ − dt)] = [Υ ]([z(τ )], [u p], [u e]) (40)
```
```
∃u e, ∀u p | [z(τ − dt)] = [Υ ]([z(τ )], [u p], [u e]) (41)
```
with [Υ ] an inclusion function of the backward time game kinematics integrated
over a time period dt. In the present situation, we implement a simple Euler
integration scheme:
```
[Υ ]([z(τ − dt)], [u p ], [u e]) = [z(τ )] − dt . [˙z(τ, [u p], [u e])] (42)
```
More complex numerical schemes as Runge Kutta can be considered for ODE
integration and full implementation of ODE contractors. Nevertheless, guaranteed
integration techniques have to be applied for computing inclusion functions [Υ ].
More sophisticated approaches as Taylor developments and Picard theorem can
be used to compute guaranteed margins [2]. Be aware that inclusion function [Υ ]
can be a quite large box due to uncertain evader’s controls, due to the dt time
period and due to margins we have to take into account for guaranteed integration.
88 S. Le Ménec and V. Turetsky
2. Contractor programming based viability kernel with target algorithm
```
We apply the contractor corresponding to Eq. (40) to box [z+(τ − dt),
```
```
[z min , z max ]] to compute backward reachable set over-approximations (viability
```
```
kernels). Here, [z+(τ − dt)] and [z min , z max ] are both one-dimensional intervals;
```
```
[z+(τ − dt)] is the target set for current computation: [z+(τ − dt)] is an over-
```
approximation of the reachable set computed at previous iteration, i.e, the viability
```
kernel computed at previous iteration; [z min , z max ] is the z domain. In the present
```
case, z max is positive, z min = −z max , and z max is large enough to have z max outside
the capture zone. Then, we only use the contraction of box [z min , z max ] which is
the contractor programming based viability kernel.
3. Contractor programming based capture basin algorithm
```
We apply the contractor corresponding to Eq. (41) to compute backward reachable
```
```
set under-approximations (capture basins). We first define the Comp (a, b) inter-
```
val operator to compute the complement of [a] in [b]. For the sake of simplicity,
we omit to write brackets around the [a] and [b] intervals when written into the
```
Comp (.) operator. In addition, be aware that the result of operator Comp (a, b)
```
is a list of potentially non-connected intervals. In the present case, the backward
```
reachable sets being defined by an interval only (box of dimension one), the result
```
```
of Comp (.) is two boxes. The “non-capturing state contractor” (constraint (41))
```
is applied to the box:
```
[Comp (z−(τ − dt), [z min , z max ]), [z min , z max ]]. (43)
```
When computing the capture basin at time τ , the “contractor programming tar-
```
get set” we consider is the complementary set (in [z min , z max ]) of the under-
```
approximation of the backward reachable set computed at time τ − dt. The under-
approximation of the backward reachable set computed at time τ − dt which is
```
the capture basin at time τ − dt is denoted z−(τ − dt) in the above Eq. (43).
```
```
As previously (in the case of the viability kernel), we only use the [z min , z max ]
```
contraction which is the second component of the box we contract, the component
that corresponds to time τ . This interval is the complementary of the capture basin,
i.e, we perform a complementary operation respect to the [z min , z max ] domain.
```
In addition, interval refinement process has been also implemented (bisection
```
```
algorithms) to refine the backward reachable set computation precision. We iter-
```
ate the viability kernel and capture basin computation process that encloses the
differential game barrier until we obtain the precision required. The contrac-
tor programming based implementation of the viability kernel and capture basin
algorithms is new. This approach differs from the grid based approaches and also
differs from the interval computing based implementations that only exploit bisec-
tion techniques. These viability kernel and capture basin algorithms take benefits
from the computation performance of contractor programming.
Computation of Robust Capture Zones Using … 89
```
When computing robust capture zones (in place of optimal capture zones), we
```
```
update the constraints (Eqs. (40) and (41)) in a way to not consider anymore
```
quantifiers on u p .
4. Contractor programming based viability algorithms
```
Define :
```
```
• CΥ ([.]) a dynamic system evolution contractor,
```
```
• Υcapture the capture constraint described by Eq. (40),
```
```
• Υevade the evade constraint described by Eq. (41),
```
```
• CX([.])[i] the i component of the box contracted by operator CX([.]),
```
```
• Z(τ ) the z domain at time τ , which is constant and equal to [z min , z max ] in the
```
present situation.
Then, we may rewrite in a formal manner, the viability kernel with target algo-
```
rithm:
```
```
ViabΥ (K, z+(τ − dt)) = C˛capture (z+(τ − dt), Z(τ )) [2] (44)
```
The same can be done for the capture basin algorithm:
```
CaptΥ (K, z−(τ − dt)) = ...
```
```
Comp (CΥevade (Comp (z−(τ − dt), Z(τ − dt)) , Z(τ )) [2]), Z(τ )) (45)
```
```
By the way, z+(τ − dt) and z−(τ − dt), as described before, are, respectively,
```
the over- and under-approximation of the capture basin at τ − dt. Therefore, from
the algorithmic point of view,
```
z+(τ − dt) ≈ ViabΥ (K, z+(τ − 2 dt)) (46)
```
and
```
z−(τ − dt) ≈ CaptΥ (K, z+(τ − 2 dt)) (47)
```
with the following initial conditions:
```
z+(τ = 0) = z−(τ = 0) = [−ε, ε] (48)
```
The next section shows results we obtained in the specific context of the pursuit-
evasion game described in Sect. 2.
90 S. Le Ménec and V. Turetsky
3.6 Numerical Results
• Objectives
```
The purpose of the interval-based viability analysis (remaining part of the article)
```
is first to compute in an easy manner robust controllability domains, but also to redo
```
the same computations assuming bounded errors on z(τ ) (that regular construction
```
```
techniques are not able to do).
```
Figure 3 describes how viability kernel with target and capture basin algorithms
based on interval contractor programming are used to compute Robust Capture
```
Zone (RCZ). The numerical settings of Fig. 3 are data corresponding to an open
```
```
DGL1 (bang-bang) Optimal Capture Zone (OCZ), however, because the Pursuer
```
feedback strategy reaches the saturation limits when Time to Go is small only,
RZC is smaller and closed.
• Capture zones without noise
Figure 4 shows Robust Capture Zones in the case of perfect information. The μ and
ε numerical parameters are parameters leading to an open Optimal Capture Zone
when differential game bang-bang strategies are applied. Kinematics is DGL1
one. The robust control approach has been applied in both cases with P playing
```
the u p (t, z) = K (t) z(t f −t)α feedback control law. The top figure corresponds to Pur-
```
```
suer controls saturating all along the RCZ boundaries (K (t) = k = 10, α = 1),
```
```
the RCZ is then equal to the OCZ (Differential Game approach). The bottom
```
figure corresponds to Pursuer controls that do not saturate anymore all along the
```
RCZ boundaries (k = 0.01, α = 5). Both figures are computed following a RCZ
```
approach even if the attainability domain on the top figure is equal to the OCZ
one.
```
Figure 5 is still a case with perfect information; however, the numerical parameters
```
are DGL1 μ and ε data corresponding to the case of a close Optimal Capture
Fig. 3 Viability kernel with target and capture basin algorithms based on interval contractor pro-
gramming
Computation of Robust Capture Zones Using … 91
Fig. 4 RCZ in the case of
perfect information with
open OCZ parameters
Zone. The robust control approach has been applied in both cases with P playing
```
the u p (t, z) = K (t) z(t f −t)α feedback control law. The top figure corresponds to Pursuer
```
```
controls saturating all along the RCZ boundaries (k = 10, α = 1). The RCZ is then
```
```
equal to the OCZ (Differential Game approach). The bottom figure corresponds
```
to Pursuer controls that do not saturate anymore all along the RCZ boundaries
```
(k = 1, α = 5).
```
• Capture zones with noise
Figure 6 are DGL1 μ and ε parameters corresponding to the case of an open
```
OCZ (top figure) and to a close OCZ (bottom figure). RCZ approach has been
```
```
applied in both cases with P playing the u p (t, z) = K (t) z(t f −t)α feedback control law.
```
All the drawings correspond to Pursuer controls that do not saturate all along
the RCZ boundaries. The top figure corresponds to the case of time to go errors:
ˆt go = “noise_on_Tgo′′ . t go. The bottom figure corresponds to the case of errors
```
on the z state vector: ˆz(t go) = “noise_on_Z” . z(t go). The dotted lines show the
```
```
results we obtained without considering t go and z biases (bottom figures in Fig. 4
```
```
and Fig. 5).
```
The results show that over-estimation of t go or under-estimation of z imply lower
P controls than expected respect to OCZ. Therefore, RCZ are smaller than OCZ
```
(in the case of non-saturated feedback guidance laws). Under-estimation of t go or
```
92 S. Le Ménec and V. Turetsky
Fig. 5 RCZ in the case of
perfect information with
close OCZ parameters
Fig. 6 DGL1 RCZ with
noisy measurements, the top
figure is RCZ with time to go
errors. The bottom figure is
RCZ errors on the z state
vector. The dotted lines are
results without considering
t go and z biases
over-estimation of z saturate the P controls and increase the corresponding non-
```
noisy RCZ. Few noise on t go (+ 5%) may have a lot of impact on the shape of
```
```
RCZ (see Fig. 6).
```
Computation of Robust Capture Zones Using … 93
4 Conclusions
Interval viability algorithms are powerful techniques to compute capture basins of
complex dynamic systems as differential game capture zones, reachable sets, and
robust controllability domains. Algorithms to compute robust capture zones in the
case of saturated and non-saturated guidance laws have been used for scalar linear
```
systems. Results have been obtained in the case of noisy states as well (robust capture
```
```
domains also robust to noisy measurements). To consider a more realistic case of
```
refined noisy measurements that are outputs of Kalman filtering and not only rough
noise on the Zero-Effort-Miss. The interval viability approach that is not restricted to
linear systems and that can be applied to systems of larger dimensions with nonlinear-
ities including saturations and hybrid behaviors will be applied to compute nonlinear
noisy robust capture zones. The problem of computing robust capture zones that
```
corresponds to non-saturated guidance laws (non-saturated feedback forms) can be
```
also turned into a problem of viability. The problem of finding feedback guidance
law parameters to avoid pursuer control saturations can be also tackled following the
proposed approach.
Appendix
Robust Capture Zones: Main Results
In this section, the main results of [7] are briefly outlined. Consider a scalar system
```
˙z = h p (t)u p + h e(t)u e, z(t0) = z0, t0 ≤ t ≤ t f , (49)
```
```
where the measurable controls u p (t) and u e(t) satisfy the constraints
```
```
|u p | ≤ umaxp , (50)
```
```
|u e| ≤ umaxe . (51)
```
```
The feedback strategy u p = u p (t, z), given by a function, Lipschitz w.r.t. z, is called
```
```
robust capturing strategy (RCS) if it guarantees
```
```
z(t f ) = 0, (52)
```
```
for any measurable bounded u e(t), i.e., robustly w.r.t. to u e.
```
```
In what follows, the functions h p (t) and h e(t) satisfy the following assumption:
```
for some N p , N e ≥ 0 there exist finite limits C p , C e
```
limt→t f −0h i (t)(t
```
```
f − t)N i
```
```
= C i  = 0, i = p, e. (53)
```
94 S. Le Ménec and V. Turetsky
Linear Robust Capturing Strategies
Consider a linear strategy
```
u p (t, z) = K (t)z. (54)
```
Theorem 1 Let the following conditions hold.
```
(I) K (t)  = 0 for t ∈ [0, t f );
```
```
(II) K (t) is continuously differentiable for t ∈ [0, t f );
```
```
(III) one of two limit conditions is satisfied:
```
```
limt→t f −0 K (t) = ∞, (55)
```
or
```
limt→t f −0 K (t) = −∞; (56)
```
```
(IV) there exists N K > 1 such that
```
```
limt→t f −0˙K (t)(t f − t)N K = C  = 0; (57)
```
```
(V) either
```
```
N K > N p + 2, and CC p < 0, (58)
```
or
```
N K = N p + 2, and CC p < −(N K − 1)2; (59)
```
VI
```
N e ≥ N p . (60)
```
```
Then the strategy (54) is robust capturing.
```
Robust Capture Zone of Linear RCS
General Structure
Define the function
```
F(t, t0) =
```
```
umaxp − umaxe |K (t)|
```
t∫
t0
```
G(t, ξ )|h e(ξ )|dξ
```
```
|K (t)|G(t, t0) , t0 ∈ [0, t f ), (61)
```
Computation of Robust Capture Zones Using … 95
where
```
G(t, τ ) = exp
```
⎛
⎝
t∫
τ
```
K (η)h p(η)dη
```
⎞
```
⎠ . (62)
```
```
The robust capture zone Φz (u p (·)) = Φz (K (·)) of a linear robust transferring
```
```
strategy (54) is non-empty if and only if there exists t0 ∈ [0, t f ) such that
```
```
inft∈[t0 ,t f ) F(t, t0) ≥ 0. (63)
```
```
It is a closed set in the plane (t0, z0), symmetric with respect to the axis z0 = 0. It is
```
represented in a form
```
Φz (u p (·)) =
```
```
{
```
```
(t0, z0) ∈ D : t0 ∈ [tin , t f ), |z0| ≤ Z0(t0)
```
```
}
```
```
, (64)
```
```
where D = {(t, z) : t ∈ [0, t f ], z ∈ R},
```
```
Z0(t0) = inft∈[t0 ,t f ) F(t, t0), (65)
```
```
tin = min{t0 ∈ [0, t f ) : Z0(t0) ≥ 0}, (66)
```
Boundary
Define the function
```
P(t) = ddt
```
```
( umax
```
p
```
|K (t)|
```
```
)
```
```
− umaxp (signK (t))h p(t) − umaxe |h e(t)|. (67)
```
```
It is assumed that P(t) has a finite number of zeros (maybe none) on (0, t f ). Define
```
also the curve
```
z0 =
```
umaxp
```
|K (t0)| , t ∈ [0, t f ), (68)
```
and the limiting function
```
χ(t0) = limt→t f −0 F(t, t0). (69)
```
```
Case 1. Non-empty set of zeros of P(t) on (0, t f ).
```
Consider the subset
```
T = {t1 < t2 < ... < t p : P(t j ) = 0, P(t j − 0) < 0, P(t j + 0) > 0, j = 1, ..., p}.
```
```
(70)
```
96 S. Le Ménec and V. Turetsky
1.1. T  = ∅.
```
Let for each j = 1, ..., p, Z j (t0) be the solution of the boundary value problem
```
d Z j
```
dt0= K (t0)h p(t0)Z j (t0) + u
```
```
maxe |h e(t0)|, Z j (t j ) = umaxp
```
```
|K (t j )| , t0 ∈ [0, t j ]. (71)
```
```
1.1.1. P(t) > 0 for t ∈ (t p , t f ).
```
```
Theorem 2 In this case, the upper boundary of Φz (K (·) is a lower envelope of
```
```
p + 1 curves: the curve (68) and the curves z0 = Z j (t0), j = 1, ..., p, where Z j (t0)
```
```
are given by (71).
```
```
1.1.2. There exists ˆt ∈ (t p , t f ) such that P(t) < 0 for t ∈ (ˆt, t f ).
```
```
In this case, the limiting function (69) exists on some interval (˜t0, t f ) and satisfies
```
the differential equation
```
dχ(t0)
```
```
dt0= K (t0)h p (t0)χ(t0) + u
```
```
maxe |h e(t0)|, t0 ∈ (˜t0, t f ), (72)
```
and
```
limt0 →t f −0 χ(t0) = 0. (73)
```
```
Theorem 3 In this case, the upper boundary of Φz (K (·) is a lower envelope of
```
```
p + 2 curves: the curve (68), the curves z0 = Z j (t0), j = 1, ..., p, where Z j (t0) are
```
```
given by (71), and the limiting curve (69), t0 ∈ (˜t0, t f ).
```
1.2. T = ∅.
```
Theorem 4 In this case, the upper boundary of Φz (K (·) is a lower envelope of 2
```
```
curves: the curve (68) and the limiting curve (69) for t0 ∈ [tin , t f ).
```
```
Case 2. Empty set of zeros of P(t) on (0, t f ).
```
```
2.1. P(t) > 0 for t ∈ (0, t f ).
```
Theorem 5 In this case,
```
tin = 0, Z0(t0) =
```
umaxp
```
|K (t0)| . (74)
```
```
2.2. P(t) < 0 for t ∈ (0, t f ).
```
Theorem 6 In this case,
```
tin = tχin = inf{t0 ∈ (˜t0, t f ) : χ(t0) ≥ 0}, Z0(t0) = χ(t0). (75)
```
Computation of Robust Capture Zones Using … 97
Robust Capture Zone of Saturated Linear RCS
```
Remark 1 Based on a linear strategy (54), construct its saturated version
```
```
usatp (t, z) =
```
⎧
⎪⎪⎪
⎪⎨
⎪⎪⎪
⎪⎩
```
umaxp , K (t)z > umaxp ,
```
```
K (t)z, |K (t)z| ≤ umaxp
```
```
−umaxp , K (t)z < −umaxp
```
```
(76)
```
```
If (54) is robust capturing, then (76) is also robust capturing.
```
```
Denote Φsatz (K (·)) the robust capture zone of (76).
```
Robust Capture Zone Structure
```
Let z(t; t0, z0) denote the solution of the differential equation
```
```
˙z = h p(t)usat(t, z) + umaxe |h e(t)|, (77)
```
```
satisfying z(t0) = z0 . The robust capture zone Φsatz (K (·)) is closed set in the plane
```
```
(t0, z0) symmetric w.r.t. to the axis z0 = 0. It is given by
```
```
Φsatz (K (·)) = {(t0, z0) : t0 ∈ [t sin , t f ), |z0| ≤ Z s0(t0)}, (78)
```
where
```
t sin = min{t0 ∈ [0, t f ) : ∃z0 ≥ 0 : z(t f ; t0, z0) = 0}, (79)
```
```
Z s0(t0) = z(t0; t sin , z s0), (80)
```
```
z s0 = max{z0 ≥ 0 : z(t f ; t sin , z0) = 0}. (81)
```
Boundary
Define the function
```
Z m (t) =
```
t f∫
t
```
(
```
```
umaxp |h p(ξ )| − umaxe |h e(ξ )|
```
```
)
```
```
dξ. (82)
```
It is assumed that
```
Z m 1 Z m (t) has no more than a finite number of roots on [0, t f ];
```
98 S. Le Ménec and V. Turetsky
```
Z m 2 there exists δ ∈ (0, t f ) such that Z m (t) > 0 for t ∈ (t f − δ, t f ).
```
Define the moment
```
t min = sup{t ∈ [0, t f ) : Z m (t) < 0}, (83)
```
and the set
```
Φmz = {(t0, z0) : t0 ∈ [t min , t f ), |z0| ≤ Z m (t0)}. (84)
```
Then,
```
Φz (K (·)) ⊆ Φsatz (K (·)) ⊆ Φmz . (85)
```
Define the function
```
Ps (t) = Z m (t) −
```
umaxp
```
|K (t)| =
```
t f∫
t
```
P(ξ )dξ. (86)
```
```
Case 1. Ps (t)  = 0, t ∈ (0, t f ).
```
```
Theorem 7 Let t min = 0 and Z m (0) > 0. Then
```
```
Φsatz (K (·)) = Φmz , (87)
```
if and only if
```
Ps (t) > 0, t ∈ [0, t f ). (88)
```
```
Theorem 8 Let the function Z m (t) have no non-zero-crossing roots. Then
```
```
Φsatz (K (·) = Φz (K (·)), (89)
```
if
```
Ps (t) < 0, t ∈ (0, t f ). (90)
```
In this case,
```
Z s0(t0) = Z0(t0) = χ(t0). (91)
```
```
Case 2. There exists ˜t ∈ (0, t f ) such that Ps (˜t) = 0 and Ps (t)  = 0, t ∈ (˜t, t f ) .
```
```
Case 2.1. Ps (t) > 0, t ∈ (˜t, t f ). In this case,
```
```
Z s0(t0) =
```
⎧
⎨
⎩
```
Z m (t0), t0 ∈ (˜t, t f ),
```
```
˜Z (t0), t ∈ [t sin , ˜t],
```
```
(92)
```
Computation of Robust Capture Zones Using … 99
```
where ˜Z (t) is the solution of the differential equation
```
```
˙˜Z = h p(t)usat(t, ˜Z ) + umaxe |h e(t)|, ˜Z (˜t) = Z m (˜t) = umaxp
```
```
|K (˜t)| . (93)
```
```
If ˜Z (t) > 0 for t ∈ (0, t f ), then t sin = 0, otherwise, t sin is the first zero of ˜Z (t) from
```
the right.
```
Case 2.2. Ps (t) < 0, t ∈ (˜t, t f ). Let Φz (K (·)) is non-trivial, i.e., there exists tχin ∈
```
```
[0, t f ). Denote ¯t = max{˜t, tχin }. Then
```
```
Z s0(t0) =
```
⎧
⎨
⎩
```
χ(t0), t0 ∈ (¯t, t f ),
```
```
¯Z (t0), t ∈ [t sin , ˜t],
```
```
(94)
```
```
where ¯Z (t) is the solution of the differential equation
```
```
˙¯Z = h p (t)usat(t, ¯Z ) + umaxe |h e(t)|, ¯Z (¯t) = χ(¯t). (95)
```
```
If ¯Z (t) > 0 for t ∈ (0, t f ), then t sin = 0, otherwise, t sin is the first zero of ¯Z (t) from
```
the right.
References
1. J.-P. Aubin, A. Bayen, and P. Saint-Pierre. Viability Theory New Directions, Second Edition.
Number ISBN 978-3-642-16683-9. Springer-Verlag, Berlin Heidelberg, 2011.
2. Julien Alexandre Dit Sandretto and Alexandre Chapoutot. Validated explicit and implicit runge-
kutta methods. Reliable Computing, Special issue devoted to material presented at SWIM 2015,
22:078–103, 2016.
3. Jean-Pierre Aubin. Viability Theory. Birkhauser Boston Inc., Cambridge, MA, USA, 1991.
4. F. Blanchini. Set invariance in control. Automatica, 35(11):1747 – 1767, 1999.
5. N. D. Botkin, M. A. Zarkh, and V. S. Patsko. Numerical solution of linear differential games.
Lecture Notes in Control and Information Sciences, 156:226 – 234, 1991.
6. Gilles Chabert and Luc Jaulin. Contractor programming. Artificial Intelligence, Elsevier,
173:1079–1100, 2009.
7. V. Y. Glizer and V. Turetsky. Robust Controllability of Linear Systems. Nova Science Publishers
Inc., New York, NY, 2012.
8. L. Jaulin and E. Walter. Set inversion via interval analysis for nonlinear bounded-error estima-
```
tion. Automatica, 29(4):1053 – 1064, 1993.
```
9. N.N. Krasovskii and A.I. Subbotin. Game-Theoretical Control Problems. Springer Verlag, New
York, NY, 1988.
10. Stéphane Le Ménec. Interval computing of the viability kernel with application to robotic col-
lision avoidance. In Advances in Dynamic and Mean Field Games, pages 279–299. Birkhäuser
Boston, 2017.
11. J. Shinar. Solution techniques for realistic pursuit-evasion games. In C.T. Leondes, editor,
Advances in Control and Dynamic Systems, volume 17, pages 63 – 124. Academic Press, New
York, NY, 1981.
100 S. Le Ménec and V. Turetsky
12. J. Shinar and T. Shima. Nonorthodox guidance law development approach for intercepting
```
maneuvering targets. Journal of Guidance, Control, and Dynamics, 25(4):658 – 666, August
```
2002.
13. V. Turetsky and V.Y. Glizer. Continuous feedback control strategy with maximal capture zone
in a class of pursuit games. International Game Theory Review, 7, 2005.
14. V. Turetsky and J. Shinar. Missile guidance laws based on pursuit-evasion game formulations.
```
Automatica, 39(4):607 – 618, 2003.
```
Convergence of Numerical Method
for Time-Optimal Differential Games
with Lifeline
Nataly V. Munts and Sergey S. Kumkov
1 Introduction
This paper discusses time-optimal differential games with lifeline and numerical
scheme constructing the value function for such games. In games of this type, the
first player tends to lead the system to a prescribed closed target set while keeping
the trajectory inside some open set where the game takes place. The second player
hinders this, because it wins as soon as either the trajectory of the system leaves this
open set not touching the target one, or it succeeds in keeping the system infinitely
inside this open set.
Apparently, the first, who formulated a problem with lifeline, was R. Isaacs in
his book [20]. In his definitions, the lifeline is a set, after the reaching of which the
second player wins unconditionally. Significant contribution into research of games
```
with lifeline was made by L.A. Petrosyan (see e.g., [28]). However, the authors do not
```
know works, which would consider exhaustively games of this sort: L.A. Petrosyan
researched mostly problems with simple motion dynamics, that is, the problems
where the players’ controls are the velocities of the objects. In books [21, 22] of
N.N. Krasovskii and A.I. Subbotin, games with lifeline are analyzed as problems
with state constraints: the first player is not supposed to lead the system outside
a prescribed set. Also, problems with state constraints have been studied by many
```
authors (see, for example, [3, 10, 11, 19, 29]).
```
Problems very close to games with lifeline have been studied by French authors
P. Cardaliaguet, M. Quincampoix, P. Saint-Pierre [12–15]. For controlled systems on
N. V. Munts (B) · S. S. Kumkov
Krasovskii Institute of Mathematics and Mechanics, UrB RAS,
S. Kovalevskaya str., 16, 620990 Yekaterinburg, Russia
e-mail: natalymunts@gmail.com
S. S. Kumkov
e-mail: sskumk@gmail.com
```
© The Editor(s) (if applicable) and The Author(s), under exclusive license
```
to Springer Nature Switzerland AG 2020
D. M. Ramsey and J. Renault (eds.), Advances in Dynamic Games,
Annals of the International Society of Dynamic Games 17,
```
https://doi.org/10.1007/978-3-030-56534-3_5
```
101
102 N. V. Munts and S. S. Kumkov
the basis of the set-valued analysis, the theory of differential inclusions, and the
theory of viability, they analyze the sets where the controller is able to keep the system
```
infinitely (viability kernels). Passing to games, the authors consider a situation with
```
two target sets for the first and second players, respectively, to which the players
try to guide the system avoiding the target of the opposite player. Another variant
considered in these works is games with state constraints for the first player. In these
situations, the main objectives are to study victory domains of the players, that is,
the sets wherefrom the corresponding player can reach its target without hitting the
```
target of the opposite player (or state constraints). Also, in the terms of viability,
```
```
the upper value function of such games (the guaranteed result of the first player)
```
is characterized as a function, which epigraph is a viability set of the first player.
Grid-geometric algorithms are suggested for approximation of viability kernels and,
therefore, for approximation of the upper value. However, we have not found papers
of these authors where existence of the value function is proved for games of this
type and/or its coincidence with generalized solution of the corresponding boundary
```
value problem of a HJE is justified (although such a connection is mentioned).
```
The main boost that stimulated the authors to study time-optimal games with life-
line is the investigation of questions connected with numerical methods for solving
classic time-optimal games. In particular, in works [1, 2], Italian mathematicians
M. Bardi and M. Falcone together with their colleagues suggested a theoretic numer-
```
ical method for constructing the value function of a time-optimal game (without
```
```
lifeline) as a generalized (viscosity) solution of the corresponding boundary value
```
problem for HJE. The suggested procedure is of a grid type, and its proof is made
in assumption that the grid is infinite and covers the entire game space. But prac-
tical computer realization, apparently, deals with a finite grid, which covers only a
bounded part of the game space. So, the problem arises what boundary condition to
set on the outer boundary of the domain covered by the grid. M. Bardi and M. Falcone
suggest to set these conditions to plus infinity, that is, actually declaring that the sec-
ond player wins when reaching the outer boundary of this domain. Therefore, the
practical realization of the procedure solves a game with lifeline. That is why the
authors decided to fill this gap connected to the problems with lifeline in a very
general formulation.
Also, there is one more grid method for solving time-optimal problems suggested
by authors from Germany. In works by N. Botkin, K.-H. Hoffmann, V. Turova, and
their colleagues, a numerical procedure is suggested, which is based on a so-called
upwind operator involving approximations for left and right partial derivatives of
```
the value function in a node (see, for example, [7–9]). This algorithm is applicable to
```
problems with state constraints for the first player, which can be treated as problems
with lifeline.
This paper provides a numerical method for constructing the value function of a
time-optimal game with lifeline as a viscosity solution of the corresponding bound-
ary value problem for HJE. A pointwise convergence of the numerical method to the
value function is proved. The method is just the one suggested by the Italian mathe-
maticians, but its convergence should be proved anew in the framework of the new
formulation. Also, theorems on coincidence of the value functions of time-optimal
Convergence of Numerical Method for Time-Optimal … 103
problems with and without lifeline are proved under a very important assumption
that the value function is continuous in the domain where the game takes place. The
coincidence of the limit of discrete numerical solutions with the value function needs
such a continuity. The continuity can be derived, in particular, from the assumptions
of the local dynamic advantage of one player over another near their sets: if the
system position is close to the target set, then the first player can guide the system to
```
this set; vice versa, if the system is close to the lifeline, then the second player can
```
push it to the lifeline. These assumptions have been taken for the proof of existence
of the generalized solution justified in other papers [24–26] by the authors.
The structure of this paper is as follows. In Sect. 2, the formulation of the prob-
lem is given. Section 3 deals with the formulation of the numerical scheme and the
convergence of computations performed according to it. In Sect. 4, a proof of con-
vergence of the functions obtained as a result of the computations to the viscosity
solution of the corresponding boundary value problem for the HJE coincides with
the value function of the original game. Section 5 contains discussion on coincidence
of the value function of time-optimal differential games with and without lifeline. In
Sect. 6, one can see results of numerical computations performed by the realization
of the numerical procedure. The paper is finalized by a conclusion.
2 Problem Formulation
Let us consider a conflict controlled system
```
˙x = f (x, a, b), t ≥ 0, a ∈ A, b ∈ B, (1)
```
```
where x ∈ Rn is the phase vector of the system; a and b are the controls of the first and
```
second players constrained by the compact sets A and B in their Euclidean spaces.
We are given a compact set T and an open set W ⊂ Rn such that T ⊂ W and the
```
boundary ∂W is bounded. Denote G := W \ T and F := Rn \ W (see Fig. 1). The
```
```
game takes place in the set G ; the objective of the first player is to guide the system to
```
```
the set T as soon as possible keeping the trajectory outside the set F ; the objective
```
of the second player is to guide the system to the set F , or if it is impossible, to keep
the trajectory inside the set G forever, or if the latter is impossible too, to postpone
reaching the set T as long as he can.
```
Such a game can be called a game with lifeline; the boundary ∂F of the set F is
```
the lifeline where the second player wins unconditionally.
We assume that the following conditions are fulfilled:
C.1 The function f : Rn × A × B → Rn is continuous in all variables and Lipschitz
```
continuous in the variable x: for all x(1), x(2) ∈ Rn , a ∈ A, b ∈ B
```
∥∥
```
f (x(1) , a, b) − f (x(2) , a, b)
```
∥∥
```
≤ L‖x(1) − x(2)‖; (2)
```
104 N. V. Munts and S. S. Kumkov
Fig. 1 Sets T , F , and G
moreover, it satisfies Isaacs’ condition:
mina∈A maxb∈B
〈
```
p, f (x, a, b)
```
〉
= maxb∈B mina∈A
〈
```
p, f (x, a, b)
```
〉
```
∀ p ∈ Rn . (3)
```
Here and below, the symbol 〈·, ·〉 stands for the scalar product.
```
C.2 The boundary ∂G of the set G (that is the boundaries ∂T and ∂F ) is compact,
```
smooth, and has a bounded curvature.
Remark. In our previous paper [26], we do not demand the boundedness of
the curvature of G . When that paper was written, we thought that a sufficient
smoothness of the boundary provides the boundedness of its curvature. It is
necessary to prove existence of a generalized solution of the corresponding
boundary problem of a Hamilton–Jacobi equation. However, after consultations
with specialists in topology, it turned out that even infinitely smooth bounded
curve in the plane can have an unbounded curvature. So, this demand should be
formulated explicitly.
C.3 One can find a constant c > 0 and a bounded uniformly continuous function
```
η : cl G ∩ O(∂G , c) → Rn such that the embedding O
```
```
(
```
```
x + tη(x), ct
```
```
)
```
⊆ G is
```
true for all x ∈ cl G ∩ O(∂G , c) and 0 < t ≤ c. Here and below, O(y, r) is
```
```
an open ball of the radius r with the center at the point y, O(X, r) :=
```
```
{
```
```
x :
```
```
dist(x, X) < r
```
```
}
```
```
and O(∅, R) = ∅.
```
Remark. It seems to us that the latter condition C.3 follows from the previous
one C.2, but now we have no proof of this implication. So, we explicitly demand
existence of the function η, which is called the generalized normal.
The players’ aims of the mentioned kind can be formalized in the following way.
```
Let the function x(·; x0) be a trajectory of the system emanated from the initial point
```
```
x(0) = x0 . We consider two instants
```
t∗ = t∗
```
(
```
```
x(·, x0)
```
```
)
```
= min
```
{
```
```
t ≥ 0 : x(t; x0) ∈ T
```
```
}
```
,
t∗ = t∗
```
(
```
```
x(·, x0)
```
```
)
```
= min
```
{
```
```
t ≥ 0 : x(t; x0) ∈ F
```
```
}
```
,
```
which are the instants when the trajectory x(·; x0) hits for the first time the sets T and
```
```
F , respectively. If the trajectory doesn’t arrive at the set T (F ), then the value t∗
```
```
(t∗) is equal to +∞.
```
Convergence of Numerical Method for Time-Optimal … 105
To say what is a system trajectory, one can use either the formalization with
nonanticipating strategies, or the positional formalization of N.N. Krasovskii and
A.I. Subbotin [21, 22]. In the latter case, the feedback strategies of the first and the
```
second player are functions a(·) : Rn → A and b(·) : Rn → B, respectively.
```
```
We define the result of the game on the trajectory x(·; x0) as
```
τ
```
(
```
```
x(·; x0)
```
```
)
```
=
```
{
```
+∞, if t∗ = +∞ or t∗ < t∗,
```
t∗, otherwise. (4)
```
In [23], the authors prove that a time-optimal problem with lifeline has the value
```
function T (x).
```
The unboundedness of the value function and cost functional can cause some
```
uneasiness of a numerical research of game (1), (4). For this reason, one often sub-
```
stitutes the unbounded cost functional with a bounded one by means of the Kruzhkov’s
```
transform:
```
J
```
(
```
```
x(·, x0)
```
```
)
```
=
```
{
```
1 − exp
```
(
```
−τ
```
(
```
```
x(·; x0)
```
```
))
```
, if τ
```
(
```
```
x(·; x0)
```
```
)
```
< +∞,
```
1, otherwise. (5)
```
```
In such a case, the value function v(x) also becomes bounded and its magnitude
```
belongs to the range from zero to one:
```
v(x) =
```
```
{
```
1 − exp
```
(
```
```
− T (x))
```
```
)
```
```
, if T (x) < +∞,
```
```
1, otherwise. (6)
```
3 Numerical Scheme
In general, the numerical scheme construction and justification of its convergence
are analogous to the ones in paper [2] where the numerical scheme for the classic
time-optimal problem is constructed and its convergence is proved. Herewith, the
```
value function is characterized as the unique generalized (viscosity) solution of the
```
corresponding boundary value problem for HJE.
3.1 Discrete Scheme
Let us replace the continuous dynamics with a discrete one by the time step h > 0:
```
x n = x n−1 + h f (x n−1, a n−1, bn−1), n = 1, . . . , N , x0 is given,
```
where a n ∈ A and bn ∈ B.
106 N. V. Munts and S. S. Kumkov
By the discrete Dynamic Programming Principle, one can get the following char-
```
acterization for the value function w h (·) of the discrete time problem:
```
```
w h (x) =
```
⎧
⎪⎨
⎪⎩
γ maxb∈B mina∈A w h
```
(
```
```
z(x, a, b)
```
```
)
```
- 1 − γ, if x ∈ G ,
0, if x ∈ T ,
1, if x ∈ F .
```
Here, γ = e−h , z(x, a, b) = x + h f (x, a, b).
```
Further, let us describe the space discretization. Let us consider a grid L with the
```
step k, which covers the entire space Rn and consists of nodes q i1 ,...,i n = (x i1 , . . . , x i n ),
```
```
i1, . . . , i n ∈ Z, x i j = ki j . (Generally speaking, steps along different axes can differ,
```
```
but this fact doesn’t change the main idea of the numerical scheme construction.)
```
Here and below, mostly, a linear indexation qν , ν ∈ Z, for the nodes of the grid L
is used. The symbol LT stands for the set of those nodes of the grid L , which
```
belong to the set T ; the symbol LG denotes the collection of nodes falling into the
```
```
set G ; and the symbol LF stands for the set of nodes from the set F . In theoretical
```
constructions, the grid is assumed infinite.
```
For every point x ∈ Rn , one can find a simplex S(x) with vertices
```
```
{
```
```
ql (x)
```
```
}
```
from L
```
such that the point x belongs to the simplex S(x) and S(x) does not contain other
```
nodes of the grid. It is assumed that with choosing the grid L , we also choose a
separation of the game space to simplices with their vertices at nodes of the grid.
```
On the basis of S(x), one can obtain the barycentric (local) coordinates λl (x) of the
```
```
point x with respect to the vertices ql (x) of the simplex S(x):
```
```
x =
```
n+1∑
```
l=1
```
```
λl (x)ql (x), λl (x) ≥ 0,
```
n+1∑
```
l=1
```
```
λl (x) = 1.
```
Sometimes, the arguments of the coefficients λ and vertices q will be omitted if they
are clear from the context.
```
Let us substitute the function w h (·) with a new one w(·), which magnitudes w(qν )
```
at the nodes qν of the grid L form an infinite vector W =
```
(
```
```
w(qν )
```
```
)
```
ν∈Z. The magni-
```
tude w(x) at some point x, which is not a node of the grid, can be reconstructed by
```
means of the following piecewise-linear approximation based on the local coordi-
nates of the point x:
```
wloc(x, W ) =
```
n+1∑
```
l=1
```
```
λl (x) w
```
```
(
```
```
ql (x)
```
```
)
```
```
. (7)
```
Hereby, the characterization of the value function of a fully discrete problem is
```
obtained:
```
Convergence of Numerical Method for Time-Optimal … 107
```
w(qν ) =
```
⎧
⎪⎨
⎪⎩
γ maxb∈B mina∈A wloc
```
(
```
```
z(qν , a, b), W
```
```
)
```
- 1 − γ, if qν ∈ LG ,
0, if qν ∈ LT ,
1, if qν ∈ LF .
```
This characterization is of a recursive kind, because the magnitude w(qν ) at some
```
node qν depends on the magnitude of the local reconstruction wloc. Note that the latter
```
in its turn depends on the magnitudes of the function w(·) at nodes of the grid, which
```
may include the node qν . Such kind of relations obtained is typical for the dynamic
programming principle. In the following, on the basis of this formula, an iterative
numerical method for construction of the vector W and function w is proposed.
```
Moreover, from the definition of w(·), one can see that in a practical realization of
```
the numerical method, it is necessary to remember values of this function only at the
nodes from LG . If the set G is bounded, then LG contains only finite number of
nodes and can be represented in a computer.
```
For the chosen grid L = {qν }ν∈Z, we denote by M the set of infinite vectors with
```
the elements W =
```
(
```
```
w(qν )
```
```
)
```
ν∈Z. We denote by M1 those vectors in the set M , which
```
elements w(qν ) satisfy the inequality 0 ≤ w(qν ) ≤ 1. For every s ∈ Z, we define an
```
operator Fs : M → R using a vector W =
```
(
```
```
w(qν )
```
```
)
```
ν∈Z in the following way:
```
Fs (W ) =
```
⎧
⎪⎨
⎪⎩
γ maxb∈B mina∈A wloc
```
(
```
```
z(q s , a, b), W
```
```
)
```
- 1 − γ, if q s ∈ LG ,
0, if q s ∈ LT ,
1, if q s ∈ LF .
```
Here, wloc : Rn × M → R is the local reconstruction (7) of the function w(·) cor-
```
responding to the vector W . The manifold of values of the operators Fs over all
```
indices s (that is, over all nodes q s ) defines an operator F : M → M .
```
A partial order can be defined in the set M using the elementwise comparison:
```
W1 ≤ W2 ⇔ ∀ν ∈ Z w1(qν ) ≤ w2(qν ). Also, in M1 , one can reasonably introduce
```
the norm ‖W ‖∞ = sup
```
{
```
```
w(qν ) : ν ∈ Z
```
```
}
```
.
Let us prove the following lemma on properties of the operator F analogous to
the one from paper [2, pp. 124–125, Proposition 2.1].
Lemma 1 The operator F : M → M has the following properties:
1. F(M1) ⊆ M1;
2. F is monotone with respect to the partial order in M ;
3. F is a contraction map in M1 with respect to the norm ‖ · ‖∞.
Proof Basically, the proof repeats the analogous one in [2, pp. 124–125].
1. Let W ∈ M1 and q s ∈ LG . Then
```
Fs (W ) = γ maxb∈B mina∈A
```
n+1∑
```
m=1
```
λm
```
(
```
```
z(q s , a, b)
```
```
)
```
W m
```
(
```
```
z(q s , a, b)
```
```
)
```
- 1 − γ.
108 N. V. Munts and S. S. Kumkov
```
Here, W m (z) is the element of the vector W corresponding to the node, which is
```
the mth vertex of the simplex S
```
(
```
```
z(q s , a, b)
```
```
)
```
.
Since, λm
```
(
```
```
z(q s , a, b)
```
```
)
```
≥ 0, ∑ λm
```
(
```
```
z(q s , a, b)
```
```
)
```
= 1, and 0 ≤ W m ≤ 1, we have
```
0 ≤ Fs (W ) ≤ γ maxb∈B mina∈A
```
n+1∑
```
m=1
```
λm
```
(
```
```
z(q s , a, b)
```
```
)
```
- 1 − γ = γ + 1 − γ = 1.
```
If q s /∈ LG , then Fs (W ) = 0 or Fs (W ) = 1. Hence, it appears that F : M1 →
```
M1 .
2. Let U, V ∈ M and U ≥ V . If q s ∈ LG , then
```
Fs (V ) − Fs (U ) = γ maxb∈B mina∈A
```
n+1∑
```
m=1
```
λm
```
(
```
```
z(q s , a, b)
```
```
)
```
Vm
```
(
```
```
z(q s , a, b)
```
```
)
```
− γ maxb∈B mina∈A
n+1∑
```
m=1
```
λm
```
(
```
```
z(q s , a, b)
```
```
)
```
U m
```
(
```
```
z(q s , a, b)
```
```
)
```
.
```
Let us choose the control a(b) of the first player attaining the minimum in Fs (U )
```
```
for a fixed b. Then the minuend in the inequality increases, because a(b) not
```
```
necessarily attains the minimum in Fs (V ), while the subtrahend keeps its value.
```
We get
γ maxb∈B mina∈A
n+1∑
```
m=1
```
λm
```
(
```
```
z(q s , a, b)
```
```
)
```
Vm
```
(
```
```
z(q s , a, b)
```
```
)
```
− γ maxb∈B mina∈A
n+1∑
```
m=1
```
λm
```
(
```
```
z(q s , a, b)
```
```
)
```
U m
```
(
```
```
z(q s , a, b)
```
```
)
```
≤ γ maxb∈B
n+1∑
```
m=1
```
λm
```
(
```
z
```
(
```
```
q s , a(b), b
```
```
))
```
Vm
```
(
```
z
```
(
```
```
q s , a(b), b
```
```
))
```
− γ maxb∈B
n+1∑
```
m=1
```
λm
```
(
```
z
```
(
```
```
q s , a(b), b
```
```
))
```
U m
```
(
```
z
```
(
```
```
q s , a(b), b
```
```
))
```
.
Now, let us consider the control b of the second player attaining the maximum in
the expression for the minuend, that is,
b ∈ Arg maxb∈B
[
γ
n+1∑
```
m=1
```
λm
```
(
```
z
```
(
```
```
q s , a(b), b
```
```
))
```
Vm
```
(
```
z
```
(
```
```
q s , a(b), b
```
```
))]
```
.
Convergence of Numerical Method for Time-Optimal … 109
It follows that
γ maxb∈B
n+1∑
```
m=1
```
λm
```
(
```
z
```
(
```
```
q s , a(b), b
```
```
))
```
Vm
```
(
```
z
```
(
```
```
q s , a(b), b
```
```
))
```
− γ maxb∈B
n+1∑
```
m=1
```
λm
```
(
```
z
```
(
```
```
q s , a(b), b
```
```
))
```
U m
```
(
```
z
```
(
```
```
q s , a(b), b
```
```
))
```
≤ γ
n+1∑
```
m=1
```
λm
```
(
```
z
```
(
```
```
q s , a(b), b
```
```
))(
```
Vm
```
(
```
z
```
(
```
```
q s , a(b), b
```
```
))
```
− U m
```
(
```
z
```
(
```
```
q s , a(b), b
```
```
)))
```
≤ 0.
```
If q s ∈ LT or q s ∈ LF , then Fs (V ) − Fs (U ) = 0. Hence, F is the monotone
```
operator.
3. Let U, V ∈ M1 . If q s ∈ LG , then
∣∣F
```
s (V ) − Fs (U )
```
∣∣ ≤ γn+1∑
```
m=1
```
```
λm(z(q s , a(b), b))
```
```
× ∣∣Vm(z(q s , a(b), b)) − U m(z(q s , a(b), b))∣∣
```
```
≤ γ maxm∣∣Vm(z(q s , a(b), b)) − U m(z(q s , a(b), b))∣∣
```
×
n+1∑
```
m=1
```
```
λm(z(q s , a(b), b)) ≤ γ‖V − U ‖∞.
```
It holds for every s ∈ Z.
```
If q s ∈ LT or q s ∈ LF , then Fs (V ) − Fs (U ) = 0. So, it immediately follows
```
that the function F is a contraction map, since γ = e−h < 1.
As a consequence from this lemma, one can obtain that there exists a unique
```
fixed point W ∈ M1 of the operator F, which determines a function w(·) in Rn ,
```
```
w(x) ∈ [0, 1]. This function depends on the time h and space k discretization steps
```
of the original problem:
```
w(x) =
```
⎧
⎪⎪⎪
⎪⎪⎨
⎪⎪⎪
⎪⎪⎩
∑
m
```
λm w(q m ), if x /∈ L and x = ∑
```
m
λm q m ,
γ maxb∈B mina∈A wloc
```
(
```
```
z(q s , a, b), W
```
```
)
```
- 1 − γ, if q s ∈ LG ,
0, if q s ∈ LT ,
1, if q s ∈ LF .
```
(8)
```
110 N. V. Munts and S. S. Kumkov
3.2 Viscosity Solution of Boundary Problem for HJE
Let us consider the following boundary value problem for HJE:
```
z + H (x, Dz) = 0, x ∈ G ,
```
```
z(x) = 0 if x ∈ ∂T , (9)
```
```
z(x) = 1 if x ∈ ∂F .
```
Here and below, the symbol Dz denoted the gradient of the function z. The function H
```
is called the Hamiltonian and in the case of dynamics (1) is defined as follows:
```
```
H (x, p) = maxa∈A minb∈B
```
〈
```
p, − f (x, a, b)
```
〉
```
− 1, x, p ∈ Rn . (10)
```
Equations of this type can have no classical solution. That is why we use the notion
of the generalized viscosity solution introduced in [17] to deal with this problem.
In book [30], an alternative method of obtaining a generalized solution of HJE was
introduced. It is called the generalized minimax solution. Also in book [30], it is
proved that viscosity and minimax solutions coincide at the points of continuity.
```
In [24, 25], the authors prove that the value function of game (1), (5) is a vis-
```
```
cosity solution of problem (9). The proof demands smoothness of boundaries ∂T
```
and ∂F , the boundedness of these boundaries curvature. It was performed under
the assumption of the dynamical advantage of each player on the boundaries of the
corresponding sets:
∀x ∈ ∂T mina∈A maxb∈B
〈
```
nT (x), f (x, a, b)
```
〉
< 0,
∀x ∈ ∂F maxb∈B mina∈A
〈
```
nF (x), f (x, a, b)
```
〉
```
< 0. (11)
```
```
Here, nT (x)
```
```
(
```
```
nF (x)
```
```
)
```
```
is a normal vector to the boundary ∂T (∂F ) of the set T (F )
```
```
at the point x directed outward the corresponding set or (what is the same) inward
```
the set G . The sense of these relations is that if the system is at the boundary of the
```
set T (F ), then the first (second) player can guarantee leading the trajectory of the
```
system inside the corresponding set despite the action of the opponent. Combination
of these assumptions results in the continuity of the value function inside the set G .
Indeed, from the results of paper [26], it follows that under these assumptions an
upper generalized solution exists, which is continuous in cl G . Then, the statements
in [30, Sect. 18.6, pp. 224–225] imply that a generalized solution exists, which is
continuous in G . Moreover, since the value function coincides with the generalized
```
solution, it is continuous too (the coincidence is proved in [26]).
```
```
Definition 1 ([2], p. 112, Definition 1.3) For some domain Ω, an upper semicon-
```
```
tinuous function u(·) is called a viscosity subsolution of Eq. (9) in the domain Ω if
```
```
for all ϕ ∈ C1(Ω) and for any local maximum point y ∈ Ω for u − ϕ, the inequal-
```
```
ity u(x) + H
```
```
(
```
```
x, Dϕ(x)
```
```
)
```
 0 holds.
Convergence of Numerical Method for Time-Optimal … 111
```
Definition 2 ([2], p. 112, Definition 1.3) For some domain Ω, a lower semicontin-
```
```
uous function u(·) is called a viscosity supersolution of Eq. (9) in the domain Ω if
```
```
for all ϕ ∈ C1(Ω) and for any local minimum point y ∈ Ω for u − ϕ, the inequal-
```
```
ity u(x) + H
```
```
(
```
```
x, Dϕ(x)
```
```
)
```
 0 holds.
Definition 3 Let us consider two sequences of real numbers h n > 0 and k n > 0
```
(which are time and space discretization steps). We will refer to them as admissible
```
sequences if h n → 0 and k n / h n → 0 as n → ∞.
Let us consider admissible sequences of real numbers h n > 0, k n > 0, and a
```
sequence of the solutions wn of problem (8) corresponding to these admissible
```
sequences.
The proof of the facts given in the next section is based on the notion of the weak
limit in the viscosity sense introduced in [1, 6]. An upper and a lower limit of the
functional sequence wn in the viscosity sense are defined as follows:
lim sup
```
(y,n)→(x,∞)
```
```
wn (y) := limδ→0+ sup
```
```
{
```
```
wn (y) : |x − y| ≤ δ, n ≥ 1/δ
```
```
}
```
,
```
lim inf(y,n)→(x,∞) wn (y) := limδ→0+ inf
```
```
{
```
```
wn (y) : |x − y| ≤ δ, n ≥ 1/δ
```
```
}
```
```
. (12)
```
Note that these limits exist if the functional sequence wn is locally uniformly
bounded [1, p. 288, Definition 1.4].
Definition 4 For some domain Ω, an upper semicontinuous function u : cl Ω →
```
R satisfies the boundary condition u + H (x, Du) ≤ 0 at the boundary ∂Ω in the
```
```
viscosity sense if for all ϕ ∈ C1(cl Ω) and a point x ∈ ∂Ω such that the function
```
```
u − ϕ has a local maximum at x, the inequality u(x) + H (x, Dϕ(x)) ≤ 0 holds.
```
Definition 5 For some domain Ω, a lower semicontinuous function u : cl Ω →
```
R satisfies the boundary condition u + H (x, Du) ≥ 0 at the boundary ∂Ω in the
```
```
viscosity sense if for all ϕ ∈ C1(cl Ω) and a point x ∈ ∂Ω such that the function
```
```
u − ϕ has a local minimum at x, the inequality u(x) + H (x, Dϕ(x)) ≥ 0 holds.
```
4 Numerical Scheme Convergence
Let us formulate and prove a lemma for a time-optimal game with lifeline analogous
to [2, p. 127, Lemma 2.2]. Some derivations in the original lemma were omitted.
For example, the proof for an upper solution was absent, proof of the inequalities
```
analogous to (19) and (20) from this paper was not completely performed, and some
```
```
essential remarks were missed (e.g., in the original lemma the function ϕ is defined
```
on the closure of the set of the game but is used in a such a way that it is defined on
```
the whole Rn ).
```
Lemma 2 Let us consider admissible sequences of real numbers h n > 0 and k n > 0,
```
and let wn be the corresponding sequence of solutions (8). Denote
```
112 N. V. Munts and S. S. Kumkov
```
v(x) := lim sup
```
```
(y,n)→(x,∞)
```
```
wn (y), v(x) := lim inf(y,n)→(x,∞) wn (y). (13)
```
Then the functions v and v are, respectively, a viscosity subsolution and supersolution
```
of the boundary value problem (9) with the boundary conditions
```
```
v ≥ 0 on ∂T , (14)
```
v ≤ 0 or v + H
```
(
```
```
x, Dv(x)
```
```
)
```
```
≤ 0 on ∂T , (15)
```
v ≥ 1 or v + H
```
(
```
```
x, Dv(x)
```
```
)
```
```
≥ 0 on ∂F , (16)
```
```
v ≤ 1 on ∂F . (17)
```
```
The second inequalities in (15) and (16) are understood in the viscosity sense.
```
```
Proof Proofs of the facts that the boundary conditions (14), (15) are fulfilled and
```
that v is a viscosity subsolution are similar to those from [2, pp.127–129]. The
```
fulfilment of the last boundary condition (17) is obvious from the construction of the
```
```
function v. Therefore, it is necessary to show only that the function v is a viscosity
```
```
supersolution and that the boundary condition (16) holds. Let us prove these facts
```
```
simultaneously (in (16), we prove the second inequality).
```
```
Choose a function ϕ ∈ C1(Rn ) and a point y ∈ cl G such that the function v − ϕ
```
attains the local strict minimum at the point y. Although, the function ϕ in the
definition of the viscosity solution is considered only at the set cl G , we define it in
```
the whole space Rn , because we shall need it henceforth; restriction of the function
```
ϕ to the set cl G is smooth. As far as the property of the point y doesn’t change under
```
adding a constant to the function ϕ, we consider that ϕ(y) = v(y). The point y can
```
belong to the set G or to the boundary ∂F . The case when the point y belongs to
the boundary ∂T does not require consideration, because it is taken into account in
```
condition (14). If y ∈ ∂F and v(y) ≥ 1, then inequality (16) holds. Thus hereafter,
```
```
we shall assume that v(y) < 1 if y ∈ ∂F and v(y) ≤ 1 if y ∈ G .
```
```
It has to be shown that v(y) + H
```
```
(
```
```
y, Dϕ(y)
```
```
)
```
≥ 0. Let us choose a sequence of
points x n such that
min
cl
```
(
```
```
G ∩B(y,1)
```
```
)(wn − ϕ) = (wn − ϕ)(x n ).
```
The basic property of weak limits in the viscosity sense [1, 5, 18] is the existence
```
of a subsequence (we suppose that it is the sequence x n itself) such that x n →
```
```
y and wn (x n ) → v(y) as n → ∞. It means that one can choose such a number
```
```
ε > 0 that B(y, ε) ⊂ G if y ∈ G or ϕ(y′) < 1 − ε for every y′ ∈ B(y, ε) if y ∈
```
∂F . It can always be achieved by means of decreasing ε, because if y ∈ ∂F , then
```
ϕ(y) = v(y) < 1. Moreover, one can choose such a sufficiently big number n that
```
the following inequalities hold
```
(a) x n ∈ B(y, ε/3) holds, because x n converges to the point y as n → ∞;
```
```
(b)
```
∣∣
```
h n f (x n , a, b)
```
∣∣
```
≤ ε/3 holds, because h n tends to 0;
```
Convergence of Numerical Method for Time-Optimal … 113
```
(c) k n · max
```
```
{
```
2 + σ,
√
d
```
}
```
```
≤ ε/3 holds, because the sequence k n tends to 0; here,
```
σ = max
```
{∣∣
```
```
Dϕ(z)
```
∣∣
```
: z ∈ B(y, 1)
```
```
}
```
```
;
```
```
(d) ϕ(x n ) − wn (x n ) > −ε holds, because we assume that ϕ(y) = v(y); hence,
```
```
ϕ(x n ) < wn (x n ) (as ϕ(y′) < v(y′) and v(y′) ≤ wn (y′) for all y′ in some suf-
```
```
ficiently small neighborhood of the point y; the points x n belong to this neigh-
```
```
borhood for indices n starting from some sufficiently large index).
```
The following calculations are made for n fixed, so we temporarily omit the
subscript in h n , k n , wn , x n , γn = e−h n .
1. Let y ∈ G . Let us write the local coordinates of the point x via the vertices q s
```
of the corresponding simplex: x = ∑s λs q s . Note that q s ∈ B(y, ε), because x ∈
```
```
B(y, ε/3) and q s ∈ B(x, ε/3) (the latter is true due to k
```
√
```
d ≤ ε/3). So, q s ∈ G ,
```
```
whence it follows that for w(q s ) the following representation holds
```
```
w(q s ) = γ maxb∈B mina∈A wloc
```
```
(
```
```
z(q s , a, b), W
```
```
)
```
- 1 − γ.
2. Let y ∈ ∂F . Then −ε < ϕ(x) − w(x) < 1 − ε − w(x) ⇒ w(x) < 1. So, if x =∑
```
s λs q s , then there exists a node q s such that λs  = 0 and w(q s ) < 1. Then again
```
```
for w(q s ), the following representation holds
```
```
w(q s ) = γ maxb∈B mina∈A wloc
```
```
(
```
```
z(q s , a, b), W
```
```
)
```
- 1 − γ.
Let us note that
```
w(q s ) = γ maxb∈B mina∈A wloc
```
```
(
```
```
z(q s , a, b), W
```
```
)
```
- 1 − γ
≥ γ mina∈A wloc
```
(
```
```
z(q s , a, b), W
```
```
)
```
- 1 − γ
```
for every b ∈ B. Moreover, for every ρ > 0, there exists a value a s (ρ) (for example,
```
```
the one attaining the minimum) such that the following inequality holds
```
γ mina∈A wloc
```
(
```
```
z(q s , a, b), W
```
```
)
```
- 1 − γ > γwloc
```
(
```
z
```
(
```
```
q s , a s (ρ), b
```
```
)
```
, W
```
)
```
- 1 − γ − ρh.
```
We denote by z s (ρ, b) = z
```
```
(
```
```
q s , a s (ρ), b
```
```
)
```
= q s + h f
```
(
```
```
q s , a s (ρ), b
```
```
)
```
. Whence it follows
that for every ρ > 0 the relation holds
```
w(q s ) − γwloc
```
```
(
```
```
z s (ρ, b), W
```
```
)
```
```
− (1 − γ) > −ρh ∀b ∈ B. (18)
```
Let z s = ∑p μp q p and b is arbitrary. Now, let us prove that
```
w(x) − ϕ(x) ≤ wloc
```
```
(
```
```
z s (ρ, b), W
```
```
)
```
− ϕ
```
(
```
```
z s (ρ, b)
```
```
)
```
- σk
√
```
d + o1, (19)
```
114 N. V. Munts and S. S. Kumkov
```
where o1 = o(
```
∣∣
```
z s (ρ, b) − q p
```
∣∣
```
) and q p is such a vertex of the simplex S
```
```
(
```
```
z s (ρ, b)
```
```
)
```
```
that ϕ(q p ) is the minimum magnitude of ϕ over the vertices of this simplex. Here
```
and below, all o-variables are considered as n → ∞.
```
If z s (ρ, b) ∈ cl G , then, in virtue of condition (c), we obtain z s (ρ, b) ∈ B(q s , ε/3).
```
```
Since q s ∈ B(x, ε/3), one has z s (ρ, b) ∈ B(x, 2ε/3) ⊂ B(x, ε). In this case, inequal-
```
```
ity (19) holds, because x is the point of a local minimum of the function w − ϕ.
```
```
Now, let z s (ρ, b) /∈ cl G . Two cases are possible
```
1. There is a term in the representation of z s such that μp  = 0 and q p ∈ cl G .
Then, similarly, we get q p ∈ B
```
(
```
```
z s (ρ, b), ε/3
```
```
)
```
```
, z s (ρ, b) ∈ B(q s , ε/3), and q s ∈
```
```
B(x, ε/3). Hence, q p ∈ B(x, ε). From this, it follows that w(x) − ϕ(x) ≤ w(q p ) −
```
```
ϕ(q p ), because x is the point of a local minimum of the function w − ϕ.
```
2. For all p such that μp  = 0, one has that q p /∈ cl G . Recall that the function ϕ
```
is defined on the whole space Rn and that for every y′ ∈ B(y, ε) the condition
```
```
ϕ(y′) < 1 − ε holds. Then, in virtue of condition (d), we get
```
```
w(x) − ϕ(x) < ε < 1 − ϕ(q p ) = w(q p ) − ϕ(q p ),
```
```
because the function w(q p ) = 1 at the node q p ∈ F .
```
Then
```
w(x) − ϕ(x) ≤
```
∑
p
μp
```
(
```
```
w(q p ) − ϕ(q p )
```
```
)
```
=
∑
p
```
μp w(q p ) −
```
∑
p
```
μp ϕ(q p )
```
≤ wloc
```
(
```
```
z s (ρ, b), W
```
```
)
```
−
∑
p
```
μp ϕ(q p ) = wloc
```
```
(
```
```
z s (ρ, b), W
```
```
)
```
```
− ϕ(q p ),
```
where the index p is as defined above.
Note that
∣∣
ϕ
```
(
```
```
z s (ρ, b)
```
```
)
```
```
− ϕ(q p )
```
∣∣
≤ σ
∣∣
```
z s (ρ, b) − q p
```
∣∣
- o(
∣∣
```
z s (ρ, b) − q p
```
∣∣
```
)
```
< σk
√
```
d + o(
```
∣∣
```
z s (ρ, b) − q p
```
∣∣
```
).
```
```
Then −ϕ(q p ) ≤ −ϕ
```
```
(
```
```
z s (ρ, b)
```
```
)
```
- σk
√
```
d + o1 . Hence, we obtain inequality (19).
```
Now, let us show that
∣∣
```
w(x) − w(q s )
```
∣∣
≤ σk
√
d.
Since x, q s belong to one simplex S, then w is affine in the segment X = [x, q s ].
```
As function (w − ϕ)
```
∣∣
X attains minimum at the point x, we get
```
|w(x) − w(q s )|
```
k
√
d
```
≤ |w(x) − w(q s )||x − q
```
s |
= |D X w| = |D X ϕ|  σ.
We denote by D X g a derivative of the restriction of a function g to the set X as a
derivative of a function of one variable.
Convergence of Numerical Method for Time-Optimal … 115
Also, let us note that
∣∣
ϕ
```
(
```
```
z s (ρ, b)
```
```
)
```
− ϕ
```
(
```
```
x + h f (x, a s (ρ), b)
```
```
)∣∣
```
≤ σ
∣∣
```
z s (ρ, b) − x − h f (x, a s (ρ), b)
```
∣∣
= σ
∣∣
```
q s + h f (q s , a s (ρ), b) − x − h f (x, a s (ρ), b)
```
∣∣
≤ σ
```
(
```
|q s − x| + h
∣∣
```
f (q s , a s (ρ), b) − f (x, a s (ρ), b)
```
```
∣∣)
```
```
≤ σ(k
```
√
```
d + h Lk).
```
```
(20)
```
```
Now, let us apply the educed inequalities to (18) for any b ∈ B:
```
```
− ρh < w(q s ) − γwloc
```
```
(
```
```
z s (ρ, b), W
```
```
)
```
```
− (1 − γ)
```
```
≤ w(x) − γwloc
```
```
(
```
```
z s (ρ, b), W
```
```
)
```
```
− (1 − γ) + σk
```
√
d
```
= (1 − γ)w(x) + γ
```
```
(
```
```
w(x) − wloc
```
```
(
```
```
z s (ρ, b), W
```
```
))
```
```
− (1 − γ) + σk
```
√
d
```
≤ (1 − γ)w(x) + γ
```
```
(
```
```
ϕ(x) − ϕ
```
```
(
```
```
z s (ρ, b)
```
```
))
```
```
− (1 − γ) + (1 + γ)σk
```
√
d + γo1
```
≤ (1 − γ)w(x) + γ
```
```
(
```
```
ϕ(x) − ϕ
```
```
(
```
```
x + h f (x, a s , b)
```
```
))
```
```
− (1 − γ) + (1 + 2γ + γh L)σk
```
√
d + γo1,
```
where L is the Lipschitz constant for the function f from condition (2).
```
Since ρ is arbitrary, it holds
0 ≤ 1 − γnh
n
```
wn (x n )
```
- minb∈B maxa∈A
```
{
```
```
γnϕ(x
```
```
n ) − ϕ(x n + h n f (x n , a, b))
```
h n−
1 − γn
h n
```
}
```
- σ k nh
n
√
```
d(1 + 2γn + γn h n L) + γo1.
```
```
Passing to the limit in n to the infinity, we obtain 0 ≤ v(y) + H
```
```
(
```
```
y, Dϕ(y)
```
```
)
```
. That
```
establishes relation (16) as far as the fact that v and v are viscosity subsolution and
```
```
supersolution of problem (9) with the boundary conditions (14)–(17) in the viscosity
```
sense.
Now, we can prove a theorem on the convergence of the proposed numerical
scheme analogous to [2, pp. 125–129, Theorem 2.3]. Firstly, it should be noted
that the proof of the auxiliary theorem for a time-optimal problem with lifeline
corresponding to [2, pp. 117–118, Theorem 1.10] can be conducted in an analogous
way with the set Ω substituted by the set G and is not given here.
Theorem 1 Assume that Conditions C.1, C.2, and C.3 hold. Also, suppose that
```
the value function v (6) of game (1), (5) is continuous on the set cl G . Then the
```
sequence
```
{
```
wn
```
}
```
converges to the function v = v = v as n → ∞ uniformly on every
compact set K ⊂ cl G .
116 N. V. Munts and S. S. Kumkov
```
Note that conditions (11) are crucial for all constructions and argument carried
```
out by the authors, in particular, in the framework of this paper. Theorem 1 is proved
```
under continuity of the function v, which follows from these assumptions (as it was
```
```
said in Sect. 3.2).
```
```
Proof By Lemma 2, function v (13) is a viscosity subsolution of the boundary value
```
```
problem (9) and the function v is a viscosity supersolution by virtue of [2, pp. 115–
```
116, Theorem 1.6], which is common for the boundary value problems for the HJE.
```
Applying Theorem 1.1 from [4, pp. 23–27], we get that for function v (13), the
```
inequality v ≤ v holds on cl G . In the same manner, it is proved that v ≤ v. So,
```
v ≤ v in cl G . By definition of v and v (as lim inf and lim sup of wn ), one has v ≤ v.
```
From these two inequalities, we obtain v = v = v.
Let us show that the sequence
```
{
```
wn
```
}
```
converges to the function v uniformly on com-
pact sets. Suppose by contradiction that there exist ε > 0, n m → ∞, and x m ∈ K
such that x m → x and
∣∣
```
wn m (x m ) − v(x m )
```
∣∣
> ε. This implies that the sequences can
```
be chosen in such a way that either wn m (x m ) > v(x m ) + ε, or wn m (x m ) < v(x m ) − ε.
```
Passing to the limit over m and using the definition of v and v and the continu-
```
ity of v, we obtain either v(x) ≥ v(x) + ε, or v(x) ≤ v(x) − ε what contradicts to
```
coincidence of either v and v, or v and v.
5 Connection Between Value Functions of Problems with
and Without Lifeline
```
In this section, we consider the problem of coincidence of the value functions (not
```
processed by Kruzhkov’s transform, that is, representing the time of the optimal
```
motion) for the problems with and without lifeline. Let us consider a classic time-
```
```
optimal problem with dynamics (1), the constraints A and B for the players’ controls,
```
```
and the terminal set T . The result of such a game on a trajectory x(·; x0) emanated
```
form the initial point x0 is determined by the payoff functional
˜τ
```
(
```
```
x(·; x0)
```
```
)
```
=
```
{
```
min
```
{
```
```
t : x(t; x0) ∈ T
```
```
}
```
,
```
+∞, if ∀t x(t; x0) /∈ T .
```
```
Here and below, notations with a tilde stand for the classic time-optimal game (with-
```
```
out lifeline).
```
Let us introduce the guaranteed results of the players and the value function as it
is described in books [21, 22]. We define a functional
˜τ ε
```
(
```
```
x(·)
```
```
)
```
:= min
```
{
```
```
t ∈ R+ : x(t) ∈ Tε
```
```
}
```
,
```
where Tε is the ε-neighborhood of the terminal set T : Tε := T + B(0, ε), the
```
symbol 0 denotes the origin in the corresponding space. The sign + here stands for
the Minkowski sum.
Convergence of Numerical Method for Time-Optimal … 117
```
Let ¯x ∈ B(x0, ε). Denote by X( ¯x, A , Δ) the set of stepwise motions of the
```
first player emanated under its strategy A from the point ¯x in the discrete con-
```
trol scheme [21, 22] with the time step Δ. Also, denote by X(x0, A ) the set of
```
constructive motions emanated from the point x0 [21, 22] under the strategy A . The
```
guaranteed result ˜T 01 (x0) of the first player at the point x0 is defined as follows:
```
```
˜T ε1 (x0, A ) := sup
```
```
{
```
˜τ ε
```
(
```
```
x(·)
```
```
)
```
```
: x(·) ∈ X(x0, A )
```
```
}
```
,
```
˜T ε1 (x0) := inf
```
A ∈A
```
˜T ε1 (x0, A ), ˜T 01 (x0) := lim
```
ε↓0
```
˜T ε1 (x0).
```
```
The guaranteed result ˜T 02 (x0) of the second player at the point x0 is defined in a
```
similar way:
```
˜T ε2 (x0, B) := inf
```
```
{
```
˜τ ε
```
(
```
```
x(·)
```
```
)
```
```
: x(·) ∈ X(x0, B)
```
```
}
```
,
```
˜T ε2 (x0) := sup
```
B ∈B
```
T ε2 (x0, B), ˜T 02 (x0) := limε↓0˜T ε2 (x0),
```
```
where X(x0, B) is the set of constructive motions of the second player emanated
```
from the point x0 under its strategy B.
It is known that under the assumptions made above, the value function ˜T of a
classic time-optimal problem exists. So, the following equality holds [22]:
```
˜T (x0) := ˜T 01 (x0) = ˜T 02 (x0).
```
Now, let us consider a classic time-optimal problem and a time-optimal problem
with lifeline with the same dynamics and sets A, B, and T . We choose a point x0 ∈
Rn \ T . Let the magnitude of the value function of classic time-optimal problem be
```
˜T (x0) = θ.
```
By Condition C.1, the function f is continuous and satisfies the condition of the
sublinear growth, that is, there exists a number α > 0 such that for every x ∈ Rn ,
a ∈ A, and b ∈ B the following inequality holds
∥∥
```
f (x, a, b)
```
∥∥
≤ α
```
(
```
1 + ‖x‖
```
)
```
.
It follows from the global Lipschitz condition. Let us consider a function
M
```
(
```
x
```
)
```
:= maxa∈A, b∈B
∥∥
```
f (x, a, b)
```
∥∥
,
which provides an upper estimate for the magnitude of possible velocities of the
system at the point x. This function also is continuous and satisfies the condition of the
```
sublinear growth with the same constant α; the maximum is attained, because the sets
```
```
A and B are compact. Let us choose measurable realizations a(·) and b(·) of controls
```
```
of the first and second players defined for t  0. They generate a trajectory x(·) =
```
118 N. V. Munts and S. S. Kumkov
x
```
(
```
```
·; x0) of the system emerged from the point x0 . Using the standard reasoning
```
involving the Grönwall’s lemma, one can obtain the following estimate: for any
```
trajectory x(·) emanated from a point x0 under some admissible controls a(·) and
```
```
b(·) of the players, it is true that M
```
```
(
```
x
```
(
```
```
t; x0, a(·), b(·)
```
```
))
```
≤ α
```
(
```
1 + ‖x0‖
```
)
```
eαθ for any
t ∈ [0, θ].
Let us choose the constant ˜M such that ˜M ≥ α
```
(
```
1 + ‖x0‖
```
)
```
eαθ.
Firstly, we consider a classic time-optimal problem. Let us denote an opti-
```
mal strategy of the first player as A ∗. We choose a point ¯x ∈ B(x0, ε) and a
```
time partition Δ with the diameter less than ε. Since the strategy A ∗ is opti-
```
mal, for every stepwise motion x(·) ∈ X( ¯x, A ∗, Δ) of the system, the inequality
```
˜τ
```
(
```
```
x(·)
```
```
)
```
≤ θ + ε holds. Hence,
```
{
```
```
x(t) : t ∈ [0, θ + ε)
```
```
}
```
```
⊂ B(x0, θ ˜M). Passing to the
```
```
limit ε → 0, we obtain that for every constructive motion x(·) ∈ X(x0, A ∗), the
```
embedding
```
{
```
```
x(t) : t ∈ [0, θ]
```
```
}
```
```
⊂ B(x0, θ ˜M) holds.
```
```
Now, let us consider a time-optimal game with lifeline; the guaranteed results of
```
```
the first and the second players at the point x0 are T1(x0) and T2(x0). As the game
```
```
set G , we take a set such that B(x0, θ ˜M) ⊂ G ∪ T = W . In the game with lifeline,
```
the same strategy A ∗ guarantees the same result for the first player. In other words,
```
under the strategy A ∗ for every stepwise motion x(·) ∈ X( ¯x, A ∗, Δ), the inequality
```
τ
```
(
```
```
x(·)
```
```
)
```
```
≤ θ holds. It is true, because all the trajectories are embedded into the set W ;
```
as a result, the second player does not get any advantage connected to the existence
```
of the lifeline. Hence, T1(x0) ≤ θ.
```
Let us conduct similar considerations from the point of view of the second player.
Let us take an optimal strategy B∗ of the second player in the classic time-optimal
```
problem and construct a set of stepwise motions X( ¯x, B∗, Δ). For every stepwise
```
```
motion x(·) ∈ X( ¯x, B∗, Δ), the inequality ˜τ
```
```
(
```
```
x(·)
```
```
)
```
≥ θ + ε holds. Hence,
```
{
```
```
x(t) :
```
```
t ∈ [0, θ + ε)
```
```
}
```
```
⊂ B(x0, θ ˜M). Passing to the limit ε → 0, we get that the set G is
```
```
such that all constructive motions x(·) from the set X(x0, B∗) are embedded into W .
```
Thus, the inequality τ
```
(
```
```
x(·)
```
```
)
```
≥ θ holds also in the time-optimal problem with lifeline,
```
and T2(x0) ≥ θ. So, T2(x0) ≥ θ ≥ T1(x0). For the time-optimal problem with lifeline,
```
```
the classic inequality T2(x0) ≤ θ ≤ T1(x0) also holds. Hence, T2(x0) = θ = T1(x0).
```
```
Then, we get that if we choose the set G such that B(x0, θ ˜M) ⊂ W , then the value
```
```
function of the classic time-optimal problem coincides with the value function of the
```
corresponding time-optimal problem with lifeline at the point x0 .
So, we have proved the following
Theorem 2 Assume that Condition C.1 holds. Let the value function of a classic
```
time-optimal problem ˜T (x0) at a point x0 be equal to θ. Then there exists such
```
a constant ˜M ≥ α
```
(
```
1 + ‖x0‖
```
)
```
```
eαθ that if a closed ball B(x0, ˜Mθ) ⊂ W , then the
```
magnitude of the value function of the corresponding time-optimal problem with
```
lifeline T (x0) at the point x0 is also equal to θ.
```
```
Moreover, an opposite theorem also holds (since the value function of a time-
```
optimal problem with lifeline is always not less than the value function of the corre-
```
sponding classic time-optimal problem):
```
Convergence of Numerical Method for Time-Optimal … 119
Fig. 2 Illustration
to Theorem 3
```
Theorem 3 Assume that Condition C.1 holds. Let the function T (x0) of a time-
```
optimal problem with lifeline at the point x0 is equal to θ. Then there exists such
a constant M ≥ α
```
(
```
1 + ‖x0‖
```
)
```
```
eαθ that if a closed ball B(x0, Mθ) ⊂ W (see Fig. 2),
```
```
then the magnitude of the value function of the classic time-optimal problem ˜T (x0)
```
at the point x0 is equal to θ.
6 Numerical Examples
The numerical procedure described in Sects. 3 and 4 is constructive except the fact
that the set G is not restricted to be bounded. If the set G is unbounded, then the
grid LG covering it is infinite and cannot be represented in computer. However, in the
opposite case, if the set G is bounded, then the straightforward computer realization
of the proposed procedure is possible.
For the given time step h and space step k, the computer procedure starts with the
initial vector W0 , which consists only of 0 and 1: if a node belongs to the set G , then
the magnitude at this node is equal to 1, and if the node belongs to the set T , then the
magnitude is equal to 0. The computer procedure iteratively recomputes magnitudes
at the nodes of the grid LG by the consequent application of the operator F to the
initial vector. The procedure stops if the desired number of iterations is achieved.
We have an own cross-platform realization of this numerical method written using
the environment .NetCore 3.0 and language C# of version 6.0 or later. A single -
threaded program was written and then, by means of the capabilities of C#, it was
made multi-threaded in order to compute faster on multi-core processors.
The best probation for the program would be comparison of some results com-
puted by it with some value functions obtained theoretically. However, time-optimal
games are extremely hard to solve analytically, so, nowadays, there is no non-trivial
problems solved completely. The collection of problems that could be solved ana-
lytically includes problems with the simple motion dynamics and problems with
one-type objects, which can be reduced to control problems. Problems of these types
were used to debug the program and optimize its performance. But for other prob-
120 N. V. Munts and S. S. Kumkov
lems, we can compare our results only with the numerical ones obtained by other
authors. Below, in several subsections, such examples are shown.
6.1 Homicidal Chauffeur Game
In the homicidal chauffeur game [20], a pursuing object, which represents a car with
a bounded turn radius, tries to catch up an evading one with dynamics of simple
motions, which is treated as a pedestrian.
The original dynamics describing separately both the car and the pedestrian are
˙x p = w1 cos ψ,
˙y p = w1 sin ψ,
˙ψ = w1
R a,
˙x e = b1,
˙ye = b2.
```
Here, (x p , y p ) and (x e, ye) are the geometric positions of the pursuer and the evader in
```
```
the plane; ψ is the course angle of the car’s velocity; w1 is the magnitude of the linear
```
```
velocity of the car; the value R/w1 describes the minimal turn radius of the car. The
```
control a ∈ [−1, +1] of the pursuer shows how sharply the car turns: the value a =
−1 corresponds to the maximally sharp right turn, the value a = +1 corresponds to
the maximally sharp left turn, and a = 0 corresponds to the instantaneous rectilinear
```
motion. The control (b1, b2) of the pedestrian obeys the constraint
```
∥∥
```
(b1, b2)
```
∥∥
≤ w2 .
The terminal set can be chosen in different ways reflecting one or another model.
A strong disadvantage of this representation of the dynamics is that it has a quite
high dimension, namely, 5. However, it permits a reduction of the dimension of
the phase vector in the following way. Superpose the origin and the position of the
pursuer. Direct the ordinate axis along the current vector of the pursuer’s velocity.
```
So, the new state position (x, y) of the system is two-dimensional and its dynamics
```
are the following:
˙x = − w1R ya + w2 sin b,
˙y = w1R xa − w1 + w2 cos b.
Here, b ∈ [−π, π] is a newly introduced control of the evader.
Two following examples have been taken from work [27]. It is necessary to note
that the value function is discontinuous in these examples, so, formally the algorithm
is not meant to solve problems of this type. However, as one can see, there is good
coincidence of results obtained by us and the other authors. Of course, the coincidence
is considered in the areas where the lifeline does not affect the behavior of the players.
The computations have been performed on a computer with the CPU Intel i7 of
the 8th generation, which has 6 kernels with HyperThreading. The volume of RAM
```
is 16 GB (however, it is not critical, since in the examples shown below, the program
```
Convergence of Numerical Method for Time-Optimal … 121
```
takes less than 1 Gb for keeping the grid information). The three-dimensional graphs
```
of the value function have been reconstructed from the grid data by means of an
algorithm suggested by the authors. Visualization of these graphs was made by a
free system MeshLab.
6.1.1 Homicidal Chauffeur Game, Example 1
For the first example, the following parameters have been taken: w1 = 3, w2 = 1,
```
R = 3. The terminal set T is a circle with the center at the origin and the radius
```
equal to 1.0. The set W = [−20, 20] × [−10, 20]. The time step h = 0.1, the spatial
step k = 0.1. The number of iterations equals 150. The total time of computation
was about 2.5 h.
A three-dimensional view of the value function graph is given in Fig. 3. It is
```
restricted to a disk with the center at the point (0, 5) and the radius equal to 15. The
```
magenta-purple area corresponds to the terminal set and small magnitudes of the
value function, the yellow color marks places with large times to reach the terminal
set. In Fig. 4, one can see contour lines of the value function from 0 to 15 with the
step 0.2. The black thick “lines” correspond to the barriers where the value function
is discontinuous. This figure and other figures with contour lines have been prepared
by means of the system GNU Plot, whose algorithms are oriented to continuous
functions, so, near the discontinuities, the picture of contours can be inaccurately
restored.
Figure 5 again shows level sets of the value function, not by contours, but by a
color gradient filling, which corresponds to the colors in Fig. 3. The red areas stand
for the infinite magnitude of the value function, which have been cut off in Fig. 3.
These areas appear just due to presence of the lifeline: trajectories leading the system
to the terminal set from these areas leave the set W . Also, near the terminal set, one
Fig. 3 Homicidal chauffeur,
Example 1, a
three-dimensional view of
the value function graph
x
y
```
v(x, y)
```
122 N. V. Munts and S. S. Kumkov
Fig. 4 Homicidal chauffeur,
Example 1, contour lines of
the value function
Fig. 5 Homicidal chauffeur,
Example 1, the area of the
guaranteed coincidence
can see a black spot, which marks the area where the value function of the Homicidal
chauffeur game with lifeline coincides with the classic one by Theorem 3. The area
is not too large, because the theorem considers all motions of the system including
“silly” ones, which go not to the terminal set, but to the lifeline.
6.1.2 Homicidal Chauffeur Game, Example 2
This example uses the same dynamics with the parameters w1 = 2, w2 = 0.6, R =
```
0.2. The terminal set T is a circle with the center at the point (0.2, 0.3) and the radius
```
is equal to 0.015. The set W = [−1.5, 1.5] × [−1, 1.5]. The time step h = 0.001,
the spatial step k = 0.005. The number of iterations equals 200. The total time of
computation was 7 h and 51 min. A three-dimensional view of the value function
```
graph is given in Fig. 6. It is restricted to a disk with the center at the point (0, 0.25)
```
Convergence of Numerical Method for Time-Optimal … 123
Fig. 6 Homicidal chauffeur,
Example 2, a
three-dimensional view of
the value function graph
x
y
```
v(x, y)
```
Fig. 7 Homicidal chauffeur,
Example 2, contour lines of
the value function
and the radius equal to 1.25. The magenta-purple area corresponds to the terminal
set and small magnitudes of the value function, the yellow color marks places with
large times to reach the terminal set. In Fig. 7, one can see contour lines of the value
```
function from 0 to 1.25 with the step 0.015. The black thick “lines” corresponds to
```
the barriers where the value function is discontinuous. In Fig. 8, a black spot marks
the area where the value function of the Homicidal chauffeur game with lifeline
certainly coincides with the classic one.
124 N. V. Munts and S. S. Kumkov
Fig. 8 Homicidal chauffeur,
Example 2, the area of the
guaranteed coincidence
6.2 Dubins’ Car
```
The (reduced) two-dimensional dynamics of this classic model system are the fol-
```
```
lowing:
```
˙x = −ya, ˙y = xa − 1.
Here, a ∈ [−1, 1]. The time step h = 0.05, the spatial discretization step k = 0.01.
The target set T =
```
{
```
```
(x, y) ∈ R2 : max{|x|, |y|} ≤ 0.1
```
```
}
```
. The set W is a square with
the center at the origin and sides of length 6. The number of iterations is 150. Actually,
the Dubins’ car is an optimal control problem, however, we consider this problem
as a differential game with the fictitious second player, which does not affect the
dynamics and has its control constrained by a one-pointed set coinciding with the
origin. The total time of computation was 13 min.
A three-dimensional view of the value function graph is given in Fig. 9. The
magenta-purple area corresponds to the terminal set and small magnitudes of the
value function, the yellow and orange colors mark places with large times to reach
the terminal set. In Fig. 10, one can see contour lines of the value function from 0
to 7 with the step 0.01. The black thick “lines” corresponds to the barriers where
the value function is discontinuous. In Fig. 11, a black spot marks the area where
the value function of Dubins’ car problem with lifeline certainly coincides with the
classic one.
Comparison of these results was made with the ones in paper [16] where an
analytical study of reachable sets for this problem is set forth. That work studies
reachable sets at instant, or in other words a problem with a fixed termination instant is
considered. Nevertheless, for control problems, situations at instant and upto instant
```
are connected very tightly (in contrast to differential games). Thus, we compare
```
Convergence of Numerical Method for Time-Optimal … 125
Fig. 9 Dubins’ car, a
three-dimensional view of
the value function graph
x
y
```
v(x, y)
```
Fig. 10 Dubins’ car, contour
lines of the value function
126 N. V. Munts and S. S. Kumkov
Fig. 11 Dubins’ car, the
area of the guaranteed
coincidence
boundaries of the level sets of the value function for a time-optimal problem and the
front parts of the boundaries of the reachable sets at instant. The coincidence seems
to be good enough.
6.3 Material Point with Shifted Target
Dynamics of the system are the following:
˙x = y, ˙y = a,
```
where a ∈ [−1, 1]. The target set T is a square with the center at (0, 1) and sides with
```
length of 0.4. The set W is a square, the length of sides is equal to 8. The number
of iterations is 150. The time step h = 0.05, the spatial step k = 0.01. A three-
dimensional view of the value function graph is given in Fig. 12. The magenta-purple
area corresponds to the terminal set and small magnitudes of the value function, the
yellow and orange colors mark places with large times to reach the terminal set.
In Fig. 13, one can see contour lines of the value function from 0 to 9 with the
step 0.01. The black thick “lines” corresponds to the barriers where the value function
is discontinuous. In Fig. 14, a black spot marks the area where the value function of
the material point problem with lifeline certainly coincides with the classic one.
Convergence of Numerical Method for Time-Optimal … 127
Fig. 12 Material point with
shifted target, a
three-dimensional view of
the value function graph
y x
```
v(x, y)
```
Fig. 13 Material point with
shifted target, contour lines
of the value function
This control problem is classic and well studied. The boundary of the value func-
tion level sets can be obtained by direct integration of trajectories of the system,
which can be easily performed due to linearity of the dynamics. There is a good
coincidence of theoretical and numerical results.
128 N. V. Munts and S. S. Kumkov
Fig. 14 Material point with
shifted target, the area of the
guaranteed coincidence
7 Conclusion
The paper discusses proposed numerical method, which constructs the value function
```
of a time-optimal differential game with lifeline as a generalized (viscosity) solution
```
of the corresponding boundary value problem for HJE. Convergence of this method is
proved. Previously, authors have proved existence of the generalized solution and its
coincidence with the value function of the corresponding time-optimal problem with
```
lifeline under strong conditions (11) of dynamical advantage of each player on the
```
boundary of the corresponding set. It is known that simultaneous accomplishment of
these two inequalities results in continuity of the value function. The convergence of
the numerical method is proved under the same assumptions. Further, it is planned to
prove existence of the generalized solution and its coincidence with the value function
under some weaker assumptions. Also, it would be useful to prove convergence of
the numerical method to the discontinuous value function of time-optimal problem
with lifeline.
References
1. Bardi, M., Capuzzo-Dolcetta, I.: Optimal Control and Viscosity Solutions of Hamilton-Jacobi-
```
Bellman Equations. Birkhäuser, Boston (1997)
```
2. Bardi, M., Falcone, M., Soravia, P.: Numerical methods for pursuit-evasion games via viscos-
```
ity solutions. In: M. Bardi, T. Parthasarathy, T.E.S. Raghavan (eds.) Annals of the Interna-
```
Convergence of Numerical Method for Time-Optimal … 129
tional Society of Dynamic Games, Vol. 6: Stochastic and Differential Games, pp. 105–175.
```
Birkhäuser, Boston (1999)
```
3. Bardi, M., Koike, S., Soravia, P.: Pursuit-evasion games with state constraints: dynamic pro-
```
gramming and discrete-time approximations. Discrete Cont. Dyn. S. 6(2), 361–380 (2000)
```
4. Bardi, M., Soravia, P.: A comparison result for Hamilton-Jacobi equations and applications to
```
some differential games lacking controllability. Funkc. Ekvacioj (37), 19–43 (1994)
```
5. Barles, G.: Solutions de viscosité des équations de Hamilton-Jacobi. Mathématiques et Appli-
```
cations 17 (1994)
```
6. Barles, G., Perthame, B.: Discontinuous solutions of deterministic optimal stopping time prob-
```
lems. RAIRO — Modélisation mathématique et analyse numérique 21(4), 557–579 (1987)
```
7. Botkin, N.D., Hoffmann, K.H., Mayer, N., Turova, V.L.: Approximation schemes for solving
```
disturbed control problems with non-terminal time and state constraints. Analysis 31(4), 355–
```
```
379 (2011)
```
8. Botkin, N.D., Hoffmann, K.H., Mayer, N., Turova, V.L.: Computation of value functions in
```
nonlinear differential games with state constraints. In: D. Hömberg, F. Tröltzsch (eds.) System
```
Modeling and Optimization. CSMO 2011. IFIP Advances in Information and Communication
```
Technology, vol. 391, pp. 235–244. Springer, Berlin, Heidelberg (2013)
```
9. Botkin, N.D., Hoffmann, K.H., Turova, V.L.: Stable solutions of Hamilton-Jacobi equations.
application to control of freezing processes. Priority programm 1253 “Optimization with Partial
```
Differential Equations”, Preprint-Number: SPP1253-080 (2009). https://www-m6.ma.tum.de/
```
~botkin/m6pdf/Preprint-spp1253-080.pdf
10. Breitner, M., Pesch, H., Grimm, W.: Complex differential games of pursuit-evasion type with
```
state constraints, part 1: Necessary conditions for optimal open-loop strategies. JOTA 78(3),
```
```
419–441 (1993)
```
11. Breitner, M., Pesch, H., Grimm, W.: Complex differential games of pursuit-evasion type with
```
state constraints, part 2: Numerical computation of optimal open-loop strategies. JOTA 78(3),
```
```
443–463 (1993)
```
12. Cardaliaguet, P., Quincampoix, M., Saint-Pierre, P.: Some algorithms for differential games
with two players and one target. RAIRO — Modélisation mathématique et analyse numérique
```
28(4), 441–461 (1994)
```
13. Cardaliaguet, P., Quincampoix, M., Saint-Pierre, P.: Set-valued numerical analysis for optimal
```
control and differential games. In: M. Bardi, T.E.S. Raghavan, T. Parthasarathy (eds.) Annals
```
of the International Society of Dynamic Games, Vol. 4: Stochastic and Differential Games, pp.
```
177–247. Birkhäuser, Boston (1999)
```
14. Cardaliaguet, P., Quincampoix, M., Saint-Pierre, P.: Pursuit differential games with state con-
```
straints. SIAM J. Control Optim. 39(5) (2001)
```
15. Cardaliaguet, P., Quincampoix, M., Saint-Pierre, P.: Differential games through viability theory:
```
Old and recent results. In: S. Jorgensen, M. Quincampoix, T.L. Vincent (eds.) Annals of the
```
International Society of Dynamic Games, Vol. 9: Advances in Dynamic Game Theory, vol. 9,
```
pp. 3–35. Birkhäuser, Boston (2007)
```
16. Cockayne, E.J., Hall, G.W.C.: Plane motion of a particle subject to curvature constraints. SIAM
J. Control Optim. 13(1), 197–220 (1975)
17. Crandall, M.G., Evans, L.C., Lions, P.L.: Some properties of viscosity solutions of Hamilton-
```
Jacobi equations. T. Am. Math. Soc. 282(2), 487–502 (1984)
```
18. Crandall, M.G., Evans, L.C., Lions, P.L.: User’s guide to viscosity solutions of second order
```
partial differential equations. B. Am. Math. Soc. (27), 1–67 (1992)
```
19. Fisac, J., Sastry, S.: The pursuit-evasion-defense differential game in dynamic constrained envi-
```
ronments. In: 2015 IEEE 54th Annual Conference on Decision and Control (CDC), December
```
```
15–18, 2015. Osaka, Japan, pp. 4549–4556 (2015)
```
20. Isaacs, R.: Differential Games. John Wiley and Sons, New York (1965)
21. Krasovskii, N.N., Subbotin, A.I.: Positional Differential Games. Nauka, Moscow (1974).
```
(in Russian)
```
22. Krasovskii, N.N., Subbotin, A.I.: Game-Theoretical Control Problems. Springer-Verlag, New
```
York (1988)
```
130 N. V. Munts and S. S. Kumkov
23. Munts, N.V., Kumkov, S.S.: Existence of value function in time-optimal game with life line. In:
Proceedings of the 47th International Youth School-conference “Modern Problems in Math-
ematics and its Applications”. Yekaterinburg, Russia, January 31 – February 6, pp. 94–99
```
(2016). (in Russian)
```
24. Munts, N.V., Kumkov, S.S.: On coincidence of minimax solution and value function of time-
```
optimal problem with lifeline. Trudy Instituta Matematiki i Mekhaniki UrO RAN (Proceedings
```
```
of Institute of Mathematics and Mechanics UrB RAS) 24(2), 200–214 (2018). (in Russian;
```
```
transl. as [25])
```
25. Munts, N.V., Kumkov, S.S.: On coincidence of minimax solution and value function of time-
```
optimal problem with lifeline. P. Steklov. Inst. Math. 305(1), S125–S139 (2019). (transl. of
```
```
[24])
```
26. Munts, N.V., Kumkov, S.S.: On time-optimal problems with lifeline. Dyn. Games Appl. 9(3),
```
751–770 (2019)
```
27. Patsko, V.S., Turova, V.L.: Level sets of the value function in differential games with the
```
homicidal chauffeur dynamics. Int. Game Th. Rev. 3(1), 67–112 (2001)
```
28. Petrosjan, L.A.: A family of differential survival games in the space R n . Soviet Math. Dokl.
```
(6), 377–380 (1965)
```
29. Rakhmanov, A., Ibragimov, G., Ferrara, M.: Linear pursuit differential game under phase
```
constraint on the state of evader. Discrete Dyn. Nat. Soc. (2), 1–6 (2016)
```
30. Subbotin, A.I.: Generalized Solutions of First Order PDEs: the Dynamical Optimization Per-
```
spective. Birkhäuser, Boston (1995)
```
Nataly V. Munts, Krasovskii Institute of Mathematics and Mechanics, Ural Branch of
the Russian Academy of Sciences, S.Kovalevskaya str., 16, Yekaterinburg, 620990 Russia,
```
(natalymunts@gmail.com).
```
```
Sergey S. Kumkov, Cand. Sci. (Phys.-Math.), Krasovskii Institute of Mathematics and
```
Mechanics, Ural Branch of the Russian Academy of Sciences, S.Kovalevskaya str., 16, Yeka-
```
terinburg, 620990 Russia, (sskumk@gmail.com).
```
Evolutionary Games
A Partnership Formation Game with
Common Preferences and Scramble
Competition
David M. Ramsey
1 Introduction
In the economics literature, such games are often termed job search games and have
```
developed from the classical problem of one-sided choice (see Stigler [26]). It is
```
assumed that a job searcher observes a sequence of offers with values from a known
```
distribution (employers are not choosy). The cost of observing a job offer is assumed
```
to be constant. Janetos [11] was the first to consider such a model in the context of
```
mate choice (it was assumed that only females are choosy). These ideas were later
```
developed by Real [23].
In many species, both sexes are choosy. Parker [16] was the first to consider a
model of two-sided mate choice. McNamara and Collins [14] presented a model
under which searchers explicitly observe a sequence of prospective partners, unlike
```
in Parker’s model. However, their conclusions are very similar (players are split into
```
```
a finite number of types, such that type i males only mate with type i females). These
```
two models assume that mate choice is based on the attractiveness of a prospective
partner, individuals prefer partners of high attractiveness and all individuals of a
given sex agree upon the attractiveness of a member of the opposite sex. Such pref-
erences are called common. When search costs are sufficiently small, individuals
form pairs with those of a similar level of attractiveness. This phenomenon is known
```
as associative pairing (i.e. the individuals forming pairs are similar to each other).
```
```
Such associative pairing can also result from homotypic preferences (i.e. individu-
```
```
als prefer to mate with prospective partners who are similar to them). Alpern and
```
Reyniers [2] consider a model of mate choice when preferences are homotypic. Ram-
sey [22] presents a similar game to the one presented here in which preferences are
```
homotypic and there are two types of each sex (e.g. these types can be considered to
```
D. M. Ramsey (B)
Department of Operations Research, Wroclaw University of Science and Technology, Wroclaw,
Poland
e-mail: david.ramsey@pwr.edu.pl
```
© The Editor(s) (if applicable) and The Author(s), under exclusive license
```
to Springer Nature Switzerland AG 2020
D. M. Ramsey and J. Renault (eds.), Advances in Dynamic Games,
Annals of the International Society of Dynamic Games 17,
```
https://doi.org/10.1007/978-3-030-56534-3_6
```
133
134 D. M. Ramsey
```
be two sub-species). Real [24] looked in more detail at the associative pairing that
```
results from common preferences. Ramsey [20] considers a model in which mate
choice is based on both common and homotypic preferences.
If mating is non-seasonal, then the distribution of attractiveness among those in
the mating pool tends to a steady-state distribution, which depends on the strategies
```
used within the population (see Burdett and Coles [5], Smith [25]). However, if
```
mating is seasonal, this distribution changes over time, since individuals leave the
mating pool after finding a partner, but are not replaced by new searchers. Such
a phenomenon is referred to as scramble competition. Collins and McNamara [7],
as well as Ramsey [19], consider such models of one-sided choice. Dechaume-
Moncharmont et al. [9] present numerical results based on simulation for a finite-
population model of mate choice where only females are choosy, but both sexes mate
only once in a season.
Johnstone [12] gives numerical results for a model of two-sided choice with
discrete time. Searchers generally become less choosy as time passes, but searchers of
low quality may become more choosy just before the end of the season in the hope of
obtaining an attractive mate in the last period, when no searcher is choosy. Alpern and
Reyniers [3], as well as Alpern and Katrantzi [1], apply a more analytic approach to
such problems, while Mazalov and Falko [13] prove some general results. According
to these three models, time is discrete and the values of prospective partners have a
continuous distribution.
Etienne et al. [10] and Courtiol et al. [8] present models which are similar to
the one presented here. The first paper presents a model where only females are
choosy. Both sexes have a latent period after pairing, when they cannot mate. This
leads to frequency-dependent selection, since the availability of males depends on
the strategies used by females. The second paper extends this model to two-sided
choice. These models differ from the one presented here, since they assume that time
is discrete and mating is non-seasonal, i.e. given the mate choice strategies adopted
```
in the population, the availability of prospective partners (and hence the distribution
```
```
of the values of available partners) tends to a steady-state distribution. Priklopil [18]
```
present a model of seasonal mating with continuous time in which only females are
choosy. Females mate only once in a season and the value of a male comes from a
discrete distribution. The optimal strategy of a female is a threshold rule such that a
female accepts a male at time t if and only if his value is above a threshold, which
may depend on t. As the season progresses, females become less choosy.
When mate choice is mutual and seasonal, then as time passes the distribution
of the types of searchers changes and the rate at which prospective partners are
found may depend on the proportion of individuals still looking for a partner. At
one end of this spectrum, encounters with members of the other sex are not in any
way concentrated on individuals still searching for a partner. In this case, the rate of
encountering prospective partners is proportional to the fraction of individuals still
searching for a mate. This is called the mixing population model. At the other end of
this spectrum, encounters with members of the other sex are completely concentrated
on individuals still searching for a partner, hence the rate of encountering prospective
partners is constant. This is called the singles bar model. McNamara et al. [15] present
A Partnership Formation Game with Common Preferences … 135
a model in which the rate at which prospective partners are found is proportional to
the square root of the fraction of individuals still searching for a partner, i.e. the degree
of concentration of search on individuals still looking for a partner is intermediate.
In the model presented here, time is continuous and mating is seasonal. The results
extend the approach used by Ramsey [21], who derived equilibria for games in which
there are only two types of prospective partner. It was shown that multiple equilibria
are possible, even when the concept of Nash equilibrium is appropriately refined.
This article gives some general results for equilibria under the mixing population
model. A characterization of the possible equilibria is given for the case when there
are three levels of attractiveness. In addition, the possible mating patterns are fully
described. Finally, some consideration is given to solving problems where there are a
larger number of types of prospective partners. The fact that the types of searchers are
discrete may be problematic. However, due to limitations on perception, this could
be a realistic assumption.
Most models of two-sided mate choice involve discrete time, where multiple pairs
of prospective partners meet in parallel. This is appropriate in the context of speed
dating, but may be unnatural when applied to species ‘in the wild’. Such models
indicate that individuals of low quality might become more choosy shortly before
the end of the mating season, since there is a chance of being paired with an attractive
```
partner (and being mutually accepted) in the final round. One interesting question is
```
whether this is a general phenomenon or results from the discrete dynamics.
The general model and its specific form under the assumption of a mixing pop-
ulation are described in Sect. 2. Section 3 first recalls some general results on the
form of an equilibrium from Ramsey [21] and then gives a new result for the mixing
population model. Section 4 extends the approach adopted in [21] to games of this
form where there are three levels of attractiveness and gives a characterization of the
possible forms of equilibria in such games. Section 5 presents some numerical results
for two examples which illustrate the range of equilibria possible and the existence
of multiple equilibria. A brief conclusion and directions for future research are given
in Sect. 6.
2 The Model
Consider a large population in which there are two equally frequent classes of player.
Each player aims to form a partnership with a player from the other class. For
simplicity, these classes will be referred to as males and females, although they could
```
also be interpreted as, e.g. employers (job positions) and job seekers. Partnership
```
formation is seasonal. Each player starts searching for a partner at time zero and the
amount of time available for searching is μ, where μ is finite. Partnerships are only
formed by mutual consent.
```
As well as being a member of a given class (i.e. male or female), each player
```
```
has a given level of attractiveness (type). All players of a given class agree about
```
the attractiveness of a prospective partner and each player wishes to pair with an
individual of high attractiveness, i.e. preferences are common.
136 D. M. Ramsey
Suppose there are n types of prospective partner. Let the reward obtained by a
```
searcher from pairing with an individual of type i at time t be vi e−γ t , i ∈ {1, 2, . . . , n},
```
where v1 > v2 > . . . > vn > 0 and γ is the discount factor reflecting the advantage from
finding a partner quickly. If a searcher does not find a partner, then his/her payoff is
defined to be 0. Based on this, only the relative values of prospective partners are
important. Hence, without loss of generality, we assume that vn = 1. Note that it
is assumed that the value of a given type is independent of the sex of the searcher.
```
The proportion of players who are of type i is denoted by pi (again assumed to be
```
```
independent of sex). Such a problem will be called symmetric with respect to sex. It
```
should be noted that such problems can also be formulated in terms of searching for
```
a partner in which sex (class) is unimportant (e.g. looking for a bridge partner).
```
Each player searches until he/she finds a mutually acceptable partner. At this time,
both of them leave the mating pool. Hence, in the mating pool, the ratio of the number
of males to the number of females always equals one. The proportion of individuals
still searching and the distribution of types vary over time depending on the set of
```
strategies used by the players (the strategy profile).
```
We derive equilibria at which all players of the same type use the same strategy for
accepting prospective partners, regardless of sex. Such a strategy profile, denoted by
```
π, is defined by a vector of n strategies. Let π = (π1, π2, . . . , πn ), where πi denotes
```
the strategy used by a type i player. A player’s strategy can be defined by stating
```
the set of types of acceptable partners at time t for all t ∈ [0, μ]. Let Si (t) denote the
```
set of types of prospective partners acceptable to a type i player at time t. We will
```
be particularly interested in strategies based on a continuous threshold, h(t). Under
```
such a rule, a searcher will accept a prospective partner if and only if the value of
```
the prospective partner is ≥ h(t).
```
Since the set of values of prospective partners is discrete, different threshold
functions can lead to identical behaviour, regardless of the realization of the search
process. Suppose an individual of type i uses a strategy based on a continuous
```
threshold. This strategy can be described by (a) the times at which the set of acceptable
```
partners changes, t1,i , t2,i , t k,i , where 0 < t1,i < t2,i < . . . < t k,i < μ and k is the
```
number of switch times (for convenience define t0,i = 0 and t k+1,i = μ) and (b) the
```
set of types of prospective partners that are acceptable to a searcher of type i in the
```
time interval [t j−1,i , t j,i ), which is denoted S ji , for j = 1, 2, . . . , k + 1. Note that
```
```
when t ∈ [t j−1,i , t j,i ), then Si (t) = S ji . Also, S1i = {1, 2, . . . , m i } is the set of types
```
of prospective partners that are initially acceptable to a searcher of type i. Note that
S j+1i is obtained from S ji either by adding the most attractive type of partner that is not
in S ji or deleting the least attractive partner that is in S ji , as appropriate. For example,
suppose there are three types of prospective partner and type 1 searchers only accept
partners of type 1 when t < 2, accept partners of type 1 or 2 when 2 ≤ t < 4 and for
t ≥ 4 accept any type of prospective partner. Then this strategy can be defined as
```
S1(t) =
```
⎧
⎨
⎩
```
{1}, t < 2
```
```
{1, 2}, 2 ≤ t < 4
```
```
{1, 2, 3}, t ≥ 4
```
.
A Partnership Formation Game with Common Preferences … 137
```
Note that the underlying threshold function, h(t), satisfies h(t) > v2 for t < 2,
```
```
h(2) = v2 , v3 < h(t) ≤ v2 for 2 < t < 4, h(4) = v3 and h(t) < v3 for t > 4, i.e. this
```
threshold function is not uniquely defined. Strategies that are based on two different
threshold functions, but have the same description in the form outlined immediately
above, will be treated as being identical.
Denote the expected reward of a type i player still searching at time t and using
the strategy θi when the rest of the population is following the appropriate strategy
```
from the profile π by r i (t; θi , π). The mathematical description of such a reward
```
requires the derivation of the dynamics of the search process, which are considered
at the end of this section. It should be noted that the dynamics of the search process
are independent of an individual player, since we are considering a continuum of
```
players. Also, the notation r i (t; θi , π) is used rather than r i (t; θi , π−i ), which is used
```
in n-player games, since the considered individual of type i is playing against the
whole population, which includes a continuum of players of type i.
```
Let π∗ = (π∗1 , π∗2 , . . . , π∗n ) denote a Nash equilibrium. By definition π∗ satis-
```
```
fies the following conditions for all i, 1 ≤ i ≤ n, θi and t ∈ [0, μ]: r i (t; θi , π∗) ≤
```
```
r i (t; π∗i , π∗). Hence, it does not pay any player to ever deviate from the appro-
```
priate strategy from an equilibrium profile when the rest of the population conform
to that equilibrium profile. Without loss of generality, previous discounts can be
ignored in the definition of these payoff functions. To simplify the notation, define
```
r i (t; πi , π) ≡r i (t; π). This is the expected future payoff of a type i player following
```
the appropriate strategy from the profile π.
Non-intuitive Nash equilibria may exist, e.g. when there are two types of player,
```
the following strategy profile is always a Nash equilibrium: (a) players of type 1
```
```
(the most attractive) only accept prospective partners of type 2 (the least attractive)
```
```
and always accepts such partnerships, (b) players of type 2 only accept prospective
```
```
partners of type 1 (and always accepts such partnerships). However, natural selection
```
```
favours players who always accept the most attractive prospective partners (e.g. given
```
that future decisions remain the same, a type 1 female obtains a greater expected
reward from accepting a type 1 male at time t when there is a positive probability
```
of being accepted than by rejecting such a male). We thus adopt a refinement of
```
the concept of Nash equilibrium based on the optimality criterion of McNamara and
Collins [14]: each player accepts a prospective partner if and only if the value that the
```
player would obtain from the pairing (regardless of whether acceptance is mutual)
```
```
is at least as great as the player’s expected reward from future search (ignoring
```
```
previous discounts). Hence, players always accept a prospective partner of type 1,
```
as the reward that would result from such a partnership is clearly greater than any
possible reward from future search. Hence, given the strategy profile used, a type 1
player faces a one-sided search problem where members of the opposite sex are not
choosy.
If an individual’s strategy satisfies this criterion, then it is optimal given the strate-
```
gies used by the other players (see Chow [6]). This leads to the following result
```
Result 1 A strategy profile where each strategy used satisfies the McNamara-Collins
optimality criterion is a Nash equilibrium. At such an equilibrium a type i individual
138 D. M. Ramsey
```
accepts a prospective partner of type j if and only if r i (t; π∗) ≤ v j . Such strategies are
```
```
by definition threshold strategies (it will be argued later that the threshold functions
```
```
{r i (t; π∗)}ni=1 are continuous).
```
We now consider the dynamics of the search problem under a given strategy
profile. Assume that the players adopt strategy profile π. The distribution of the types
```
of players remaining in the mating pool is independent of sex. Denote by pi (t; π)
```
the proportion of all players who are both still searching at time t and of type i. Thus,
```
∀π, pi (0; π) ≡ pi . The proportion of players still searching at time t is denoted
```
```
by p(t; π), i.e. p(t; π) = ∑ni=1 pi (t; π). The probability that a player is of type i
```
```
given that he/she is searching at time t is denoted by q i (t; π), i.e. q i (t; π) = pi (t;π)p(t;π) ,
```
i ∈ 1, 2, . . . , n.
Players find prospective partners according to a Poisson process at a rate given
by λ, a function of the proportion of players that are still searching. It is assumed
```
that λ is non-decreasing in p(t; π), i.e. is non-increasing in time. From the point of
```
view of an individual player, the process of finding prospective partners is stochastic.
However, since we are considering a continuum of players, the equations defining
the proportions of each type of player who are still searching are deterministic.
Dechaume-Moncharmont et al. [9] simulate the evolution of strategies of mate choice
based on a similar model where the population is finite.
Prospective partners are chosen at random from the mating pool, i.e. a prospective
```
partner encountered at time t is of type i with probability q i (t; π). By assumption
```
```
p(t; π) ≤ λ[ p(t; π)] ≡ λ( p) ≤ 1 and time is scaled so that λ(1) = 1. In order to sim-
```
```
plify the notation, p(t; π) will be abbreviated to p. These assumptions are reasonably
```
natural, as finding prospective partners generally becomes harder as the number of
```
searchers decreases. Ramsey [21] considered the following two extreme cases: (i)
```
```
λ( p) = 1, ∀ p ∈ [0, 1], (ii) λ( p) = p, ∀ p ∈ [0, 1]. Case i) corresponds to the ‘singles
```
bar model’, where players concentrate search on members of the opposite sex who
```
have not yet found a partner. Case (ii) corresponds to a ‘mixing population’, where
```
players meet members of the opposite sex at a constant rate, but the individual
```
encountered is chosen at random from all the players of the opposite sex (i.e. such a
```
```
player is available with probability p). Hence, the expected number of members of
```
```
the opposite sex that a player meets during the search period (under the single bars
```
```
model, the expected number of prospective partners that a player meets) is equal
```
to μ.
```
Denote by A i (t; π) the set of mutually acceptable types of prospective partners of
```
```
a type i player at time t. Note that j ∈ A i (t; π) if and only if j ∈ Si (t) and i ∈ S j (t).
```
```
It follows that j ∈ A i (t; π) ⇔ i ∈ A j (t; π). The set {A i (t; π)}ni=1 for a given t is
```
called the mating pattern at time t.
```
Define v i (t; π) to be the expected reward obtained by a type i individual following
```
the appropriate strategy from the profile π from pairing with a mutually acceptable
prospective partner at time t. Hence,
```
v i (t; π) =
```
∑
```
j∈A i (t;π) v j p j (t; π)∑
```
```
j∈A i (t;π) p j (t; π)
```
```
. (1)
```
A Partnership Formation Game with Common Preferences … 139
Now we derive the dynamics of the game under a given strategy profile. Con-
sider a player of type i who is still searching at time t. For small δ, the probability
that such a player finds a partner in the time interval [t, t + δ] is approximately
```
δλ( p) ∑j∈A i (t;π) q j (t; π). Hence,
```
```
pi (t + δ; π) = pi (t; π)[1 − δλ( p)
```
∑
```
j∈A i (t;π)
```
```
q j (t; π)] + O(δ2)
```
```
pi (t + δ; π) − pi (t; π)
```
```
δ = − pi (t; π)λ( p)
```
∑
```
j∈A i (t;π)
```
```
q j (t; π) + O(δ).
```
Letting δ → 0, we obtain the differential equation
```
dpi (t; π)
```
```
dt = − pi (t; π)λ( p)
```
∑
```
j∈A i (t;π)
```
```
q j (t; π). (2)
```
Remark 1 Suppose that there is a set of types B, and an interval of time I such
that a player of any type in B will pair with a player of any type in B, but not with
```
prospective partners of types not in B when t ∈ I . From Eq. (2), if i, j ∈ B, then the
```
```
ratio pi (t; π)/ p j (t; π) is constant on the interval I .
```
```
Under the mixing population model, λ( p) = p. Hence, Eq. (2) leads to
```
```
dpi (t; π)
```
```
dt = − pi (t; π)
```
∑
```
j∈A i (t;π)
```
```
p j (t; π). (3)
```
```
Let Ti (π) be the time at which a type i player following the appropriate strategy
```
```
from the profile π finds a mutually acceptable partner and f i (t; π) denote the density
```
```
function of this random variable. When such a player does not find a partner, we define
```
```
Ti (π) = μ. Setting αi (t; π) to be the rate at which such individuals find acceptable
```
```
partners, it follows that αi (t; π) = λ( p) ∑j∈A i (t;π) q j (t; π). Hence, for 0 < t < μ,
```
```
f i (t; π) = αi (t; π) exp
```
[
−
∫ t
0
```
αi (s; π)ds
```
]
.
The future expected reward of such a type i searcher at time t is given by
```
r i (t; π) =
```
∫ μ
t
```
v i (s; π)αi (s; π) exp
```
[
−
∫ s
t
```
γ + αi (τ ; π)dτ
```
]
```
ds. (4)
```
```
Note that r i (t; π) is a continuous function of t for all i. Under the mixing population
```
```
model, using Eqs. (1) and (4), since λ( p) = p(t; π), we obtain
```
140 D. M. Ramsey
Table 1 Description of the parameters and functions used in the definition of the model
Parameter Description
```
μ Length of mating season (time available for searching for a mate)
```
n Number of types of prospective partner
vi Value of a partner of type i
γ Discount rate
pi Proportion of individuals that are of type i
```
π = (π1, π2, . . . , πn ) Strategy profile
```
πi Strategy used by individuals of type i
```
Si (t) Set of types of prospective partners that are acceptable to a
```
searcher of type i at time t
```
A i (t) Set of types of prospective partners that are mutually acceptable to
```
a searcher of type i at time t
```
{A i (t)}ni=1 Mating pattern at time t.
```
θi Strategy of an individual of type i who does not use the appropriate
strategy from π
```
pi (t; π) Proportion of all players who are both still searching at time t and
```
```
of type i [ pi (0; π) ≡ pi ]
```
```
p(t; π) ≡ p Proportion of all players who are still searching at time t
```
```
qi (t; π) Conditional probability that an individual still searching at time t is
```
of type i
```
λ( p) ≡ λ[ p(t; π)] Rate at which searchers find prospective partners
```
```
v i (t; π) Mean value of a prospective partner who is mutually acceptable to
```
a searcher of type i at time t
```
αi (t; π) Rate at which a searcher of type i finds a mutually acceptable
```
partner
```
r i (t; π)=
```
∫ μ
t
⎡
⎣ ∑
```
j∈A i (s;π)
```
```
v j p j (s; π)
```
⎤
⎦ exp
⎡
⎣−
∫ s
t
γ +
∑
```
j∈A i (τ ;π)
```
```
p j (τ ; π)dτ
```
⎤
⎦ ds.
```
(5)
```
Table 1 gives a description of the parameters and functions used in the definition
of the model.
3 Some General Results
First, we recall some results from Ramsey [21]. The proofs are omitted.
```
Theorem 1 If each player uses a threshold strategy and i < j, then r i (t; π) ≥
```
```
r j (t; π).
```
A Partnership Formation Game with Common Preferences … 141
Theorem 2 At an equilibrium, there exists some t0 < μ, such that all players accept
```
any prospective partner when t ≥ t0. When t ≥ t0, then r i (t; π) is strictly decreasing
```
in t.
Theorem 3 At equilibrium, type i individuals always find prospective partners of
type i acceptable.
The following result regarding the mixing population model is new.
Theorem 4 Under the mixing population model, if an individual of type 1 finds a
prospective partner of type j acceptable at time t0, then he/she finds a prospective
partner of type j acceptable at any time t ≥ t0.
Proof A type 1 player faces a problem of one-sided choice. Let t0 < t1 . A type 1
searcher still searching at time t0 can ensure the same reward as a type 1 searcher
```
still searching at time t1 by following the following strategy: Define pi (t; π) = 0 for
```
all i and t > μ. Ignore a prospective partner of type i found at time t0 + t with prob-
```
ability 1 − pi (t1+t;π)pi (t0 +t;π) , otherwise make the same decision that an optimally behaving
```
```
individual of type 1 would make at time t1 +t. Hence r1(t0; π) ≥r1(t1; π) and the
```
theorem follows from the optimality criterion.
Other future reward functions are not necessarily non-increasing in t. Denote the
time when type 1 players start accepting prospective partners of type i at an equilib-
```
rium by t∗1,i . From Theorems 1 and 4, when t ≥ t∗1,i , players of types {1, 2, . . . , i} face
```
```
a one-sided search problem and r j (t; π∗) =r1(t; π∗) for j ∈ {1, 2, . . . , i}. Hence,
```
```
the function r i is non-increasing on the interval (t∗1,i , μ). On the other hand, if t∗1,i > 0,
```
```
then r1(t∗1,i ; π∗) =r i (t∗1,i ; π∗) = vi and ∃δ > 0 such that on an interval (t∗1,i −δ, t∗1,i ) a
```
searcher of type i is not accepted by any prospective partner of value > vi . Thus, for
```
t in this interval and γ > 0, r i (t; π∗) < vi . Hence, r i (t; π∗) is increasing on some
```
```
sub-interval of (0, t∗1,i ).
```
```
It follows that if A1(t) = {1, 2, . . . , i} at an equilibrium, then A j (t) = {1, 2, . . . , i}
```
```
for j ∈ {1, 2, . . . , i}. Hence, A1(t) defines a subpopulation of searchers that a) are
```
```
mutually acceptable as partners at time t and b) do not accept any prospective partners
```
who are not from this subpopulation.
However, it is not always true that at a particular equilibrium the population is par-
titioned at any point in time into subpopulations where prospective partners from the
same subpopulation are mutually acceptable and prospective partners from different
subpopulations are not mutually acceptable. For example, suppose that at equilibrium
```
A1(t) = {1, 2, . . . , i} and A i+1(t) = {i + 1, i + 2, . . . i + j}. Since type 1 individu-
```
als will start accepting type i + 1 individuals as partners before they start accepting
```
type i + j individuals, it follows that r i+1(t; π∗) >r i+ j (t; π∗). For this reason, it
```
is possible that type i + j individuals find type i + j + 1 individuals acceptable at
time t.
```
Based on these arguments, the number of possible partitions of the set {1, 2, . . . , n}
```
into subsets of consecutive integers gives a lower bound on the number of possible
mating patterns at time t at equilibrium. Such a partition can be defined by a binary
142 D. M. Ramsey
string of length n−1 such that types i and i +1 belong to separate subsets if and
only if the i-th element of this binary string equals one. Hence, there are at least 2n−1
possible mating patterns, each corresponding to a different system of n differential
equations describing the current dynamics of the game. Thus, it seems clear that the
complexity of the solutions of such games is at least exponential in the number of
types of prospective partner.
4 Games with Three Types of Player
In this section, we consider the form of equilibria when there are three types of
player and give a general classification of such equilibria. First, we consider the set of
possible mating patterns based on the results given in the previous section. When type
1 players only accept prospective partners of type 1 at time t, then type 2 searchers
```
may either (a) reject prospective partners of type 3 or (b) accept them. In the first case,
```
```
the mating pattern at time t is given by A1(t; π∗) = {1}, A2(t; π∗) = {2}, A3(t; π∗) =
```
```
{3}. In the second case, the mating pattern at time t is given by A1(t; π∗) = {1},
```
```
A i (t; π∗) = {2, 3}, i ∈ {2, 3}. Suppose type 1 players accept prospective partners of
```
```
types 1 and 2 at time t. From Theorem 3, A i (t; π∗) = {1, 2}, i ∈ {1, 2} and A3(t; π∗) =
```
```
{3}. The only other possible mating pattern occurs when type 1 players accept any
```
```
prospective partner at time t. In this case, A i (t; π∗) = {1, 2, 3}, i ∈ {1, 2, 3}. Hence,
```
when n = 3 the number of possible mating patterns is equal to the lower bound
described above, i.e. 2 2 = 4. These mating patterns will thus be indexed by the
binary strings that they correspond to, i.e.
```
Pattern 00: All players accept any prospective partner (random mating).
```
Pattern 01: Searchers of types 1 and 2 are mutually acceptable and type 3 searchers
only pair with prospective partners of type 3.
Pattern 10: Searchers of type 1 only pair with others of type 1 and searchers of
types 2 and 3 are mutually acceptable.
Pattern 11: Searchers only pair with prospective partners of the same type.
```
Let M(t; π∗) denote the mating pattern (given by the appropriate binary string)
```
at time t under an equilibrium profile. To derive the possible forms of equilibria, it
is necessary to consider how these mating patterns can change as time passes. From
Theorem 2, the equilibrium mating pattern switches to 00 at some time t0 , where
t0 < μ, and once this pattern has switched to 00 then it cannot change. Hence, the
pattern 00 can be thought of as an absorbing state of the process of how the mating
pattern evolves over time at an equilibrium.
```
Suppose that M(t; π∗) = 01. From Theorem 4, type 1 searchers cannot become
```
more choosy. Hence, this mating pattern can only switch to the pattern 00 and from
Theorem 2 must eventually switch to this pattern.
```
Suppose that M(t; π∗) = 10. Hence, r1(t; π∗) > v2 . Eventually, type 1 searchers
```
start accepting prospective partners of type 2, say at time t∗1,2 . However, since
A Partnership Formation Game with Common Preferences … 143
```
r1(t∗1,2; π∗) =r2(t∗1,2; π∗) = v2 , from the continuity of the future reward functions,
```
type 2 individuals must stop accepting type 3 individuals at some time t s,∗2,3 , where
t s,∗2,3 < t∗1,2 . Hence, the mating pattern switches to 11 at time t s,∗2,3 .
```
Suppose that M(t; π∗) = 11. There are two possible ways in which the mating
```
pattern can change. Firstly, type 1 searchers can start accepting prospective partners
of type 2, at time t∗1,2 . The second possibility is that type 2 searchers start accepting
prospective partners of type 3, at time t∗2,3 . Note that t∗1,2 = t∗2,3 . This follows from
```
the facts that r2(t∗1,2; π∗) = v2 and r2(t∗2,3; π∗) = v3 < v2 . In the first case, the mating
```
```
pattern first switches to 01 and then must switch to 00 (random mating). In the second
```
case, the mating pattern first switches to 10.
```
The function r is said to ‘upcross’ the value v at time t0 when r(t0) = v and
```
```
∃δ > 0 such that r(t) < v for t in the interval (t0 − δ, t0) and r(t) > v in the interval
```
```
(t0, t0 + δ). The function r is said to ‘downcross’ the value v at time t0 when r(t0) = v
```
```
and ∃δ > 0 such that r(t) > v in the interval (t0 − δ, t0) and r(t) < v in the interval
```
```
(t0, t0 + δ). It follows that when r upcrosses v at time t0 , then for values of t slightly
```
```
smaller than t0 , r(t) < v and for values of t slightly greater than t0 , r(t) > v. Similarly,
```
```
when r downcrosses v at time t0 , then for values of t slightly smaller than t0 , r(t) > v
```
```
and for values of t slightly greater than t0 , r(t) < v. Intuitively, when r2 downcrosses
```
v3 , then type 2 searchers should switch from rejecting prospective partners of type 3
to accepting them. Analogously, when r2 upcrosses v3 , then type 2 searchers should
switch from accepting prospective partners of type 3 to rejecting them.
The following theorem, when used in conjunction with the arguments presented
above, leads to the main theorem of the paper, Theorem 6, which classifies the pos-
sible forms of equilibrium profiles in games with three types of prospective partner.
Theorem 5 At any equilibrium profile, the function r2 has at most one upcrossing
of the value v3.
Proof Suppose that the function r2 upcrosses the value v3 at times t u,1 and t u,2 ,
where t u,1 < t u,2 . From the form of an equilibrium t u,2 < t∗1,2 . From the continuity of
the function r2 , there must be a downcrossing of the value v3 at some time t d , where
```
t d ∈ (t u,1, t u,2). By definition r2(t u,1; π∗) =r2(t u,2; π∗) =r2(t d ; π∗) = v3 . At such an
```
```
equilibrium, type 2 players reject prospective partners of type 3 when t ∈ (tu,1, t d )
```
```
and accept them when t ∈ (t d , t u,2). Conditioning on whether a type 2 player finds a
```
```
partner in the time interval (t d , t u,2),
```
```
r2(td ; π∗) = v3 = v
```
∫ tu,2
```
td[ p2(t; π
```
```
∗)+ p3(t; π∗)]exp
```
[
−
∫ t
```
tdγ + p2(s; π
```
```
∗)+ p3(s; π∗)ds
```
]
dt +
```
+v3 exp[−γ (tu,2 − td )] p2(tu,2; π
```
```
∗)
```
```
p2(td ; π∗) , (6)
```
```
where v = v2 p2 (td ;π∗)+v3 p3 (td ;π∗)p2 (td ;π∗)+ p3 (td ;π∗) .
```
Assume that t d −t u,1 ≥ t u,2 −t d . Suppose an individual type 2 player accepts a
```
prospective partner of type i, i = 2, 3 at time t u,1 + t, where t ∈ I = (0, t u,2 − t d ) with
```
```
probability pi (td +t;π∗ )pi (tu,1+t;π∗ ) and for t /∈ I uses the strategy appropriate to the equilibrium
```
profile. When t ∈ I , such a player finds mutually acceptable partners of a given type at
144 D. M. Ramsey
the same rate as an optimally behaving type 2 player at time t d + t. Conditioning on
```
whether such a player finds a mutually acceptable partner in the interval (tu,1, t u,1 +
```
```
t u,2 −t d ), his/her expected future reward at time t u,1 is r2,m (t u,1; π∗), where
```
```
r2,m (tu,1; π∗) = v
```
∫ tu,2
td
```
[ p2(t; π∗)+ p3(t; π∗)]exp
```
[
−
∫ t
td
```
γ + p2(s; π∗)+ p3(s; π∗)ds
```
]
dt +
```
+r2(tu,1 + tu,2 − td ; π∗) exp[−γ (tu,2 − td )] p2(tu,2; π
```
```
∗)
```
```
p2(td ; π∗) .
```
```
Note that r2(t u,1 +t u,2 −t d ; π∗) ≥ v3 , since t u,1 +t u,2 −t d ∈ (t u,1, t d ]. It follows from
```
```
Eq. (6) that r2,m (t u,1; π∗) ≥ v3 . Note that such a player acts strictly suboptimally,
```
since he/she rejects prospective partners of type 2 with a positive probability. This
```
gives a contradiction, since by assumption r2(t u,1; π∗) = v3 .
```
Now assume that t d −t u,1 < t u,2 −t d . Conditioning on whether an optimally behav-
```
ing type 2 player finds a prospective partner in the interval (t d , 2t d −t u,1), we obtain
```
```
r2(td ; π∗) = v
```
∫ 2td −tu,1
td
```
[ p2(t; π∗)+ p3(t; π∗)]exp
```
[
−
∫ t
td
```
γ + p2(s; π∗)+ p3(s; π∗)ds
```
]
dt +
```
+r2(2td − tu,1; π∗) exp[−γ (td − tu,1)] p2(2td − tu,1; π
```
```
∗)
```
```
p2(td ; π∗) .
```
```
This equation can be written in the form r2(t d ; π∗) = R1 P(A) + R2[1 − P(A)],
```
```
where P(A) is the probability of such a searcher (call him/her searcher i) finding a
```
```
partner in the interval (td , 2t d − t u,1), R1 is the expected reward of such a searcher
```
```
in this case and R2 = r2(2t d − t u,1; π∗) exp[−γ (t d − t u,1)] is the expected reward of
```
such a searcher given that a partnership is not formed in this interval.
```
From the differential equations describing the game’s dynamics, p2 (t;π∗)p3 (t;π∗) is either
```
```
non-increasing or increasing on the interval (t u,1, t d ). In the first case, the mean value
```
```
of a prospective partner is non-increasing in t. Consider a type 2 player (call him/her
```
```
searcher ii) who accepts any prospective partner on the interval (tu,1, t d ) [of the same
```
```
length as the interval (t d , 2t d − t u,1)] and thereafter acts optimally. Arguing as above,
```
```
r2(t u,1; π∗) ≥ R3 P(B) + R4[1 − P(B)], where P(B) is the probability of such a
```
```
player finding a partner in the interval (t u,1, t d ), R3 is the expected reward of such
```
```
a player in this case and R4 = v3 exp[−γ (t d − t u,1)] is the expected reward of this
```
```
player given that a partnership is not formed in this interval. Since r i (t u,1 +t; π∗) >
```
```
r i (t d +t; π∗), it follows that P(B) > P(A). Also, the expected value of a prospective
```
partner found at time t u,1 +t by searcher ii is at least as great as the expected value
of a prospective partner found at time t d +t by searcher i. Hence, R3 ≥ R1 . Also,
```
R3 ≥ R4 > R2 (the first inequality results from the fact that the reward is the product
```
of the value of the partner found and the discount, which is by definition more severe
```
when a partner is found later) and R4 ≤ v3 . Hence,
```
```
r2(t u,1; π∗) ≥ R3 P(A) + R4[1 − P(A)] > R1 P(A) + R2[1 − P(A)] = r2(t d ; π∗).
```
A Partnership Formation Game with Common Preferences … 145
```
This contradicts the initial assumption that r2(t u,1; π∗) = r2(t d ; π∗) = v3 .
```
```
Now suppose that p2 (t;π∗)p3 (t;π∗) is increasing on the interval (t u,1, t d ). Consider a type
```
```
2 player who on the interval t ∈ (t u,1, t d ) accepts prospective partners of type 2 and
```
```
3 at time t with probability 1 and β(t), respectively, where β(t) = p2 (t;π∗) p3 (td ;π∗)p3 (t;π∗) p2 (td ;π∗) .
```
Under such a strategy, the ratio between the rate of accepting prospective partners of
```
type 2 and the rate of accepting prospective partners of type 3 when t ∈ (tu,1, t d ) isp
```
```
2 (td ;π∗)p
```
```
3(td ;π∗) . Assume that for t ≥ t d , such a player (call him/her searcher iii) follows theoptimal strategy. The expected value of a prospective partner accepted by searcher
```
```
iii when t ∈ (t u,1, t d ) is equal to the expected value of a prospective partner accepted
```
```
by an optimally behaving type 2 player in the interval (td , 2t d −t u,1). Arguing as in
```
```
the case of searcher ii, we obtain r2(t u,1; π) ≥ R5 P(C)+ R4[1− P(C)], where R5
```
is the expected reward of searcher iii given that he/she forms a partnership in the
```
interval (t u,1, t d ), P(C) is the probability that such a partnership is formed. Since for
```
```
t ∈ (t u,1, t d ), p2(t; π∗) > p2(t d ; π∗), it follows that P(C) > P(A) and R5 ≥ R1 . The
```
rest of the proof is analogous to the case of searcher ii and is hence omitted.
Theorem 6 When there are three types of prospective partner, any equilibrium
can be described by at most four switching times t∗2,3, t s,∗2,3 , t∗1,2 and t∗1,3, where
t∗2,3 ≤ t s,∗2,3 ≤ t∗1,2 ≤ t∗1,3. When t∗2,3 > 0, it denotes the time at which type 2 players
start accepting prospective partners of type 3, as long as type 1 players are not yet
accepting prospective partners of type 2. When t s,∗2,3 > 0, it denotes the time at which
type 2 players stop accepting prospective partners of type 3. When t∗1,2 > 0, it denotes
the time at which type 1 players start accepting prospective partners of type 2. When
t∗1,3 > 0, it denotes the time at which both type 1 and type 2 players start accepting
prospective partners of type 3. The possible forms of equilibria are described below:
0 switching times: Random mating. Each player accepts the first prospective part-
```
ner (t∗2,3 = t s,∗2,3 = t∗1,2 = t∗1,3 = 0). A necessary and sufficient
```
```
condition for such an equilibrium is r1(0; π∗) ≤ 1.
```
1 switching time: Initially, type 1 and 2 players pair, but type 3 searchers are
only acceptable to prospective partners of type 3. Such an
equilibrium is characterized by one positive switching time
```
t∗1,3 , where r1(t∗1,3; π∗) = 1. The other necessary condition for
```
```
such an equilibrium is r1(0; π∗) ≤ v2 .
```
2 switching times: Initially players only pair with those of the same type. The
equilibrium is defined by two positive switching times: t∗1,2 and
```
t∗1,3 , where t∗1,2 < t∗1,3 , r1(t∗1,2; π∗) = v2 and r1(t∗1,3; π∗) = 1. A
```
```
necessary condition for such an equilibrium is that r2(t; π∗) >
```
1 for t < t∗1,3 .
3 switching times: Initially, type 2 and 3 players pair, but type 1 searchers only
pair with prospective partners of type 1. Such an equilibrium
is characterized by three positive switching times: t s,∗2,3 , t∗1,2 and
```
t∗1,3 , where t s,∗2,3 < t∗1,2 < t∗1,3 , r2(t s,∗2,3 ; π∗) = 1, r1(t∗1,2; π∗) = v2
```
```
and r1(t∗1,3; π∗) = 1. The following is also a necessary con-
```
```
dition: r2(0; π∗) ≤ 1.
```
146 D. M. Ramsey
4 switching times: Initially players only pair with those of the same type. The
equilibrium is defined by four positive switching times: t∗2,3 ,
```
t s,∗2,3 , t∗1,2 and t∗1,3 , where t∗2,3 < t s,∗2,3 < t∗1,2 < t∗1,3 , r2(t∗2,3; π∗) =
```
```
r2(t s,∗2,3 ; π∗) = 1, r1(t∗1,2; π∗) = v2 and r1(t∗1,3; π∗) = 1.
```
These results follow from previous arguments. Note that the equilibrium strategy
of type 1 players is given by the switching times t∗1,2 and t∗1,3 . The equilibrium strategy
of type 2 players is given by t∗2,3 , t s,∗2,3 and t∗1,3 . Type 3 players accept any prospective
partner. These equilibria are considered in more detail in the following section.
5 Examples
Ramsey [21] found that, when there are two types of player, multiple equilibria can
occur when highly attractive partners are relatively rare. Example 1 is based on a
similar set of problems. Example 2 is based on a set of problems where type 2 and
type 3 players are of similar attractiveness. This example illustrates equilibria at
which type 2 players can switch from accepting prospective partners of type 3 to
rejecting them for some period of time. In both examples, the length of the mating
season, as well as the values and initial frequencies of the various types are fixed,
but the discount rate γ is varied to illustrate the full range of possible equilibria and
the existence of multiple equilibria.
In the first example, it is assumed that μ = 100, v1 = 36, v2 = 6, v3 = 1, p1 =
0.01, p2 = 0.09 and p3 = 0.9. In the second example, it is assumed that μ = 100, v1 =
6, v2 = 1.1, v3 = 1 and p1 = p2 = p3 = 1/3. Each of the five following subsections
```
illustrate how to derive (or estimate) an equilibrium with a given number of posi-
```
tive switching times. In each case, the strategy profile is assumed to be of the form
considered in that subsection.
Note that the constants of integration appropriate to the systems of differential
equations defining the dynamics of the game depend on the strategy profile used.
To keep the notation simple, these dependencies are not made explicit. The constant
k i denotes the ratio between the rates at which prospective partners of type i and
prospective partners of type 1, respectively, are found when t ≥ t1,i . The constant
k3,2 describes the ratio between the rates at which prospective partners of type 3
and prospective partners of type 2, respectively, are found when a type 2 player is
mutually acceptable to a type 3 player, but type 1 players only pair with prospective
partners of type 1. Any other constant of integration is denoted by ci and these values
are specific to the subsection, i.e. c1 in Sect. 5.3 is not equivalent to c1 in Sect. 5.4.
A Partnership Formation Game with Common Preferences … 147
5.1 Random Mating—No Switching Times
First, we consider the conditions required for random mating to be an equilibrium.
Intuitively, such an equilibrium exists only for relatively large values of γ . From Eq.
```
(3), the set of differential equations describing the rate at which prospective partners
```
are found under such an equilibrium is given by
```
dpi (t; π)
```
```
dt = − pi (t; π)[ p1(t; π) + p2(t; π) + p3(t; π)], i ∈ {1, 2, 3}. (7)
```
```
It follows from these equations and the boundary conditions at t = 0 that p j (t; π) =
```
```
k j p1(t; π), j ∈ {2, 3}, where k j = p jp1 . Substituting these relationships into Eq. (7)
```
with i = 1, we obtain
```
pi (t; π) = pit + 1 , i ∈ {1, 2, 3}. (8)
```
A necessary and sufficient condition for random mating to be a Nash equilibrium is
```
given by r1(0; π) ≤ v3 = 1. From Eq. (5),
```
```
r1(0; π) =
```
∫ 100
0
p1v1 + p2v2 + p3
t + 1 exp
[
−
∫ t
0
```
{
```
γ + 1s + 1
```
}
```
ds
]
dt.
=
∫ 100
0
p1v1 + p2v2 + p3
```
(t + 1)2 exp(−γ t)dt ≤ 1.
```
This integral was approximated using the inbuilt integration function used in the R
```
package (see Piessens [17]). Solving this inequality numerically with respect to γ ,
```
using the method of bisection, it follows that random mating is a Nash equilibrium
for Example 1 if and only if γ ≥ γ1,1 , where γ1,1 ≈ 0.4575 and is a Nash equilibrium
for Example 2 if and only if γ ≥ γ1,2 , where γ1,2 ≈ 1.1905.
5.2 One Switching Time
At such an equilibrium, type 1 and type 2 players always pair with each other, but only
pair with prospective partners of type 3 when t ≥ t∗1,3 . In this section, the strategy
profile π denotes any strategy profile of this form such that the switching time, t1,3 ,
```
takes a value in (0, μ). The strategy profile π∗ denotes an equilibrium strategy profile
```
of this form. Note that if such an equilibrium exists, then its derivation reduces to
a problem in which there are only two types of player. In this case, players of type
1 and 2 are grouped together to form a type whose initial frequency is p1 + p2 and
value p1v1+ p2 v2p1+ p2 . The derivation of such equilibria was considered in Ramsey [21].
```
The equilibrium condition in this reduced problem is r1(t∗1,3, π∗) = 1. Note, however,
```
that for the unreduced problem, it is necessary to check the additional equilibrium
148 D. M. Ramsey
condition stating that initially type 1 searchers should accept type 2 searchers, i.e.
```
r1(0; π∗) ≤ v2 .
```
```
From Eq. (3), when t < t1,3 the rates at which prospective partners are found
```
under such a strategy profile is given by
```
dpi (t; π)
```
```
dt = − pi (t; π)[ p1(t; π)+ p2(t; π)], i ∈ {1, 2};
```
```
dp3(t; π)
```
```
dt = −[ p3(t; π)]
```
2.
```
(9)
```
```
Note that p2(t; π) = k2 p1(t; π), where from the boundary condition at t = 0, k2 =p
```
2p
```
1 . Solving the system of equations given by (9), it follows that
```
```
pi (t; π) = pi( p
```
```
1 + p2)t + 1
```
```
, i ∈ {1, 2}; p3(t; π) = p3p
```
3t + 1
```
. (10)
```
```
When t > t1,3 , this set of differential equations is given by Eq. (7). Again p2(t; π) =
```
```
k2 p1(t; π). Also, p3(t; π) = k3 p1(t; π), where k3 is calculated from the boundary
```
```
condition at t = t1,3 using the set of equations given by (10), i.e.
```
```
k3 = p3(t1,3; π)p
```
```
1(t1,3; π)
```
```
= p3[( p1 + p2)t1,3 + 1]p
```
1[ p3t1,3 + 1]
.
```
Solving the system of differential equations given by (7), based on the continuity of
```
the functions pi , we obtain that for t > t1,3
```
p1(t; π) = 1(1 + k
```
```
2 + k3)t + c1
```
```
; pi (t; π) = k i(1 + k
```
```
2 + k3)t + c1
```
```
, i ∈ {2, 3},
```
```
(11)
```
where c1 = 1p1 − k3t1,3 . The expected value of a prospective partner when t > t1,3 is
given by
```
v = v1 + k2v2 + k3v31 + k
```
2 + k3
```
= [ p3t1,3 + 1][v1 p1 + v2 p2] + p3[( p1 + p2)t1,3 + 1][ p
```
```
3t1,3 + 1][ p1 + p2] + p3[( p1 + p2)t1,3 + 1]
```
.
```
From Eq. (5) and the equilibrium condition, t∗1,3 satisfies
```
1 = v
∫ 100
t∗1,3
3∑
```
i=1
```
```
pi (t; π∗) exp
```
[
−
∫ t
t∗1,3
```
{
```
γ +
3∑
```
i=1
```
```
pi (s; π∗)
```
```
}
```
ds
]
dt.
= v
∫ 100
t∗1,3
```
(1 + k2 + k3)[(1 + k2 + k3)t∗1,3 + c1] exp[−γ (t − t∗1,3)]
```
```
[(1 + k2 + k3)t + c1)]2 dt. (12)
```
This equation was solved numerically using a program written in R. The value
```
of r1(t1,3; π) was approximated over a dense grid of values of t1,3 (note that π is
```
```
defined by t1,3 , thus as t1,3 varies, so does π). This procedure also checked the other
```
A Partnership Formation Game with Common Preferences … 149
```
necessary condition, r1(0; π∗) ≤ v2 . Considering the probability that a type 1 player
```
does not find a partner before time t∗1,3 and his/her expected reward from that time
```
onwards (v3 = 1), it follows that
```
```
r1(0; π∗) = v1 p1 + v2 p2p
```
1 + p2
∫ t∗1,3
0
```
( p1 + p2) exp(−γ t)
```
```
[( p1 + p2)t + 1]2 dt +
```
```
exp(−γ t∗1,3)
```
```
( p1 + p2)t∗1,3 + 1 .
```
In the case of Example 1, such an equilibrium exists when γ ≥ γ2,1 , where
```
γ2,1 ≈ 0.0245 satisfies the equation r1(0; π∗) = v2 . Numerical results indicate that
```
```
r1(t1,3; π) has at most a single maximum point and the maximum value of the
```
```
function is decreasing in γ . Hence, there exists an equilibrium of this form when
```
```
maxt1,3∈[0,100] r1(t1,3; π) ≥ 1. Solving this inequality numerically with respect to γ ,
```
```
such an equilibrium exists if γ ≤ γ3,1 , where γ3,1 ≈ 0.4755. When γ ∈ [γ2,1, γ1,1) ≈
```
```
[0.0245, 0.4575), then there is exactly one solution of r1(t1,3; π) = 1, i.e. there is a
```
```
unique equilibrium of this form. If γ ∈ (γ1,1, γ3,1) ≈ (0.4575, 0.4755), there exist two
```
```
positive solutions of r1(t1,3; π) = 1 and, in addition, random mating is an equilibrium
```
strategy profile. Hence, three equilibria exist for such discount rates. The stability
```
of such equilibria based on the concept of a neighbourhood invasion strategy (NIS)
```
```
(see Apaloo [4]), will be considered in Sect. 5.6. The equilibrium switching times
```
are illustrated in Fig. 1. The graph on the left illustratres the equilibrium switching
times when there is a unique equilibrium. The graph on the right presents the equilib-
```
rium switching times when multiple equilibria exist (the lower curve gives the Nash
```
0.0 0.1 0.2 0.3 0.4
0
20
40
60
80
100
Discount rate
Equilibrium switching time
0.460 0.465 0.470 0.475
0.0

0.5

1.0

1.5

2.0

2.5
Discount rate
Equilibrium switching time
NIS
Nash
Fig. 1 Equilibrium switching times, t∗1,3 for Example 1, v1 = 36, v2 = 6, v3 = 1, p1 = 0.01, p2 =
0.09, p3 = 0.9, as a function of the discount rate, γ , when type 1 searchers always accept prospective
```
partners of type 2. Left: unique equilibrium switching time, γ ∈ [0.0245, 0.4575) Right: close up
```
```
of solutions when multiple equilibria exist, γ ∈ (0.4575, 0.4755)—see also Sect. 5.6
```
150 D. M. Ramsey
equilibrium switching time which does not satisfy the stronger condition based on
```
the concept of an NIS).
```
In the case of Example 2, based on a similar approach, such an equilibrium exists
```
if γ ∈ (γ2,2, γ1,2) ≈ (1.0371, 1.1905). Numerical calculations indicate that, for fixed
```
```
γ , r1(t1,3; π) is decreasing in t1,3 . Hence, there is no region in which there exist
```
multiple equilibria, including random mating as one.
5.3 Two Switching Times
Such equilibria are described by two parameters t∗1,2 and t∗1,3 . Consider a strategy
```
profile of this form with switching times t1,2 and t1,3 . From Eq. (3), for t < t1,2 the
```
differential equations determining the dynamics of the game are
```
dpi (t; π)
```
```
dt = −[ pi (t; π)]
```
```
2, i ∈ {1, 2, 3}. (13)
```
Solving these differential equations using the boundary conditions at t = 0, we obtain
```
pi (t; π) = pip
```
i t + 1
```
, i ∈ {1, 2, 3}. (14)
```
For t1,2 < t < t1,3 , the system of differential equations determining the dynamics
```
of the game is given by (9). Solving this system of equations using the boundary
```
```
conditions at t = t1,2 , p3(t; π) is given by Eq. (14) and
```
```
p1(t; π) = 1(1 + k
```
```
2)t + c2
```
```
, p2(t; π) = k2(1 + k
```
```
2)t + c2
```
,
where
```
k2 = p2(t1,2; π)p
```
```
1(t1,2; π)
```
= p2[ p1t1,2 + 1]p
1[ p2t1,2 + 1]
```
; c2 = 1p
```
1
− k2t1,2.
For t > t1,3 , the differential equations determining the dynamics of the game are
```
given by (7). Solving these equations using the boundary conditions at t = t1,3 , we
```
obtain
```
p1(t; π) = 1(1 + k
```
```
2 + k3)t + c1
```
```
; pi (t; π) = k i(1 + k
```
```
2 + k3)t + c1
```
```
, i ∈ {2, 3},
```
where
```
k3 = p3(t1,3; π)p
```
```
1(t1,3; π)
```
```
= p3[(1 + k2)t1,3 + c2]p
```
3t1,3 + 1
```
; c1 = c2 − k3t1,3.
```
A Partnership Formation Game with Common Preferences … 151
```
Such an equilibrium satisfies r1(t∗1,3; π∗) = 1 and r1(t∗1,2; π∗) = v2 . The first condition
```
```
corresponds to Eq. (12). Considering whether or not a searcher of type 1 forms a
```
```
partnership in the time interval (t∗1,2, t∗1,3) and setting v2 = v1+k2 v21+k2 , it follows from
```
the second condition that
```
r1(t1,2; π∗) = v2
```
∫ t∗1,3
t∗1,2
```
[ p1(t; π∗)+ p2(t; π∗)]exp
```
[
−
∫ t
t∗1,2
```
[γ + p1(s; π∗)+ p2(s; π∗)]ds
```
]
dt+
+
```
exp[−γ (t∗1,3 − t∗1,2)] p1(t∗1,3; π∗)
```
```
p1(t∗1,2; π∗) = v2. (15)
```
In addition, a type 2 player should reject a prospective partner of type 3 at any time
```
t for t < t∗1,2 , i.e. r2(t; π∗) > v3, ∀t < t∗1,2 . Conditioning on whether such a searcher
```
finds a partner before time t∗1,2 , it follows from this that for any t < t∗1,2
v3 ≤ v2
∫ t∗1,2
t
```
p2(s; π∗) exp
```
[
−
∫ s
t
```
{γ + p2(τ ; π∗)}dτ
```
]
ds +
- v2 exp[−γ (t
```
∗1,2 − t)] p2(t∗1,2; π∗)
```
```
p2(t; π∗) . (16)
```
```
Such equilibria were estimated by solving Eqs. (12) and (15). First, t1,2 was varied
```
```
over a grid of values over the interval [0, 100) with step length 0.1 to obtain an
```
initial estimate of any Nash equilibria and then a fine grid search was used. For a
given value of t1,2 , the resulting subgame defined for t ≥ t1,2 was solved by finding
```
the value of t1,3 satisfying r1(t1,3; π) = 1. This sub-procedure is analogous to the
```
```
procedure described in Sect. 5.2. The equilibrium condition given by Inequality (16)
```
was then checked by numerical calculation.
Considering Example 1, such an equilibrium exists when γ ≤ γ4,1 ≈ 0.0255. This
```
bound was estimated by finding the value of γ for which r1(0; π∗) = v2 using
```
```
the method of bisection. Note that multiple equilibria occur when γ ∈ (γ2,1, γ4,1) ≈
```
```
(0.0245,0.0255). Table 2 gives numerical results for various discount rates.
```
Now consider Example 2. Such an equilibrium exists if the discount rate is slightly
less than γ2,2 . For such discount rates, type 1 players start accepting prospective
```
Table 2 Switching times at equilibrium for Example 1 (v1 = 36, v2 = 6, v3 = 1, p1 = 0.01, p2 =
```
```
0.09, p3 = 0.9), when the equilibrium is given by two parameters
```
Discount rate, γ t∗1,2 Equilibrium 1 t∗1,3 Equilibrium 1 t∗1,2 Equilibrium 2 t∗1,3 Equilibrium 2
0 66.6642 94.4415 – –
0.01 58.1484 93.8638 – –
0.02 39.7536 92.4862 – –
0.0245 0.1530 85.4398 20.8199 90.4273
0.025 2.2276 86.2493 17.1265 89.8591
152 D. M. Ramsey
```
Table 3 Switching times at equilibrium for Example 2 (v1 = 6, v2 = 1.1, v3 = 1, p1 = p2 = p3 =
```
```
1/3), when the equilibrium is given by two parameters t∗1,2, t∗1,3
```
Discount rate
γ
t∗1,2 t∗1,3 Discount rate
γ
t∗1,2 t∗1,3
0 81.1167 82.8451 1.005 0.0964 0.3178
0.001 80.9160 82.6727 1.015 0.0661 0.3011
0.002 80.7100 82.4964 1.025 0.0362 0.2846
0.003 80.4982 82.3014 1.035 0.0066 0.2685
partners of type 2 at some positive, but relatively small, time. Hence, it pays type 2
players not to pair with type 3 players initially in the hope of pairing with a type 1
```
player. This is the case when r2(0; π∗) ≥ 1. Secondly, suppose that the discount rate
```
is zero and that type 1 players do not initially accept prospective partners of other
```
types (which is expected since type 1 players are common and much more attractive
```
```
than other prospective partners). Based on Condition (16), the expected reward of
```
a type 2 player at equilibrium given that he/she finds a partner before time t∗1,2 is
```
v2 (type 2 players only pair with other individuals of type 2 and the reward is not
```
```
discounted). Given that a type 2 player is still searching at time t∗1,2 , then his/her
```
```
expected reward from future search is r1(t∗1,2; π∗), which is by definition v2 . Hence,
```
for any t < t∗1,2 , the future expected reward of a type 2 player at equilibrium must
```
be v2 . As γ increases, the minimum value of r2(t; π∗) on the interval [0, t∗1,2) will
```
decrease. Hence, the equilibrium will be defined by two parameters, t∗1,2 and t∗1,3 , for
```
discount rates close to zero. This holds when mint∈[0,t∗1,2 ) r2(t; π∗) ≥ 1.
```
Numerical calculations indicate that the equilibrium is of this form when γ ∈
```
(γ3,2, γ2,2) ≈ (1.0050, 1.0371) and γ ≤ γ4,2 ≈ 0.0032. Table 3 gives estimates of
```
the equilibria for such discount rates.
5.4 Three Switching Times
Such an equilibrium is defined by three parameters: t s,∗2,3 , t∗1,2 and t∗1,3 , where t s,∗2,3 <
t∗1,2 < t∗1,3 . Consider a strategy profile of this form with switching times t s2,3 , t1,3 and
```
t2,3 . From Eq. (3), for t < t s2,3 ,
```
```
dp1(t; π)
```
```
dt = −[ p1(t; π)]
```
```
2; dpi (t; π)
```
```
dt = − pi (t; π)[ p2(t; π)+ p3(t; π)], i ∈ {2,3}.(17)
```
```
Hence, on this interval p3(t; π) = k3,2 p2(t; π), where k3,2 = p3p2 . Using the boundary
```
conditions at t = 0, solving this system leads to
```
p1(t; π) = p1p
```
1t + 1
```
; pi (t; π) = pi( p
```
```
2 + p3)t + 1
```
```
, i ∈ {2, 3}. (18)
```
A Partnership Formation Game with Common Preferences … 153
For t s2,3 < t < t1,2 , the system of differential equations describing the dynamics of
```
the game are given by (13). Solving this system of differential equations using the
```
```
boundary conditions at t = t s2,3 , p1(t; π) is as given in (18). In addition,
```
```
p2(t; π) = 1t + c
```
4
```
; p3(t; π) = 1t + c
```
3
```
, (19)
```
```
where c4 = k3,2t s2,3 + 1p2 ; c3 = t
```
s2,3
k3,2 + 1p3 .
When t1,2 < t < t1,3 , the differential equations determining the game’s dynamics
```
are given by (9). Using the boundary conditions at t = t1,2 , we obtain
```
```
p1(t; π) = 1(1 + k
```
```
2)t + c2
```
```
; p2(t; π) = k2(1 + k
```
```
2)t + c2
```
,
```
where k2 = p2 (t1,2 ;π)p1 (t1,2 ;π) = p1t1,2 +1p1[t1,2 +c4 ] and c2 = 1p1 −k2t1,2 . Note that p3(t; π) is given by
```
```
the relevant equation in (19).
```
For t > t1,3 , the differential equations determining the dynamics of the game are
```
given by (7). Using the boundary conditions at t = t1,3 , it follows that
```
```
p1(t; π) = 1(1 + k
```
```
2 + k3)t + c1
```
```
; pi (t; π) = k i(1 + k
```
```
2 + k3)t + c1
```
```
, i ∈ {2, 3},
```
```
where k3 = p3(t1,3;π)p1(t1,3;π) = (1+k2 )t1,3+c2t1,3+c3 ; c1 = c2 − k3t1,3. The necessary and sufficient
```
```
conditions for such an equilibrium are: 1) r1(t∗1,3; π∗) = 1, 2) r1(t∗1,2; π∗) = v2 , 3)
```
```
r2(t s,∗2,3 ; π∗) = 1 and 4) r2(0; π∗) ≤ 1. The first two conditions are equivalent to Eqs.
```
```
(12) and (15), respectively.
```
The third condition is equivalent to
```
r2(t s,∗2,3 ; π∗) = v2
```
∫ t∗1,2
t s,∗2,3
```
p2(t; π∗) exp
```
[
−
∫ t
t s,∗2,3
```
{γ + p2(t; π∗)}ds
```
]
dt +
- v2 exp[−γ (t
```
∗1,2 − t s,∗2,3 )] p2(t∗1,2; π∗)
```
```
p2(t s,∗2,3 ; π∗) = 1. (20)
```
```
From Eq. (20), r2(t s,∗2,3 ; π∗) > v2 exp[−γ (t∗1,2 − t s,∗2,3 )] > v2e−100γ . Hence, for such
```
```
an equilibrium to exist, v2e−100γ ≤ 1. This leads to γ ≥ ln(v2)/100. For Example 1,
```
```
this gives γ ≥ ln(6)/100 ≈ 0.0179. Also, the discount factor must be small enough
```
for type 1 players to initially only pair with other type 1 players. The previous section
indicated that this requires γ ≤ γ4,1 ≈ 0.0255. Hence, if such an equilibrium exists
for a game corresponding to Example 1, the discount rate must belong to a narrow
interval. In addition, the lower bound on γ derived above is not expected to be tight.
Given these facts, it is unsurprising that no such equilibrium was found for a game
corresponding to Example 1.
154 D. M. Ramsey
```
Table 4 Equilibria for Example 2 (v1 = 6, v2 = 1.1, v3 = 1, p1 = p2 = p3 = 1/3), when an equi-
```
librium is given by three switching times t s,∗2,3 , t∗1,2, t∗1,3
Discount
rate γ
t s,∗2,3 t∗1,2 t∗1,3 Discount
rate γ
t s,∗2,3 t∗1,2 t∗1,3
0.01 69.15 79.02 81.07 0.3 7.78 8.10 9.04
0.02 71.41 76.26 78.74 0.4 5.04 5.28 5.97
0.05 58.13 60.05 64.50 0.6 2.28 2.44 2.87
0.1 29.67 30.63 33.58 0.8 0.88 1.00 1.30
0.2 13.26 13.74 15.19 1.0 0.01 0.11 0.33
```
In Example 2, such an equilibrium exists if γ ∈ (γ5,2, γ3,2) ≈ (0.0094, 1.0050),
```
```
where γ3,2 and γ5,2 are solutions of the equation r2(0, π∗) = 1. Table 4 presents the
```
equilibrium for such values of the discount rate. A very rough estimate of the equilib-
rium is obtained by assuming that all the switching times are integers and minimizing
```
the Euclidean distance between the vectors [r1(t1,3; π), r1(t1,2; π), r2(t s2,3; π)] and
```
[1, v2, 1]. This is followed by a local search over a denser grid of parameter values.
5.5 Four Switching Times
```
Such an equilibrium is described by 1) t∗2,3 , 2) t s,∗2,3 , 3) t∗1,2 and 4) t∗1,3 , where t∗2,3 <
```
t s,∗2,3 < t∗1,2 < t∗1,3 . Consider a strategy profile of the same form, where the switching
times are given by t2,3, t s2,3, t1,2 and t1,3 , respectively. For t < t2,3 , since players only
pair with those of the same type, the rates at which prospective partners are found
```
are given by the set of equations in (14).
```
For t > t2,3 , the mating patterns evolve analogously to the equilibrium described in
```
Sect. 5.3. Hence, on the intervals a) t2,3 < t < t s2,3 , b) t s2,3 < t < t1,2 and c) t1,2 < t < t1,3 ,
```
the systems of differential equations determining the dynamics of the game are
```
given by the set of equations in (17), (13) and (9), respectively. Solving these sets of
```
differential equations, we obtain
```
p1(t; π) =
```
```
{ p1
```
p1t+1 , t ≤ t1,21
```
(1+k2 )t+c2 , t1,2 < t < t1,3
```
```
p2(t; π) =
```
⎧
⎪⎨
⎪⎩
```
1(1+k
```
```
3,2 )t+c5 , t2,3 < t < t
```
s2,3
1t+c
4 , t
s2,3 < t < t1,2
```
k2(1+k
```
```
2 )t+c2 , t1,2 < t < t1,3
```
```
p3(t; π) =
```
```
{ k3,2
```
```
(1+k3,2 )t+c5 , t2,3 < t < t s2,31
```
t+c3 , t s2,3 < t < t1,3
,
A Partnership Formation Game with Common Preferences … 155
```
Table 5 Equilibria for Example 2 (v1 = 6, v2 = 1.1, v3 = 1, p1 = p2 = p3 = 1/3), when an equi-
```
librium is given by four switching times t∗2,3, t s,∗2,3 , t∗1,2, t∗1,3
Discount rate γ t∗2,3 t s,∗2,3 t∗1,2 t∗1,3
0.004 7.0 53.0 80.3 82.2
0.006 2.4 62.8 79.9 81.8
0.008 0.7 67.1 79.5 81.5
0.009 0.2 68.5 79.3 81.3
```
where k2 = p2 (t1,2 ;π)p1 (t1,2 ;π) , c2 = 1p1 − k2t1,2 , k3,2 = p3(t2,3;π)p2 (t2,3;π) , c5 = 1p2 − k3,2t2,3 , c4 = c5 +
```
k3,2t s2,3 , c3 = t
s2,3+c5
k3,2 .
```
For t > t1,3 , the dynamics of the game are given by Eq. (11), where c1 = c2 −
```
k3t1,3 .
```
The four equilibrium conditions are: (1) r1(t∗1,3; π∗) = 1, (2) r1(t∗1,2; π∗) = v2 ,
```
```
(3) r2(t s,∗2,3 ; π∗) = 1 and 4) r2(t∗2,3; π∗) = 1. The first three conditions correspond to
```
```
Eqs. (12), (15) and (20). The fourth condition corresponds to
```
```
r2(t∗2,3; π∗) =v2,3
```
∫ t s,∗2,3
t∗2,3
```
[ p2(t; π∗)+ p3(t; π∗)]exp
```
[
−
∫ t
t∗2,3
```
[γ + p2(s; π∗)+ p3(s; π∗)]ds
```
]
dt+
+
```
exp[−γ (t s,∗2,3 − t∗2,3)] p2(t s,∗2,3 ; π∗)
```
```
p2(t∗2,3; π∗) = 1,
```
where v2,3 = v2 +k3,21+k3,2 . Equilibria were estimated using a procedure analogous to the
estimation of equilibria defined by three switching times. As mentioned above, no
such equilibria exist for Example 1. Numerical results for Example 2 are presented
in Table 5.
5.6 Multiple Equilibria
Ramsey [21] found multiple Nash equilibria in games of this type when there are
only two types of prospective partner. In such games, a Nash equilibrium which does
not correspond to random mating is defined by one switching time. The conditions
```
required for this switching time to define a neighbourhood invader strategy, NIS, (a
```
```
stronger condition introduced by Apaloo [4]) were also considered. In terms of a
```
single strategy, a strategy π∗ is an NIS if and only if when the relevant population
use a strategy π sufficiently close to π∗, then selection favours individuals using π∗
rather than π.
The selection pressure on a component strategy of a strategy profile depends on
the other strategies in the profile. From another point of view, the selection pressure
on a particular switching time depends on the other switching times being used.
156 D. M. Ramsey
For this reason, we will only look at the stability properties of switching times in
```
isolation from each other (a weaker condition). The equilibrium switching time t∗1,2
```
is only associated with the strategy of type 1 players. The switching times t∗2,3 and
t s,∗2,3 are only associated with the strategy of type 2 players. The switching time t∗1,3 is
associated with the strategy of players of both type 1 and type 2. Consider the Nash
```
equilibrium given by the set of switching times (t∗2,3, t s,∗2,3 , t∗1,2, t∗1,3). The switching
```
```
time t∗1,3 is said to be a neigbourhood invader (NI) when the following condition is
```
```
satisfied: when the other switching times are unchanged and the switching time t1,3
```
```
is sufficiently close to t∗1,3 , then selection favours searchers of types 1 and 2 (those
```
```
whose strategy is at least partially defined by t1,3 ) who use the switching time t∗1,3
```
rather than t1,3 . This property can be defined analogously for the remaining switching
times.
```
Considering Example 1, when γ ∈ (γ1,1, γ3,1) ≈ (0.4575, 0.4755) there are two
```
```
positive solutions of the equation r1(t1,3; π) = 1. Let t∗,i1,3 denote the i-th smallest
```
```
positive solution of r1(t1,3; π) = 1. Numerical calculations indicate that r1(t1,3; π)
```
‘upcrosses’ the value 1 at t∗,11,3 and ‘downcrosses’ at t∗,21,3 . It follows that when t1,3 is
```
slightly larger than t∗,11,3 , then selection will favour searchers of type 1 (or type 2) who
```
use a slightly larger switching time than t1,3 rather than a slightly smaller one. Hence,
the switching time t∗,11,3 is not an NI. On the other hand, when t1,3 is very similar to
t∗,21,3 , then selection favours individuals of type 1 and 2 who use t∗,21,3 as a switching
```
time. It follows that the switching time t∗,21,3 is an NI. Finally, since r1(0; π) < 1 for
```
random mating if γ > γ1,1 , when t1,3 is sufficiently close to zero, then in this case an
optimally individual of type 1 or 2 should accept any prospective partner. Hence, in
this case t1,3 = 0 is an NI.
```
When γ ∈ (γ2,1,γ4,1) ≈ (0.0245,0.0255), arguing as above, when t1,2 is close to
```
0 and t∗1,3 is the equilibrium switching time corresponding to t∗1,2 = 0, then selection
favours type 1 individuals who always accept prospective partners of type 2. Hence,
```
t∗1,2 = 0 is an NI. Setting t∗1,3 = t∗,11,3 , the function r1(t1,2; π) upcrosses the value v2 at
```
```
t∗,11,2 . However, when t∗1,3 = t∗,21,3 the function r1(t1,2; π) downcrosses v2 at t∗,21,2 . Hence,
```
t∗,21,2 is an NI switching time, but t∗,11,2 is not.
If all the switching times satisfy this NI property, then one could say that the
corresponding strategy is NIS. However, this is a weaker concept than presented by
Apaloo [4], as simultaneous changes of switching times are not considered.
6 Conclusion
This article has considered a partnership formation game with scramble competition
in which there is a continuum of players and the attractiveness of a prospective partner
takes one of n possible values. The sex ratio is equal to one and the distribution of the
values of partners is independent of sex. Some general results regarding Nash equi-
libria were given for the mixing population model, according to which it is assumed
that the rate at which prospective partners are found is proportional to the fraction
A Partnership Formation Game with Common Preferences … 157
of individuals who are still searching for a partner. A full characterization of the
possible equilibria in the case where the attractiveness of prospective partners takes
one of three possible values was presented. Such an equilibrium can be described by
a set of between zero and four switching times, where the case ‘zero switching times’
corresponds to random mating. Two examples were presented to illustrate each type
of equilibria. It was shown that multiple Nash equilibria are possible and the stability
properties of these equilibria were considered from the point of view of the concept
```
of neighbourhood invader strategy (see Apaloo [4]).
```
Except in the case of random mating, equilibria were estimated using search
procedures based on a grid over the space of switching times. When an equilibrium
is described by four switching times, the initial estimate assumes that the switching
```
times are integers (there are 100C4 such strategy profiles) and then uses a finer grid
```
for local search. The running time of a program written in R was about 20 min using
a 1.4 GHz Intel Core i5 processor with 4 GB of memory. When attractiveness takes
a larger number of possible values, it is expected that the number of switching times
possible at equilibrium grows exponentially. To solve more complex games of this
form, other methods of solution, such as policy iteration or value iteration, should
be considered. However, such approaches make it more difficult to examine the
phenomenon of multiple equilibria.
Searchers of intermediate attractiveness do not always become less choosy as time
```
progresses. Equilibria exist where such searchers initially accept (or start accepting)
```
prospective partners of low attractiveness, but then stop accepting them if players of
high attractiveness will start accepting those of intermediate attractiveness in the near
future. For such an equilibrium to exist, the value of players of low attractiveness
should be similar to the value of prospective partners of intermediate attractiveness.
In such cases, either the period of time over which searchers of intermediate attrac-
tiveness become more choosy is very short or the discount rate is very low, which
means that the expected reward from future search of an individual of intermediate
attractiveness is always close to the value of a prospective partner of low attractive-
ness and so the selective pressure on whether to accept or reject a partner of low
attractiveness is relatively small.
One avenue for future research would be to restrict the set of strategy profiles
to those where players become less choosy over time. This would greatly simplify
the form of ‘equilibria’ and from a practical point of view might be more realistic.
Considering such a game as a stopping game, it is unclear what conditions should
be satisfied by the future reward functions. However, such an approach is definitely
appropriate in games where rewards are not discounted over time. For example,
suppose an individual of type i is not initially acceptable to a searcher of type 1.
By accepting only individuals of type i when t < t1,i and behaving in the same way
as an individual of type 1 when t ≥ t1,i , where t1,i is the time at which the most
attractive searchers start to accept those of type i, it is clear from the equilibrium
conditions that such an individual has an expected reward of vi and becomes less
choosy as time progresses. Extending this argument, each searcher should become
```
less choosy as time progresses (individuals who are always acceptable to those of
```
type 1 should always behave in the same way as individuals of type 1 and hence
158 D. M. Ramsey
```
become less choosy over time). Hence, such an equilibrium can be described by at
```
most n − 1 parameters.
The phenomenon of multiple equilibria should also be investigated. If multiple
equilibria exist, then when searchers are not choosy, it pays an individual also not
```
to be choosy and when searchers are relatively choosy, it pays (at least attractive
```
```
searchers) to be choosy. It is possible that a policy iteration algorithm could be
```
used to find ‘a least choosy equilibrium’ and a ‘most choosy equilibrium’. The first
equilibrium would be found by starting a policy iteration algorithm from a strategy
profile where each searcher accepts any prospective partner. The second equilibrium
could be found, for example, by starting a policy iteration algorithm from a strategy
profile where searchers use the equilibrium searching rules in the game where the
rates at which prospective partners of a given type are fixed. In such a game, type 1
searchers face a classical one-sided search problem for which the optimal rule can
be found by recursion. The optimal rule of each successive type of searcher given
the strategies of more attractive individuals could then be found in a similar way.
Acknowledgments This research is supported by the Polish National Centre for Science on the
basis of Grant No. DEC-2015/17/B/ST6/01868: ‘Stopping methods for the analysis of chosen
algorithms’.
References
1. Alpern, S., Katrantzi I. Equilibria of two-sided matching games with common preferences.
```
European Journal of Operational Research, 196 (3), 1214-1222 (2009).
```
2. Alpern, S., Reyniers, D.: Strategic mating with homotypic preferences. Journal of Theoretical
```
Biology, 198 (1), 71-88 (1999).
```
3. Alpern, S., Reyniers, D.: Strategic mating with common preferences. Journal of Theoretical
```
Biology, 237, 337-354 (2005).
```
4. Apaloo, J.: Revisiting strategic models of evolution: the Concept of neighborhood invader
```
strategies. Theoretical Population Biology, 52, 71-77 (1997).
```
5. Burdett, K., Coles, M. G.: Long-term partnership formation: Marriage and employment. The
```
Economic Journal, 109, 307-334 (1999).
```
6. Chow, Y. S. Great expectations. The theory of optimal stopping. Houghton Mifflin, Boston,
```
MA (1971).
```
7. Collins, E. J., McNamara, J. M.: The job-search problem with competition: an evolutionarily
```
stable strategy. Advances in Applied Probability, 25, 314-333 (1993).
```
8. Courtiol, A., Etienne, L., Feron, R., Godelle, B., Rousset, F.: The evolution of mutual mate
```
choice under direct benefits. The American Naturalist, 188(5), 521-538 (2016).
```
9. Dechaume-Moncharmont, F. X., Brom, T., Cézilly, F.: Opportunity costs resulting from scram-
ble competition within the choosy sex severely impair mate choosiness. Animal Behavior, 114,
```
249-260 (2016).
```
10. Etienne, L., Rousset, F., Godelle, B., Courtiol, A.: How choosy should I be? The relative
searching time predicts evolution of choosiness under direct sexual selection. Proceedings of
```
the Royal Society B, 281, 20140190 (2014). https://doi.org/10.1098/rspb.2014.0190.
```
11. Janetos, A. C.: Strategies of female mate choice: a theoretical analysis. Behavioral and Eco-
```
logical Sociobiology, 7, 107-112 (1980).
```
12. Johnstone, R. A.: The tactics of mutual mate choice and competitive search. Behavioral and
```
Ecological Sociobiology, 40, 51-59 (1997).
```
A Partnership Formation Game with Common Preferences … 159
13. Mazalov, V., Falko, A. Nash equilibrium in two-sided mate choice problem. International Game
```
Theory Review, 10(4), 421-435 (2008).
```
14. McNamara, J. M., Collins, E. J.: The job search problem as an employer-candidate game.
```
Journal of Applied Probability, 28, 815-827 (1990).
```
15. McNamara, J. M., Szekely, T., Webb, J. N., Houston, A. I.: A dynamic game-theoretic model
```
of parental care. Journal of Theoretical Biology, 205(4), 605-623 (2000).
```
16. Parker, G. A.: Mate quality and mating decisions. In: Bateson P. (ed.) Mate Choice, pp. 227-256.
```
Cambridge University Press, Cambridge, UK (1983).
```
17. Piessens, R., de Doncker-Kapenga, E., Uberhuber, C., Kahaner, D.: Quadpack: a Subroutine
```
Package for Automatic Integration, Vol. 1. Springer Science & Business Media, Berlin (2012).
```
18. Priklopil, T., Kisdi, E., Gyllenberg, M.: Evolutionarily stable mating decisions for sequentially
searching females and the stability of reproductive isolation by assortative mating. Evolution,
```
69(4), 1015-1026 (2015).
```
19. Ramsey, D. M.: A large population job search game with discrete time. European Journal of
```
Operational Research, 188, 586-602 (2008).
```
20. Ramsey, D. M.: Partnership formation based on multiple traits. European Journal of Operational
```
Research, 216 (3), 624-637 (2012)..
```
21. Ramsey, D. M.: On a large population partnership formation game with continuous time.
```
Contributions to Game Theory and Management, 8, 268-277 (2015).
```
22. Ramsey, D. M.: A Large Population Partnership Formation Game with Associative Preferences
```
and Continuous Time. Mathematica Applicanda, 46(2), 173-196, (2018).
```
23. Real, L. A.: Search theory and mate choice. I. Models of single-sex discriminination. American
```
Naturalist, 136, 376-404 (1990)
```
24. Real, L. A.: Search theory and mate choice. II. Mutual interaction, assortative mating, and
```
equilibrium variation in male and female fitness. American Naturalist, 138, 901-917 (1991).
```
25. Smith, L.: The marriage model with search frictions. Journal of Political Economy, 114, 1124-
```
1144 (2006).
```
26. Stigler, G. J.: The economics of information. Journal of Political Economy, 69, 213-225 (1961).
The Replicator Dynamics for Games
in Metric Spaces: Finite Approximations
Saul Mendoza-Palacios and Onésimo Hernández-Lerma
1 Introduction
In this paper, we are interested in evolutionary games, in which the interaction of
strategies is studied as a dynamical system. We are interested in the special case in
which the strategies’ interactions follow a specific dynamical system known as the
replicator dynamics.
An evolutionary game is said to be symmetric if there are two players only and,
furthermore, they have the same strategy sets and the same payoff functions. This
type of game models interactions of the strategies of a single population. In contrast,
an asymmetric evolutionary game, also known as multipopulation games, is a game
```
with a finite set of players (or populations) each of which has a different set of
```
strategies and different payoff functions.
```
In our model, the pure strategies set of each player (or population) is a metric space
```
```
and consequently the replicator dynamics lives in a Banach space (a space of finite
```
```
signed measures). In particular, if we have n players each of which has m i strategies,
```
for i = 1, . . . , n, then the replicator dynamics is in Rm , where m = ∑ni=1 m i .
The main goal of this paper is to establish conditions under which a finite-
dimensional dynamical system approximates the replicator dynamics for games with
strategies in metric spaces. In this manner, we can use numerical analysis techniques
for finite-dimensional differential equations to approximate a solution to the replica-
tor dynamics, which lives in an infinite-dimensional Banach space. This is important
because it will allow us to study games with pure strategies in metric spaces such
as models in oligopoly theory, international trade theory, war of attrition, and pub-
lic goods, among others. To achieve this goal, we first present a finite-dimensional
S. Mendoza-Palacios (B)
Economic Studies Center of El Colegio de México, Carretera Picacho Ajusco 20, Ampliación
Fuentes del Pedregal, 14110 Tlapan, México city, Mexico
e-mail: smendoza@colmex.mx
O. Hernández-Lerma
Mathematics Department, CINVESTAV-IPN, A. Postal 14-740, 07000 México City, Mexico
e-mail: ohernand@math.cinvestav.mx
```
© The Editor(s) (if applicable) and The Author(s), under exclusive license
```
to Springer Nature Switzerland AG 2020
D. M. Ramsey and J. Renault (eds.), Advances in Dynamic Games,
Annals of the International Society of Dynamic Games 17,
```
https://doi.org/10.1007/978-3-030-56534-3_7
```
161
162 S. Mendoza-Palacios and O. Hernández-Lerma
approximation technique for games in metric spaces and we give a proposal of a
finite-dimensional dynamical system to approximate evolutionary dynamics in a
Banach space, see Sect. 4. After, in Sects. 5 and 6, we establish general approxima-
tion theorems for the replicator dynamics in metric spaces and use these results for
a finite-dimensional approximation given in Sect. 4, see Notes 1 and 3.
Oechssler and Riedel [24] propose two approximation theorems for symmetric
games. The first theorem establishes the proximity in the strong topology of two paths
```
generated by two dynamical systems (the original model and a discrete approximation
```
```
of the model) with the same initial conditions. The second theorem establishes the
```
proximity in the weak topology of two paths with different initial conditions, and
these paths satisfy the same differential equation.
We propose here two approximation results with hypotheses less restrictive than
those by Oechssler and Riedel [24]. Our approximation theorems extend the results
in [24]. In our case, the approximation theorems are for symmetric and asymmetric
games. Also, we establish the proximity of two paths generated by two different
```
dynamical systems (the original model and a discrete approximation model) with
```
different initial conditions. In addition, our approximation results are studied in the
strong topology using the norm of total variation, and also in the weak topology
using the Kantorovich–Rubinstein metric. This last point is important because the
```
initial conditions and the paths (by consequence) of the original dynamics model and
```
```
the finite-dimensional dynamic approximation may be very far between them (both
```
```
initial conditions and paths) in terms of the strong topology, but very close between
```
them in terms of the weak topology.
These approximations require different hypotheses. The first approximation the-
orem, Theorem 1, requires a proximity in the strong topology of the two initial
conditions, and it only requires that the payoff functions for the original model be
bounded. The second approximation result, Theorem 2, weakens the hypothesis of
```
proximity of the two initial conditions (it only imposes a condition of proximity in
```
```
the weak topology), but it requires that the payoff functions for the original model
```
be Lipschitz continuous.
There are several publications on the replicator dynamics in games with strategies
in metric spaces. For instance, conditions for the existence of solutions, as in Bomze
[4], Oechssler and Riedel [23], Cleveland and Ackleh [7], Mendoza-Palacios and
```
Hernández-Lerma [21] (for asymmetric games). Similarly, conditions for dynamic
```
stability, as in Bomze [3], Oechssler and Riedel [23, 24], Eshel and Sansone [9], Vee-
len and Spreij [30], Cressman and Hofbauer [8], Mendoza-Palacios and Hernández-
Lerma [21, 22].
The paper is organized as follows. Section 2 presents notation and technical
requirements. Section 3 describes the replicator dynamics and its relation to evo-
lutionary games. Some important technical issues are also summarized. Section 4
introduces a finite-dimensional game to approximate evolutionary games in a Banach
space. Section 5 establishes an approximation theorem for the replicator dynamics
on measure spaces by means of dynamical systems in finite-dimensional spaces. The
distance for this first approximation is the total variation norm. Section 6 establishes
an approximation theorem using the Kantorovich–Rubinstein metric. Section 7 pro-
The Replicator Dynamics for Games in Metric Spaces: Finite Approximations 163
poses an example to illustrate our results. We conclude in Sect. 8 with some general
comments on possible extensions. An appendix contains results of some technical
facts.
2 Technical Preliminaries
2.1 Spaces of Signed Measures
```
Consider a separable metric space (A, ϑ) and its Borel σ -algebra B(A). Let M(A)
```
```
be the Banach space of finite signed measures μ on B(A) endowed with the total
```
variation norm
‖μ‖ := sup
‖ f ‖≤1
∣∣
∣∣
∫
A
```
f (a)μ(da)
```
∣∣
```
∣∣ = |μ|(A). (1)
```
```
The supremum in (1) is taken over functions in the Banach space B(A) of real-valued
```
bounded measurable functions on A, endowed with the supremum norm
‖ f ‖ := sup
a∈A
```
| f (a)|. (2)
```
```
Consider the subset C(A) ⊂ B(A) of all real-valued continuous and bounded func-
```
```
tions on A. Consider the dual pair (C(A), M(A)) given by the bilinear form
```
```
〈·, ·〉 : C(A) × M(A) → R
```
〈g, μ〉 =
∫
A
```
g(a)μ(da). (3)
```
```
We consider the weak topology on M(A) (induced by C(A)), i.e., the topology under
```
```
which all elements of C(A) when regarded as linear functionals 〈g, ·〉 on M(A) are
```
continuous.
2.2 The Kantorovich–Rubinstein Metric
```
There are many metrics that metrize the weak topology on P(A). Here we use
```
```
the Kantorovich–Rubinstein metric. Let (A, ϑ) be a separable metric space, and
```
```
P(A) the set of probability measure on A. For any μ, ν ∈ P(A) we define the the
```
Kantorovich–Rubinstein metric r kr as
```
r kr (μ, ν) := sup
```
```
f ∈L(A)
```
```
{∫
```
A
```
f (a)μ(da) −
```
∫
A
```
f (a)ν(da) : ‖ f ‖L ≤ 1
```
```
}
```
```
, (4)
```
164 S. Mendoza-Palacios and O. Hernández-Lerma
```
where (L(A), ‖ · ‖L ) is the space of continuous real-valued functions on A that satisfy
```
the Lipschitz condition
‖ f ‖L := sup
```
{
```
```
| f (a) − f (b)|/ϑ(a, b), a, b ∈ A, a = b
```
```
}
```
```
< ∞. (5)
```
Let a0 be a fixed point in A, and
```
MK (A) :=
```
```
{
```
```
μ ∈ M(A) : sup
```
```
f ∈L(A)
```
∫
A
```
| f (a)|μ(da) < ∞
```
```
}
```
.
```
The Kantorovich–Rubinstein metric r kr can be extended as a norm on MK (A) defined
```
as
```
‖μ‖kr := |μ(A)| + sup
```
```
f ∈L(A)
```
```
{∫
```
A
```
f (a)μ(da) : ‖ f ‖L ≤ 1, f (a0) = 0
```
```
}
```
```
(6)
```
```
for any μ in MK (A) (see Bogachev [2], Chap. 8).
```
```
Remark 1 Note that for any μ, ν ∈ P(A), r kr (μ, ν) = ‖μ − ν‖kr . Indeed if μ, ν ∈
```
```
P(A), then
```
sup
```
f ∈L(A)
```
```
{∫
```
A
```
f (a)μ(da) −
```
∫
A
```
f (a)ν(da) : ‖ f ‖L ≤ 1
```
```
}
```
= sup
```
f ∈L(A)
```
```
{∫
```
A
```
[ f (a) − f (a0)]μ(da) −
```
∫
A
```
[ f (a) − f (a0)]ν(da) : ‖ f ‖L ≤ 1
```
```
}
```
= sup
```
g∈L(A)
```
```
{∫
```
A
```
g(a)μ(da) −
```
∫
A
```
g(a)ν(da) : ‖g‖L ≤ 1, g(a0) = 0
```
```
}
```
.
2.3 Product Spaces
```
Consider two separable metric spaces X and Y with their Borel σ -algebras B(X) and
```
```
B(Y ). We denote by B(X) × B(Y ) the product σ -algebra on X × Y . For μ ∈ M(X)
```
```
and ν ∈ M(Y ), we denote their product by μ × ν and it holds that
```
```
‖μ × ν‖ ≤ ‖μ‖‖ν‖. (7)
```
```
As a consequence, μ × ν is in M(X × Y ) (see by example Heidergott and Leahu
```
```
[11], Lemma 4.2.).
```
```
Now consider a finite family of metric spaces {X i }ni=1 and their σ -algebras B(X i ),
```
```
as well as the Banach spaces (M(X i ), ‖ · ‖) and (MK (X i ), ‖ · ‖kr ). For i = 1, . . . , n,
```
```
let μi ∈ M(X i ) and consider the elements μ = (μ1, ..., μn ) in the product space
```
```
M(X1) × ... × M(X n ) with the norm
```
The Replicator Dynamics for Games in Metric Spaces: Finite Approximations 165
```
‖μ‖∞ := max1≤i≤n ‖μi ‖ < ∞. (8)
```
```
These elements form the Banach space (M(X1) × ... × M(X n ), ‖ · ‖∞). We can
```
```
similarly define the Banach space (MK (X1) × ... × MK (X n ), ‖ · ‖kr∞), where
```
```
‖μ‖kr∞ := max1≤i≤n ‖μi ‖kr < ∞. (9)
```
2.4 Differentiability
```
Definition 1 Let A be a separable metric space. We say that a mapping μ : [0, ∞) →
```
```
M(A) is strongly differentiable if there exists μ′(t) ∈ M(A) such that, for every
```
t > 0,
lim→0
∥∥
```
∥∥μ(t + ) − μ(t)
```
 − μ
```
′(t)
```
∥∥
```
∥∥ = 0. (10)
```
```
Note that, by (1), the left-hand side in (10) can be expressed more explicitly as
```
lim→0 sup
‖g‖≤1
∣∣
∣∣1

[∫
A
```
g(a)μ(t + , da) −
```
∫
A
```
g(a)μ(t, da)
```
]
−
∫
A
```
g(a)μ′(t, da)
```
∣∣
∣∣ .
```
The signed measure μ′ in (10) is called the strong derivative of μ.
```
For weak differentiability, see Remark 3.
3 The Replicator Dynamics and Evolutionary Games
3.1 Asymmetric Evolutionary Games
```
Let I := {1, 2, . . . , n} be the set of different species (or players). Each individual of
```
```
the species i ∈ I can choose a single element ai in a set of characteristics (strategies
```
```
or actions) A i , which is a separable metric space. For every i ∈ I and every vector
```
```
a := (a1, ..., a n ) in the Cartesian product A := A1 × ... × A n , we write a as (ai , a−i )
```
```
where a−i := (a1, ..., ai−1, ai+1, ..., a n ) is in
```
A−i := A1 × ... × A i−1 × A i+1 × ... × A n .
166 S. Mendoza-Palacios and O. Hernández-Lerma
```
For each i ∈ I , let B(A i ) be the Borel σ -algebra of A i and P(A i ) the set of
```
probability measures on A i , also known as the set of mixed strategies. A probability
```
measure μi ∈ P(A i ) assigns a population distribution over the action set A i of the
```
species i.
```
Finally, for each species i we assign a payoff function Ji : P(A1) × ... × P(A n ) →
```
R that explains the interrelation with the population of other species, and which is
defined as
```
Ji (μ1, ..., μn ) :=
```
∫
A1
...
∫
A n
```
Ui (a1, ..., a n )μn (da n )...μ1(da1), (11)
```
where Ui : A1 × ... × A n → R is a given measurable function.
```
For every i ∈ I and every vector μ := (μ1, ..., μn ) in P(A1) × ... × P(A n ), we
```
```
sometimes write μ as (μi , μ−i ), where μ−i := (μ1, ..., μi−1, μi+1, ..., μn ) is in
```
```
P(A1) × ... × P(A i−1) × P(A i+1) × ... × P(A n ). If δ{ai } is a probability measure
```
```
concentrated at ai ∈ A i , the vector (δ{ai }, μ−i ) is written as (ai , μ−i ), and so
```
```
Ji (δ{ai }, μ−i ) = Ji (ai , μ−i ). (12)
```
```
In particular, (11) yields
```
```
Ji (μi , μ−i ) :=
```
∫
A i
```
Ji (ai , μ−i )μi (dai ). (13)
```
In an evolutionary game, the dynamics of the strategies is determined by a system
of differential equations of the form
```
μ′i (t) = Fi (μ1(t), ..., μn (t)) ∀ i ∈ I, t ≥ 0, (14)
```
```
with some initial condition μi (0) = μi,0 for each i ∈ I . The notation μ′i (t) represents
```
```
the strong derivative of μi (t) in the Banach space M(A i ) (see Definition 1). For each
```
```
i ∈ I , Fi (·) is a mapping
```
```
Fi : P(A1) × ... × P(A n ) → M(A i ).
```
Let
```
F : P(A1) × ... × P(A n ) → M(A1) × ... × M(A n )
```
```
be such that F(μ) := (F1(μ), ..., Fn (μ)), and consider the vector
```
```
μ′(t) := (μ′1(t), ..., μ′n (t)).
```
```
Hence, the system (14) can be expressed as
```
```
μ′(t) = F(μ(t)), (15)
```
The Replicator Dynamics for Games in Metric Spaces: Finite Approximations 167
and we can see that the system lives in the Cartesian product of signed measures
```
M(A1) × ... × M(A n ),
```
```
which is a Banach space with norm as in (8).
```
```
More explicitly, we may write (14) as
```
```
μ′i (t, E i ) = Fi (μ(t), E i ) ∀ i ∈ I, E i ∈ B(A i ), t ≥ 0, (16)
```
```
where μ′i (t, E i ) and Fi (μ(t), E i ) denote the signed measures μ′i (t) and Fi (μ(t))
```
```
valued at E i ∈ B(A i ).
```
We shall be working with a special class of asymmetric evolutionary games which
can be described as
[
I,
```
{
```
```
P(A i )
```
```
}
```
i∈I ,
```
{
```
```
Ji (·)
```
```
}
```
i∈I ,
```
{
```
```
μ′i (t) = Fi (μ(t))
```
```
}
```
i∈I
]
```
, (17)
```
where
```
(i) I = {1, ..., n} is the finite set of players;
```
```
(ii) for each player i ∈ I we have a set P(A i ) of mixed actions and a payoff function
```
```
Ji : P(A1) × ... × P(A n ) → R (as in (12)); and
```
```
(iii) the replicator function Fi (μ(t)), where
```
```
Fi (μ(t), E i ) :=
```
∫
E i
[
```
Ji (ai , μ−i (t)) − Ji (μi (t), μ−i (t))
```
]
```
μi (t, dai ). (18)
```
Conditions for the existence of solutions and dynamic stability for asymmetric
games are given, for instance, by Mendoza-Palacios and Hernández-Lerma [21],
Theorems 4.3 and 4.5.
3.2 The Symmetric Case
```
We can obtain from (17) a symmetric evolutionary game when I := {1, 2} and the
```
sets of actions and payoff functions are the same for both players, i.e., A = A1 = A2
```
and U (a, b) = U1(a, b) = U2(b, a), for all a, b ∈ A. As a consequence, the sets of
```
mixed actions and the expected payoff functions are the same for both players, that
```
is, P(A) = P(A1) = P(A2) and J (μ, ν) = J1(μ, ν) = J2(ν, μ) for all μ, ν ∈ P(A).
```
This kind of model determines the dynamic interaction of strategies of a unique
```
species through the replicator dynamics μ′(t) = F(μ(t)), where F : P(A) → M(A)
```
is given by
```
F(μ(t), E) :=
```
∫
E
[
```
J (a, μ(t)) − J (μ(t), μ(t))
```
]
```
μ(t, da) ∀E ∈ B(A). (19)
```
168 S. Mendoza-Palacios and O. Hernández-Lerma
```
As in (17), we can describe a symmetric evolutionary game in a compact form as
```
[
```
I = {1, 2}, P(A), J (·), μ′(t) = F(μ(t))
```
]
```
. (20)
```
There are several papers on the replicator dynamics in symmetric games with
strategies in metric spaces. In particular, for conditions on the existence of solu-
tions, see, for instance, Bomze [4], Oechssler and Riedel [23], Cleveland and Ackleh
[7]. Similarly, conditions for dynamic stability are given by Bomze [3], Oechssler
and Riedel [23, 24], Eshel and Sansone [9], Veelen and Spreij [30], Cressman and
Hofbauer [8], Mendoza-Palacios and Hernández-Lerma [22], among others.
4 Discrete Approximations to the Replicator Dynamics
```
To obtain a finite-dimensional approximation of the replicator dynamics (15) (with
```
```
Fi (·) in (18)), for an asymmetric (17) (or symmetric (20)) model, we can apply the
```
following Theorems 1 and 2 to a discrete approximation of the payoff functions
Ui and the initial probability measures μi,0 , for i in I . For some approximation
techniques for the payoff function in games, see Bishop and Cannings [1], Simon
[29].
4.1 Games with Strategies in an Real Interval
Oechssler and Riedel [24] propose a finite approximation for a symmetric game.
```
Following [24], consider an asymmetric game (17) where, for every i in I , A i =
```
```
[ci,1, ci,2] (for some real numbers with ci,1 < ci,2 ) and Ui is a real-valued bounded
```
```
function. For every i in I , consider the partition Pk i := {ξm i }2ki −1m i =0 over A i , where
```
```
ξm i := [a m i , a m i +1), a m i = ci,1 + m i [ci,2 − ci,1]2k i,
```
for m i = 0, 1, ..., 2k i − 1 and ξ2ki −1 := [a2ki −1, ci,2]. For every i in I , the discrete
approximation to Ui is given by the function
```
U k i (x1, ..., x i , ..., x n ) := Ui (a m1 , ..a m i , ..., a m n ),
```
```
if (x1, ..., x i , ..., x n ) is in ξm1 × · · · × ξm i × · · · × ξm n . Also, for each i in I we approx-
```
```
imate a probability measure μi ∈ P(A i ) by a discrete probability distribution μk i on
```
```
the partition set Pk i . Then we can write the approximation to the payoff function (11)
```
as
The Replicator Dynamics for Games in Metric Spaces: Finite Approximations 169
```
Jk i (μk1 , ..., μk n ) :=
```
∑
ξm1 ∈Pk1
...
∑
ξmn ∈Pkn
```
Ui (a m1 , ..., a m n )μk n (ξm n ) · · · μk1 (ξm1 ). (21)
```
```
For every i ∈ I and every vector μk := (μk1 , ..., μk n ) in P(Pk1 ) × ... × P(Pk n ), we
```
```
write μk as (μk i , μ−k i ), where μk−i := (μk1 , ..., μk i−1 , μk i+1 , ..., μk n ) is in P(Pk1 ) ×
```
```
... × P(Pk i−1 ) × P(Pk i+1 ) × ... × P(Pk n ). If δ{ξmi } is a probability measure concen-
```
```
trated at ξm i ∈ Pk i , the vector (δ{ξmi }, μ−i ) is written as (a m i , μ−i ), and so
```
```
Jk i (δ{ξmi }, μk−i ) = Jk i (a m i , μk−i ). (22)
```
```
In particular, (21) yields
```
```
Jk i (μk i , μk−i ) :=
```
∑
ξmi ∈Pki
```
Jk i (a m i , μk−i )μk i (ξm i ). (23)
```
```
Note that μk := (μk1 , ..., μk n ) in P(Pk1 ) × ... × P(Pk n ) is a vector of measures
```
```
in P(A1) × ... × P(A n ). Then for any i ∈ I and E i ∈ B(A i ) ∩ Pk i , the replicator
```
```
induced by {U k i }i∈I has the form,
```
```
μ′k i (t, E i ) =
```
∑
ξmi ∈E i ∩Pki
[
```
Jk i (a m ki , μk−i (t)) − Jk i (μk i (t), μk−i (t))
```
]
```
μk i (t, ξm i ), (24)
```
which is equivalent to the system of differential equations in R2k1 +...+2knof the form:
```
μ′k i (t, ξm i ) =
```
[
```
Jk i (a m i , μk−i (t)) − Jk i (μk i (t), μk−i (t))
```
]
```
μk i (t, ξm i ), (25)
```
```
for i = 1, 2, . . . , n and m i = 0, 1, . . . , 2ki − 1, with initial condition {μk i ,0(ξm i )}2ki−1m i =0 .
```
```
Hence, using Theorem 1 or Theorem 2, we can approximate (14), (15) (with Fi (·)
```
```
as (18)) by a system of differential equations in R2k1 +...+2knof the form (25).
```
4.2 Games with Strategies in Compact Metric Spaces
```
Similarly as in Sect. 4.1, consider an asymmetric game (17) where, for every i in I ,
```
A i is a compact metric space and Ui is a real-valued bounded function. For every i in
```
I , consider the partition Pk i := {A m i }2ki −1m i =0 over A i . For every i in I and a fixed profile
```
```
(a m1 , ..a m i , ..., a m n ) ∈ A m1 × · · · × A m i × · · · × A m n , the discrete approximation to
```
Ui is given by the function
```
U k i (x1, ..., x i , ..., x n ) := Ui (a m1 , ..a m i , ..., a m n ),
```
170 S. Mendoza-Palacios and O. Hernández-Lerma
```
if (x1, ..., x i , ..., x n ) is in A m1 × · · · × A m i × · · · × A m n . If for each i in I we can
```
```
approximate any probability measure μi ∈ P(A i ) by a discrete probability distribu-
```
tion μk i on the partition set Pk i , then we can write the approximation to the payoff
```
function (11) as
```
```
Jk i (μk1 , ..., μk n ) :=
```
∑
A m1 ∈Pk1
...
∑
A mn ∈Pkn
```
Ui (a m1 , ..., a m n )μk n (A m n ) · · · μk1 (A m1 ). (26)
```
```
For every i ∈ I and every vector μk := (μk1 , ..., μk n ) in P(Pk1 ) × ... × P(Pk n ), we
```
```
write μk as (μk i , μ−k i ), where μk−i := (μk1 , ..., μk i−1 , μk i+1 , ..., μk n ) is in P(Pk1 ) ×
```
```
... × P(Pk i−1 ) × P(Pk i+1 ) × ... × P(Pk n ). Note that μk := (μk1 , ..., μk n ) in P(Pk1 ) ×
```
```
... × P(Pk n ) is a vector of measures in P(A1) × ... × P(A n ). Then for any i ∈ I and
```
```
E i ∈ B(A i ) ∩ Pk i , the replicator induced by {U k i }i∈I has the following form:
```
```
μ′k i (t, E i ) =
```
∑
A mi ∈E i ∩Pki
[
```
Jk i (a m ki , μk−i (t)) − Jk i (μk i (t), μk−i (t))
```
]
```
μk i (t, A m i ), (27)
```
which is equivalent to the system of differential equations in R2k1 +...+2knof the form:
```
μ′k i (t, A m i ) =
```
[
```
Jk i (a m i , μk−i (t)) − Jk i (μk i (t), μk−i (t))
```
]
```
μk i (t, A m i ), (28)
```
```
for i = 1, 2, . . . , n and m i = 0, 1, . . . , 2k i − 1, with initial condition {μk i ,0(A m i )}2ki −1m i =0 .
```
```
As in Sect. 4.1, using Theorem 1 or Theorem 2, we can approximate (14), (15)
```
```
(with Fi (·) as (18)) by a system of differential equations in R2k1 +...+2kn.
```
5 An Approximation Theorem in the Strong Form
In this section, we provide an approximation theorem that gives conditions under
```
which we can approximate (14), (15) (with Fi (·) as in (18)) by a finite-dimensional
```
```
dynamical system of the form (25) under the total variation norm (1).
```
The proof of this theorem uses the following two lemmas, which are proved in
the appendix.
Lemma 1 For each i in I , let A i be a separable metric space. If each map μi :
```
[0, ∞) → M(A i ) is strongly differentiable, then
```
```
d‖μ(t)‖∞
```
dt ≤ ‖μ
```
′(t)‖∞.
```
Proof See Appendix.
```
Lemma 2 For each i in I , let A i be a separable metric space and let F(·) be as in
```
```
(14), (15) (with Fi as in (18)). Suppose that for each i in I the payoff function Ui (·)
```
The Replicator Dynamics for Games in Metric Spaces: Finite Approximations 171
```
in (18) is bounded. Then
```
```
‖F(ν) − F(μ)‖∞ ≤ Q‖ν − μ‖∞ ∀μ, ν ∈ P(A1) × ... × P(A n ), (29)
```
```
where Q := (2n + 1)H and H := maxi∈I ‖Ui ‖.
```
Proof See Appendix.
Theorem 1 For each i in I , let A i be a separable metric space and let U i , U i :
A1 × ... × A n → R be bounded functions such that maxi∈I ‖Ui − U i ‖ < , where ‖ · ‖
```
is the sup norm in (2). Consider the replicator dynamics induced by {Ui }ni=1 and
```
```
{U i }ni=1, i.e.,
```
```
μ′i (t, E i ) =
```
∫
E i
[
```
Ji (ai , μ−i (t)) − Ji (μi (t), μ−i (t))
```
]
```
μi (t, dai ), (30)
```
```
ν′i (t, E i ) =
```
∫
E i
[
```
J i (ai , ν−i (t)) − J i (νi (t), ν−i (t))
```
]
```
νi (t, dai ), (31)
```
```
for each i ∈ I , E ∈ B(A i ), and t ≥ 0. If μ(·) and ν(·) are solutions of (30) and (31),
```
```
respectively, with initial conditions μ(0) = μ0 and ν(0) = ν0, then for T < ∞
```
sup
t∈[0,T ]
```
‖μ(t) − ν(t)‖∞ < ‖μ0 − ν0‖∞e QT + 2
```
```
(
```
e QT − 1Q
```
)
```
```
. (32)
```
```
where Q := (2n + 1)H and H := maxi∈I ‖Ui ‖.
```
Proof For each i in I and t ≥ 0, let
```
βi (ai |μ) := Ji (ai , μ−i ) − Ji (μi , μ−i ), β i (ai |νi ) := J i (ai , ν−i ) − J i (νi , ν−i ),
```
and
```
Fi (μ, E i ) :=
```
∫
E i
```
βi (ai |μ)μi (dai ), Fi (ν, E i ) :=
```
∫
E i
```
β i (ai |ν)νi (dai ).
```
Since Ui is bounded, by Lemma 2 there exists Q > 0 such that
```
‖F(ν) − F(μ)‖∞ ≤ Q‖ν − μ‖∞ ∀μ, ν ∈ P(A1) × ... × P(A n ). (33)
```
```
Actually, Q := (2n + 1)H and H := maxi∈I ‖Ui ‖. We also have that, for all i ∈ I and
```
```
ν ∈ P(A1) × ... × P(A n ),
```
```
‖Fi (ν) − Fi (ν)‖ ≤
```
∫
A i
```
|βi (ai |ν) − β i (ai |ν)|νi (dai ) ≤ 2‖Ui − U i ‖ ≤ 2,
```
172 S. Mendoza-Palacios and O. Hernández-Lerma
so
```
‖F(ν) − F (ν)‖∞ ≤ 2. (34)
```
```
By Lemma 1 and (33), (34), we have
```
```
d‖μ(t) − ν(t)‖∞
```
dt ≤ ‖μ
```
′(t) − ν′(t)‖∞
```
```
= ‖F(μ(t)) − F (ν(t))‖∞
```
```
≤ ‖F(μ(t)) − F(ν(t))‖∞ + ‖F(ν(t)) − F (ν(t))‖∞
```
```
≤ Q‖μ(t) − ν(t)‖∞ + 2.
```
Then
```
d‖μ(t) − ν(t)‖∞
```
```
dt − Q‖μ(t) − ν(t)‖∞ ≤ 2.
```
Multiplying by e−Qt we get
```
d‖μ(t) − ν(t)‖∞e−Qt
```
```
dt − Q‖μ(t) − ν(t)‖∞e
```
−Qt ≤ 2e−Qt ,
and integrating in the interval [0, t], where t ≤ T , we get
```
‖μ(t) − ν(t)‖∞e−Qt − ‖μ0 − ν0‖∞e−Q0 ≤ 2
```
```
( 1 − e−Qt
```
Q
```
)
```
.
Then for all t ∈ [0, T ]
```
‖μ(t) − ν(t)‖∞ = ‖μ0 − ν0‖∞e Qt + 2
```
```
( e Qt − 1
```
Q
```
)
```
≤ ‖μ0 − ν0‖∞e QT + 2
```
( e QT − 1
```
Q
```
)
```
,
```
which yields (32). 
```
Remark 2 The last argument in the proof of Theorem 1 is a particular case of
```
the well-known Gronwall–Bellman inequality: If f (·) is nonnegative and f ′(t) ≤
```
```
Q f (t) + c for all t ≥ 0, where Q and c are nonnegative constants, then
```
```
f (t) ≤ f (0)e Qt + cQ−1(e Qt − 1) for all t ≥ 0.
```
For the reader’s convenience, we included the proof here. 
Note 1 As in Sects. 4.1 and 4.2, consider a game with strategies in compact metric
spaces. For each player i ∈ I consider a partition Pk i of A i and suppose that the initial
The Replicator Dynamics for Games in Metric Spaces: Finite Approximations 173
```
condition μi,0 ∈ P(A i ) of (30) can be approximated in the variation norm by a discrete
```
```
probability distribution μk i ,0 ∈ P(Pk i ). Then for any i ∈ I and E i ∈ B(A i ) ∩ Pk i , (31)
```
```
can be written as (27) (or (24)), with U i as (26) (or (21)). So, in this particular case,
```
```
(30) can be approximated by a system of differential equations in R2k1 +...+2knof the
```
```
form (28).
```
Note 2 For the existence of the replicator dynamic, only the boundedness of the
```
payoff functions is necessary (see Sect. 4 in [21]). So, the hypothesis of compactness
```
on the set of strategies is not necessary in Theorem 1. Hence, the hypothesis of
```
compactness on the set of strategies is also not necessary to approximate (30) by a
```
finite-dimensional dynamical system. For example, it is sufficient that there exists
a discrete probability distribution with finite values for any probability distribution
over the set of strategies. For this last case, it is enough that for each i ∈ I , let A i be
a separable metric space, see Theorem 6.3, p. 44 in [26]. However, the compactness
on the set of strategies ensures the existence of Nash equilibrium.
Corollary 1 Let us assume the hypotheses of Theorem 1. Suppose that for each i
```
in I , there exists a sequence of functions {U ni } ∞n=1 and probability measure vectors
```
```
{νn } ∞n=1 such that maxi∈I ‖Ui − U ni ‖ → 0 and ‖μ0 − νn0 ‖∞ → 0. If μ(·) and νn (·)
```
```
are solutions of (30) and (31), respectively, with initial conditions μ(0) = μ0 and
```
```
νn (0) = νn0 , then for T < ∞,
```
limn→∞ sup
t∈[0,T ]
```
‖μ(t) − νn (t)‖∞ = 0.
```
6 An Approximation Theorem in the Weak Form
The next approximation result, Theorem 2, establishes the proximity of two paths
```
generated by two different dynamical systems (the original model and a discrete
```
```
approximating model) with different initial conditions, under the weak topology. To
```
```
this end we use the Kantorovich–Rubinstein norm ‖ · ‖kr on M(A), which metrizes
```
the weak topology.
```
Remark 3 Let A be a separable metric space. We say that a mapping μ : [0, ∞) →
```
```
M(A) is weakly differentiable if there exists μ′(t) ∈ M(A) such that for every t > 0
```
```
and g ∈ C(A)
```
lim→01
[∫
A
```
g(a)μ(t + , da) −
```
∫
A
```
g(a)μ(t, da)
```
]
=
∫
A
```
g(a)μ′(t, da). (35)
```
```
If ‖ · ‖k,r is the Kantorovich–Rubinstein metric in (4), then (35) is equivalent to
```
lim→0
∥∥
```
∥∥μ(t + ) − μ(t)
```
 − μ
```
′(t)
```
∥∥
∥∥
kr
```
= 0. (36)
```
174 S. Mendoza-Palacios and O. Hernández-Lerma
```
Moreover if μ′(t) is the strong derivative of μ(t), then it is also the weak derivative
```
```
of μ(t). Conversely, if μ′(t) is the weak derivative of μ(t) and μ(t) is continuous in
```
```
t with the norm (1), then it is the strong derivative of μ(t). (See Heidergott, Hordijk,
```
```
and Leahu [11].)
```
Lemma 3 For each i in I , let A i be a separable metric space. If each map μi :
```
[0, ∞) → M(A i ) is strongly differentiable, then
```
```
d‖μ(t)‖kr∞
```
dt ≤ ‖μ
```
′(t)‖kr∞.
```
Proof The proof is similar to that of Lemma 1. 
```
Lemma 4 For each i in I , consider a bounded separable metric space (A i , ϑi )
```
```
(with diameter C i > 0) and the metric space (A1 × ... × A n , ϑ∗), where ϑ∗(a, b) =
```
```
maxi∈I {ϑi (ai , bi )} for any a, b in A1 × ... × A n . Let F(·) be as in (14), (15) (with Fi
```
```
as in (18)). For each i in I , suppose that the payoff function Ui (·) in (11) is bounded
```
and satisfies that ‖Ui ‖L < ∞. Then there exists Q > 0 such that
```
‖F(ν) − F(μ)‖kr∞ ≤ Q‖ν − μ‖kr∞ (37)
```
```
for all μ, ν ∈ P(A1) × ... × P(A n ) ∩ MK (A1) × ... × MK (A n ), where Q := [2H +
```
```
(2n − 1)C H L ], H := maxi∈I ‖Ui ‖, H L := maxi∈I ‖Ui ‖L , and C := maxi∈I C i .
```
Proof See Appendix.
```
Theorem 2 For each i in I , let (A i , ϑi ) be a bounded separable metric space (with
```
```
diameter C i > 0), and Ui , U i : A1 × ... × A n → R be two bounded functions such
```
that maxi∈I ‖Ui − U i ‖ < .. For each i in I , suppose that ‖Ui ‖L < ∞ and consider the
```
replicator dynamics induced by {Ui }ni=1 and {U i }ni=1, as in (30) and (31). If μ(·) and
```
```
ν(·) are solutions of (30) and (31), respectively, with initial conditions μ(0) = μ0
```
```
and ν(0) = ν0, then for T < ∞
```
sup
t∈[0,T ]
```
‖μ(t) − ν(t)‖kr∞ < ‖μ0 − ν0‖kr∞e QT + 2
```
```
(
```
e QT − 1Q
```
)
```
```
. (38)
```
```
where Q := [2H + (2n − 1)C H L ], H := maxi∈I ‖Ui ‖, H L := maxi∈I ‖Ui ‖L , and C :=
```
maxi∈I C i .
Proof For each i in I and t ≥ 0, let
```
βi (ai |μ) := Ji (ai , μi ) − Ji (μi , μ−i ), β i (ai |νi ) := J i (ai , ν−i ) − J i (νi , ν−i ),
```
The Replicator Dynamics for Games in Metric Spaces: Finite Approximations 175
and
```
Fi (μ, E i ) :=
```
∫
E i
```
βi (ai |μ)μi (dai ), Fi (ν, E i ) :=
```
∫
E i
```
β i (ai |ν)νi (dai ).
```
By Lemma 4 there exists Q > 0 such that
```
‖F(ν) − F(μ)‖kr∞ ≤ Q‖ν − μ‖kr∞ (39)
```
```
for all μ, ν ∈ P(A1) × ... × P(A n ) ∩ MK (A1) × ... × MK (A n ). Actually,
```
```
Q := [2H + (2n − 1)C H L ], H := maxi∈I ‖Ui ‖, H L := maxi∈I ‖Ui ‖L , and C := maxi∈I C i .
```
We also have that, for all i, in I and
```
ν ∈ P(A1) × ... × P(A n ) ∩ MK (A1) × ... × MK (A n ),
```
```
‖Fi (ν) − Fi (ν)‖kr ≤ sup‖ f ‖
```
```
L ≤1f (a0
```
```
i )=0
```
∫
A i
```
f (ai )|βi (ai |ν) − β i (ai |ν)|νi (dai )
```
≤ 2‖Ui − U i ‖ sup‖ f ‖
```
L ≤1f (a0
```
```
i )=0
```
∫
A i
```
f (ai )νi (dai )
```
≤ 2C.
Then1
```
‖F(ν) − F (ν)‖kr∞ ≤ 2C. (40)
```
```
By Lemma 3 and (39), (40) we have
```
```
d‖μ(t) − ν(t)‖kr∞
```
dt ≤ ‖μ
```
′(t) − ν′(t)‖kr∞
```
```
= ‖F(μ(t)) − F (ν(t))‖kr∞
```
```
≤ ‖F(μ(t)) − F(ν(t))‖kr∞ + ‖F(ν(t)) − F (ν(t))‖kr∞
```
```
≤ Q‖μ(t) − ν(t)‖kr∞ + 2C.
```
```
(See Remark 2 after Theorem 1.) The rest of the proof is similar to that done in
```
Theorem 1. 
Note 3 As in Sects. 4.1 and 4.2, consider a game with strategies in compact metric
spaces. For each player i ∈ I let ‖Ui ‖L < ∞ and consider a partition Pk i of A i .
```
1 Note that if f satisfies that ‖ f ‖L ≤ 1 and f (a0i ) = 0, then f (ai ) ≤ ϑi (ai , a0i ) ≤ C i for all ai ∈ A i .
```
Therefore sup‖ f ‖
```
L ≤1f (a0
```
```
i )=0
```
∫
```
A if (ai )νi (dai ) ≤ C.
```
176 S. Mendoza-Palacios and O. Hernández-Lerma
```
Suppose that the initial condition μi,0 ∈ P(A i ) of (30) can be approximated in the
```
```
weak form by a discrete probability distribution μk i ,0 ∈ P(Pk i ), then for any i ∈ I
```
```
and E i ∈ B(A i ) ∩ Pk i , (31) can be written as (27) (or (24)), with U i as (26) (or
```
```
(21)). So, in this particular case, (30) can be approximated by a system of differential
```
```
equations in R2k1 +...+2knof the form (28).
```
Corollary 2 Let us assume the hypotheses of Theorem 2. Suppose that for each i in I ,
```
there exist a sequences of functions {U ni } ∞n=1 and of vectors of probability measures
```
```
{νn } ∞n=1 such that maxi∈I ‖Ui − U ni ‖ → 0 and ‖μ0 − νn0 ‖kr∞ → 0. If μ(·) and νn (·)
```
```
are solutions of (30) and (31), respectively, with initial conditions μ(0) = μ0 and
```
```
νn (0) = νn0 , then, for T < ∞,
```
limn→∞ sup
t∈[0,T ]
```
‖μ(t) − νn (t)‖kr∞ = 0.
```
7 Examples
7.1 A Linear-Quadratic Model: Symmetric Case
In this subsection, we consider a symmetric game in which we have two players with
the following payoff function:
```
U (x, y) = −ax2 − bx y + cx + dy, (41)
```
with a, b, c > 0 and d any real number.
```
Let A = [0, M], for M > 0, be the strategy set. If 2c(a − b) > 0 and 4a2 − b2 >
```
```
0, then we have an interior Nash equilibrium strategy (NES)
```
```
x∗ = 2c(a − b)4a2 − b2 .
```
```
Let μ(t) be the solution of the symmetric replicator dynamics induced by (41).
```
```
Then if the initial condition is such that μ0(x∗) > 0, we have that μ(t) → δx∗ in
```
```
distribution (see, [21–23]).
```
Consider a game where a = 2, b = 1, c = 5, d = 1, M = 2. For this game, the
```
payoff function (41) is bounded Lipschitz and by Theorem 2 we can approximate the
```
```
replicator dynamics by a finite-dimensional dynamical system of the form (25) under
```
the Kantorovich–Rubinstein norm. Figure 1 shows a numerical approximation for
this game where the Nash equilibrium is x∗ = 1. For this numerical approximation,
we consider a partition with 100 elements with the same size and use the forward
Euler method for solving ordinary differential equations. We consider the uniform
distribution as initial condition. We show the distribution for the times 0, 1000, and
2000.
The Replicator Dynamics for Games in Metric Spaces: Finite Approximations 177
Fig. 1 Linear Quadratic
```
Model: Symmetric Case
```
Note that, under the strong norm, the Nash equilibrium x∗ = 1 cannot be approx-
imated by any probability measure with continuous density function.
7.2 Graduated Risk Game
```
The graduated risk game is a symmetric game (proposed by Maynard Smith and
```
```
Parker [20]), where two players compete for a resource of value v > 0. Each player
```
selects the “level of aggression” for the game. This “level of aggression” is captured
by a probability distribution x ∈ [0, 1], where x is the probability that neither player
```
is injured, and 12 (1 − x) is the probability that player one (or player two) is injured.
```
```
If the player is injured its payoff is v − c (with c > 0), and hence the expected payoff
```
for the player is
```
U (x, y) =
```
```
{
```
```
vy + v−c2 (1 − y) if y > x,
```
```
v−c2 (1 − x) if y ≤ x, (42)
```
where x and y are the “levels of aggression” selected by the player and her
opponent, respectively.
If v < c, this game has a Nash equilibrium strategy with the density function
```
dμ∗(x)
```
```
dx =
```
α − 1
2 x
```
α−32 , (43)
```
```
where α = cv (see Maynard Smith and Parker [20], and Bishop and Cannings [1]).
```
```
Let μ(t) be the solution of the symmetric replicator dynamics induced by (42).
```
```
Then, for any initial condition μ0 with support [0, 1] , we have that μ(t) → δx∗ in
```
```
distribution (see [22]).
```
178 S. Mendoza-Palacios and O. Hernández-Lerma
Fig. 2 Graduate Risk Game:
```
Case c = 10; v = 6 : 5
```
Fig. 3 Graduate Risk Game:
```
Case c = 10; v = 0 : 5
```
```
Consider a game where c = 10, v = 6.5. For this game, the payoff function (42) is
```
bounded, and by Theorem 1 we can approximate the replicator dynamics by a finite-
```
dimensional dynamical system of the form (25) under the strong norm (1). Figure 2
```
shows a numerical approximation for this game. For this numerical approximation,
we consider a partition with 100 elements with the same size, and use the forward
Euler method for solving ordinary differential equations. We consider the uniform
distribution as initial condition. We show the distribution for the times 0, 500, and
1000.
In the same way, Fig. 3 shows a numerical approximation for a game where
```
c = 10, v = 0.5. For this numerical approximation, we consider a partition with 100
```
elements with the same size, and use the forward Euler method for solving ordinary
differential equations. We consider the uniform distribution as initial condition. We
show the distribution for the times 0, 500, and 1000.
The Replicator Dynamics for Games in Metric Spaces: Finite Approximations 179
8 Comments
In this paper, we introduced a model of asymmetric evolutionary games with strate-
gies on measurable spaces. The model can be reduced, of course, to the symmetric
case. We established conditions to approximate the replicator dynamics in a measure
space by a sequence of dynamical systems on finite spaces. Finally, we presented
two examples. The first one may be applicable to oligopoly models, theory of inter-
national trade, and public good models. The second example deals with a graduated
risk game.
There are many questions, however, that remain open. For instance, the replicator
dynamics has been studied in other general spaces without direct applications in game
theory such as Kravvaritis et al. [15–18], and Papanicolaou and Smyrlis [25] studied
conditions for stability and examples for these general cases. These extensions may
```
be applicable in areas such as migration, regional sciences, and spatial economics (see
```
```
Fujita et al. [10] Chaps. 5 and 6). An open question: can we establish conditions to
```
approximate the replicator dynamics for general spaces by a sequence of dynamical
systems on finite spaces?
In the theory of evolutionary games, there are several interesting dynamics,
for instance, the imitation dynamics, the monotone-selection dynamics, the best-
```
response dynamics, the Brown–von Neumann–Nash dynamics, and so forth (see, for
```
```
instance, Hofbauer and Sigmund [13, 14], Sandholm [28]). Some of this evolution-
```
ary dynamics have been extended to games with strategies in a space of probability
measures. For instance, Hofbauer et al. [12] extend the Brown–von Neumann–Nash
```
dynamics; Lahkar and Riedel extend the logit dynamics [19]. These publications
```
establish conditions for the existence of solutions and the stability of the correspond-
ing dynamical systems. Cheung proposes a general theory for pairwise comparison
dynamics [5] and for imitative dynamics [6]. Ruijgrok and Ruijgrok [27] extend
the replicator dynamics with a mutation term. An open question: can we establish
conditions to approximate other evolutionary dynamics for measurable spaces by a
sequence of dynamical systems on finite spaces?
Acknowledgment This research was partially supported by the Fondo SEP-CINVESTAV grant
FIDSC 2018/196.
```
Appendix: Proof of Lemmas
```
```
For the proof of Lemmas 2 and 4, it is convenient to rewrite (11) as
```
```
I(μ1,...,μn )Ui :=
```
∫
A1
...
∫
A n
```
Ui (a1, ..., a n )μn (da n )...μ1(da1). (44)
```
```
Hence (12) becomes
```
180 S. Mendoza-Palacios and O. Hernández-Lerma
```
Ji (ai , μ−i ) =
```
∫
A−i
```
Ui (ai , a−i )μ−i (da−i ) (45)
```
```
= I(μ1,...,μi−1,μi+1,...,μn )Ui (ai ).
```
Proof of Lemma 1
We have the following inequalities:
```
d‖μ(t)‖∞
```
```
dt =
```
d
```
dt maxi∈I [‖μi (t)‖]
```
= lim→01
[
```
maxi∈I [‖μi (t + )‖] − maxi∈I [‖μi (t)‖]
```
]
≤ lim→01
[
```
maxi∈I [‖μi (t + )‖ − ‖μi (t)‖]
```
]
≤ lim→01
[
```
maxi∈I [‖μi (t + ) − μi (t)‖]
```
]
= maxi∈I
[
lim→0
∥∥
```
∥∥μi (t + ) − μi (t)
```

∥∥
∥∥
]
= maxi∈I
[
```
‖μ′i (t)‖
```
]
```
= ‖μ′(t)‖. 
```
Proof of Lemma 2
```
For any i in I and μ, ν in P(A1) × ... × P(A1), using (44) we obtain
```
∣∣
∣∣
∫
A
```
Ui (a)η(da) −
```
∫
A
```
Ui (a)ν(da)
```
∣∣
∣∣
```
≤ |I(η1,η2 ,...,ηn )Ui − I(ν1,η2 ,...,ηn )Ui |
```
- |I(ν1,η2 ,η3,...,ηn )Ui − I(ν1,ν2 ,η3,...,ηn )Ui |
- ...
- |I(ν1,...,νn−2 ,ηn−1,ηn )Ui − I(ν1,...,νn−2 ,νn−1,ηn )Ui |
- |I(ν1,...,νn−1,ηn )Ui − I(ν1,...,νn−1,νn )Ui |
≤ ‖Ui ‖‖η2 × .... × ηn ‖‖η1 − ν1‖
- ‖Ui ‖‖ν1 × η3 × ... × ηn ‖‖η2 − ν2‖
- ...
- ‖Ui ‖‖ν1 × ... × νn−2 × ηn ‖‖ηn−1 − νn−1‖
The Replicator Dynamics for Games in Metric Spaces: Finite Approximations 181
- ‖Ui ‖‖ν1 × .... × νn−1‖‖ηn − νn ‖
```
≤ n‖Ui ‖ maxj∈I ‖η j − ν j ‖. (46)
```
```
Similarly, using (45),
```
```
|Ji (ai , μ−i ) − Ji (ai , ν−i )| ≤ (n − 1)‖Ui ‖‖μ − ν‖∞. (47)
```
```
Using (46) and (47), we have
```
```
‖Fi (μ) − Fi (ν)‖ ∞ = sup‖ f ‖≤1
```
∫
```
A if (ai )[Fi (μ) − Fi (ν)](dai )
```
≤ sup‖ f ‖≤1
∫
```
A if (ai )|Ji (ai , μ−i )|[μi − νi ](da)
```
- sup‖ f ‖≤1
∫
```
A if (ai )|Ji (ai , μ−i ) − Ji (ai , ν−i )|νi (da)
```
- sup‖ f ‖≤1
∫
```
Af (ai )|Ji (μi , μ−i )|[νi − μi ](da)
```
- sup‖ f ‖≤1
∫
```
Af (ai )|Ji (νi , ν−i ) − J (μi , μ−i )|νi (da)
```
```
≤ ‖Ui ‖‖μi − νi ‖ + (n − 1)‖Ui ‖‖μ − ν‖ ∞ ‖νi ‖
```
- ‖Ui ‖‖μi − νi ‖ + n‖Ui ‖‖μ − ν‖ ∞ ‖νi ‖
```
≤ H ‖μ − ν‖ ∞ + (n − 1)H ‖μ − ν‖ ∞ + H ‖μ − ν‖ ∞ + n H ‖μ − ν‖ ∞
```
```
= (2n + 1)H ‖μ − ν‖ ∞,
```
where H := maxi∈I ‖Ui ‖. 
Proof of Lemma 4
For any i and j in I and a− j in A− j let
```
‖Ui (·, a− j )‖L := sup
```
a j ,b j ∈A j
```
|Ui (a j , a− j ) − Ui (b j , a− j )|
```
```
ϑ∗((a j , a− j ), (b j , a− j )) ≤ ‖Ui ‖L , and
```
```
U ji := Ui (a j , a− j )‖U
```
```
i (·, a− j )‖L
```
.
```
Then for any i in I and μ, ν in P(A1) × ... × P(A1), using (44) we see that
```
182 S. Mendoza-Palacios and O. Hernández-Lerma
∣∣
∣∣
∫
A
```
Ui (a)η(da) −
```
∫
A
```
Ui (a)ν(da)
```
∣∣
∣∣
```
≤ ‖Ui (·, a−1)‖L |I(η1,η2 ,...,ηn )U 1i − I(ν1,η2 ,...,ηn )U 1i |
```
- ‖Ui (·, a−2)‖L |I(ν1,η2 ,η3,...,ηn )U 2i − I(ν1,ν2 ,η3,...,ηn )U 2i |
- ...
- ‖Ui (·, a−(n−1) )‖L |I(ν1,...,νn−2 ,ηn−1,ηn )U n−1i − I(ν1,...,νn−2 ,νn−1,ηn )U n−1i |
- ‖Ui (·, a−n )‖L |I(ν1,...,νn−1,ηn )U ni − I(ν1,...,νn−1,νn )U ni |
≤ ‖Ui ‖L ‖η2 × .... × ηn ‖‖η1 − ν1‖kr
- ‖Ui ‖L ‖ν1 × η3 × ... × ηn ‖‖η2 − ν2‖kr
- ...
- ‖Ui ‖L ‖ν1 × ... × νn−2 × ηn ‖‖ηn−1 − νn−1‖kr
- ‖Ui ‖L ‖ν1 × .... × νn−1‖‖ηn − νn ‖kr
```
≤ n‖Ui ‖L ‖η j − ν j ‖kr∞. (48)
```
```
Similarly, using (45),
```
```
|Ji (ai , μ−i ) − Ji (ai , ν−i )| ≤ (n − 1)‖Ui ‖L ‖μ − ν‖kr∞. (49)
```
```
Using (48) and (49) we have
```
```
‖Fi (μ) − Fi (ν)‖kr
```
= sup‖ f ‖
```
L ≤1f (a0 )=0
```
∫
A i
```
f (ai )[Fi (μ) − Fi (ν)](dai )
```
≤ sup‖ f ‖
```
L ≤1f (a0 )=0
```
∫
A i
```
f (ai )|Ji (ai , μ−i )|[μi − νi ](da)
```
- sup‖ f ‖
```
L ≤1f (a0 )=0
```
∫
A i
```
f (ai )|Ji (ai , μ−i ) − Ji (ai , ν−i )|νi (da)
```
- sup‖ f ‖
```
L ≤1f (a0 )=0
```
∫
A
```
f (ai )|Ji (μi , μ−i )|[νi − μi ](da)
```
- sup‖ f ‖
```
L ≤1f (a0 )=0
```
∫
A
```
f (ai )|Ji (νi , ν−i ) − J (μi , μ−i )|νi (da)
```
```
≤ ‖Ui ‖‖μi − νi ‖kr + (n − 1)‖Ui ‖L ‖μ − ν‖kr∞ sup‖ f ‖
```
```
L ≤1f (a0 )=0
```
∫
A i
```
f (ai )νi (dai )
```
The Replicator Dynamics for Games in Metric Spaces: Finite Approximations 183
- ‖Ui ‖‖μi − νi ‖kr + n‖Ui ‖L ‖μ − ν‖kr∞ sup‖ f ‖
```
L ≤1f (a0 )=0
```
∫
A i
```
f (ai )νi (dai )
```
```
≤ 2H ‖μ − ν‖kr∞ + (2n − 1)H L ‖μ − ν‖kr∞C i
```
```
= [2H + (2n − 1)C H L ]‖μ − ν‖∞,
```
where H := maxi∈I ‖Ui ‖, H L := maxi∈I ‖Ui ‖L , and C := maxi∈I C i . 
References
1. D. Bishop and C. Cannings. A generalized war of attrition. Journal of Theoretical Biology,
```
70(1):85–124, 1978.
```
2. V. I. Bogachev. Measure theory, volume 2. Berlin, 2007.
3. I. M. Bomze. Dynamical aspects of evolutionary stability. Monatshefte für Mathematik, 110(3-
```
4):189–206, 1990.
```
4. I. M. Bomze. Cross entropy minimization in uninvadable states of complex populations. Journal
```
of Mathematical Biology, 30(1):73–87, 1991.
```
5. M.-W. Cheung. Pairwise comparison dynamics for games with continuous strategy space.
Journal of Economic Theory, 153:344–375, 2014.
6. M.-W. Cheung. Imitative dynamics for games with continuous strategy space. Games and
Economic Behavior, 99:206–223, 2016.
7. J. Cleveland and A. S. Ackleh. Evolutionary game theory on measure spaces: well-posedness.
```
Nonlinear Analysis: Real World Applications, 14(1):785–797, 2013.
```
8. R. Cressman and J. Hofbauer. Measure dynamics on a one-dimensional continuous trait space:
```
theoretical foundations for adaptive dynamics. Theoretical Population Biology, 67(1):47–59,
```
2005.
9. I. Eshel and E. Sansone. Evolutionary and dynamic stability in continuous population games.
```
Journal of Mathematical Biology, 46(5):445–459, 2003.
```
10. M. Fujita, P. R. Krugman, and A. J. Venables. The spatial economy: cities, regions, and inter-
national trade. MIT press, 2001.
11. B. Heidergott and H. Leahu. Weak differentiability of product measures. Mathematics of Oper-
```
ations Research, 35(1):27–51, 2010.
```
12. J. Hofbauer, J. Oechssler, and F. Riedel. Brown–von neumann–nash dynamics: The continuous
```
strategy case. Games and Economic Behavior, 65(2):406–429, 2009.
```
13. J. Hofbauer and K. Sigmund. Evolutionary games and population dynamics. Cambridge Uni-
versity Press, Cambridge, 1998.
14. J. Hofbauer and K. Sigmund. Evolutionary game dynamics. Bulletin of the American Mathe-
```
matical Society, 40(4):479–519, 2003.
```
15. D. Kravvaritis, V. Papanicolaou, A. Xepapadeas, and A. Yannacopoulos. On a class of operator
equations arising in infinite dimensional replicator dynamics. Nonlinear Analysis: Real World
```
Applications, 11(4):2537–2556, 2010.
```
16. D. Kravvaritis, V. Papanicolaou, T. Xepapadeas, and A. Yannacopoulos. A class of infinite
dimensional replicator dynamics. In Dynamics, Games and Science, volume I, pages 529–532.
Springer, 2011.
17. D. Kravvaritis and V. G. Papanicolaou. Singular equilibrium solutions for a replicator dynamics
```
model. Electronic Journal of Differential Equations, 2011(87):1–8, 2011.
```
18. D. Kravvaritis, V. G. Papanicolaou, and A. N. Yannacopoulos. Similarity solutions for a repli-
```
cator dynamics equation. Indiana University Mathematics Journal, 57(4):1929–1945, 2008.
```
19. R. Lahkar and F. Riedel. The logit dynamic for games with continuous strategy sets. Games
and Economic Behavior, 2015.
184 S. Mendoza-Palacios and O. Hernández-Lerma
20. J. Maynard Smith and G. A. Parker. The logic of asymmetric contests. Animal Behaviour,
```
24(1):159–175, 1976.
```
21. S. Mendoza-Palacios and O. Hernández-Lerma. Evolutionary dynamics on measurable strategy
```
spaces: asymmetric games. Journal of Differential Equations, 259(11):5709–5733, 2015.
```
22. S. Mendoza-Palacios and O. Hernández-Lerma. Stability of the replicator dynamics for games
```
in metric spaces. Journal of Dynamics and Games, 4(4):–, 2017.
```
23. J. Oechssler and F. Riedel. Evolutionary dynamics on infinite strategy spaces. Economic Theory,
```
17(1):141–162, 2001.
```
24. J. Oechssler and F. Riedel. On the dynamic foundation of evolutionary stability in continuous
```
models. Journal of Economic Theory, 107(2):223–252, 2002.
```
25. V. G. Papanicolaou and G. Smyrlis. Similarity solutions for a multi-dimensional replicator
```
dynamics equation. Nonlinear Analysis: Theory, Methods & Applications, 71(7):3185–3196,
```
2009.
26. K. R. Parthasarathy. Probability measures on metric spaces. Academic Press, New York, 1967.
27. M. Ruijgrok and T. W. Ruijgrok. An effective replicator equation for games with a continuous
strategy set. Dynamic Games and Applications, pages 157–179, 2015.
28. W. H. Sandholm. Population games and evolutionary dynamics. MIT press, 2010.
29. L. K. Simon. Games with discontinuous payoffs. The Review of Economic Studies, 54(4):569–
597, 1987.
30. M. Van Veelen and P. Spreij. Evolution in games with a continuous action space. Economic
```
Theory, 39(3):355–376, 2009.
```
Eco-evolutionary Spatial Dynamics
of Nonlinear Social Dilemmas
Chaitanya S. Gokhale and Hye Jin Park
1 Introduction
The most significant impact of evolutionary game theory has been in the field of social
evolution. When an individual’s action results in a conflict between the individual
and the group benefit, a social dilemma arises. Social dilemmas can be captured by
the two-player prisoners dilemma game [6] and its multiplayer version, the public
goods game [8, 17, 24]. The domain of public goods games ranges from behavioural
economists, cognitive scientists, psychologists, to biologists given the ubiquity of
multiplayer interactions in nature. Situations impossible in two-player games can
occur in multiplayer games, which can lead to drastically different evolutionary
outcomes [7, 14, 35, 39, 44, 52].
In public goods games, while cooperation raises the group benefit, cooperators
themselves get less benefit than defectors. The group benefit typically increases
linearly with the number of cooperators in the group. However, in the context of
helping behaviour, reference [10] discusses a case where each additional cooperator
```
in the group provides more benefit than the previous (superadditivity of benefit).
```
The approach has been further generalised using a particular nonlinear function
```
where the additional cooperators can provide not only more (synergy) but also less
```
```
(discounting) benefit than the previous cooperator [20]. The study [5] presents an
```
excellent review of the use and importance of nonlinear public goods game.
The nonlinear public goods game as proposed in [20] has been extended in [13]
to include population dynamics. In ecological public goods games, the total density
of cooperators and defectors changes, effectively changing the interaction group
C. S. Gokhale (B)
Research Group for Theoretical Models of Eco-evolutionary Dynamics, Department of
Evolutionary Theory, Max Planck Institute for Evolutionary Biology, August Thienemann Str-2,
24306 Plön, Germany
e-mail: gokhale@evolbio.mpg.de
H. J. Park
Department of Evolutionary Theory, Max Planck Institute for Evolutionary Biology, August
Thienemann Str-2, 24306 Plön, Germany
```
© The Editor(s) (if applicable) and The Author(s), under exclusive license
```
to Springer Nature Switzerland AG 2020
D. M. Ramsey and J. Renault (eds.), Advances in Dynamic Games,
Annals of the International Society of Dynamic Games 17,
```
https://doi.org/10.1007/978-3-030-56534-3_8
```
185
186 C. S. Gokhale and H. J. Park
size. Changes in group size have been shown to result in a stable coexistence of
cooperators and defectors [19, 30, 38]. A spatial version of ecological public goods
games, where multiple populations of cooperators and defectors are present on a
lattice and connected by diffusion, can promote cooperation [53]. The spread of
cooperation, in such a case, is possible by a variety of pattern-forming processes.
They use of spatially extended system in different forms such as grouping, explicit
space and deme structures, and other ways of limiting interactions have been studied
for long [18, 33, 40, 45, 47, 55]. In particular, in [29], the authors provide conditions
for strategy selection in nonlinear games about population structure coefficients. The
study cited above by [53] while incorporating ecological dynamics focusses solely
on linear public goods games.
Previously we have combined a linear social dilemma with density-
dependent diffusion coefficients [12, 37]. Including a dynamic diffusion coeffi-
cient comes closer to analysing real movements seen across species from bacteria to
humans [16, 23, 27, 28, 32, 34, 43]. Incorporating aspects of ecological games as in
[19], spatial dynamics per [53] and nonlinear social dilemmas from [13] we develop
our previous approach in this study to nonlinear social dilemmas.
We begin by introducing nonlinearity in the payoff function of the social dilemma,
including population dynamics. Then we include simple diffusion dynamics and
analyse the resulting spatial patterns. For the parameter set comprising of the diffusion
coefficients and the multiplication factor, we can observe the extinction, heterogenous
or homogenous non-extinction patterns. Under certain simplifying assumptions, we
can also characterise the stability of the fixed point and discuss the dynamics of
the Hopf-bifurcation transition and the phase boundary between heterogenous- and
homogenous-patterned phases. Overall, our results suggest that the spatial patterns
while remaining in the same regions relative to each other in the parameter space,
synergy and discounting effects shift the boundaries including the phase boundary
between extinction and surviving phases. For synergy, the extinction region shrinks
as the effective benefit increases resulting in an increased possibility of cooperator
persistence. For discounting, however, the extinction region expands. Crucially, the
change in the extinction region is not symmetric for synergy and discounting. The
above asymmetry is due to the asymmetries in the nonlinear function that we employ
for calculating the benefit. The development will help contrast the results with the
work of [53] and relates our work to realistic public goods scenarios where the
contributions often have a nonlinear impact [9].
2 Model and Results
2.1 Nonlinear Public Goods Game
Complexity of evolutionary games increases as we move from two-player games
to multiplayer games [14]. A similar trend ensues as we move from linear public
Eco-evolutionary Spatial Dynamics of Nonlinear Social Dilemmas 187
goods games to nonlinear payoff structures [5]. One of the ways of moving from
linear to nonlinear multiplayer games is given in [20]. To introduce this method in
our notational form, we will first derive the payoffs in a linear setting.
```
In the classical version of the public goods game (PGG), the cooperators invest
```
c to the common pool while the defectors contribute nothing. The value of the pool
increases by a certain multiplication factor r, 1 < r < N , where N is the group size.
The amplified returns are equally distributed to all the N players in the game. For
such a setting, the payoffs for cooperators and defectors are given by
```
PD (m) = rcmN ,
```
```
PC (m) = rcmN − c, (1)
```
where m is the number of cooperators in the group. The nonlinearity in the payoffs
can be introduced by the parameter Ω as in [20],
```
PD (m) = rcN (1 + Ω + Ω2 + . . . + Ωm−1) = rcN1 − Ω
```
m
1 − Ω ,
```
PC (m) = PD (m) − c = rcN Ω(1 + Ω + . . . + Ωm−2) + rcN − c. (2)
```
If Ω > 1 every additional cooperator contributes more than the previous, thus pro-
viding a synergistic effect. If Ω < 1 then every additional cooperator contributes less
than the previous, thus saturating the benefits and providing a discounting effect. The
linear version of the PGG can be recovered by setting Ω = 1.
```
As in [19] besides the evolutionary dynamics (change in the frequency of coop-
```
```
erators over time), we are also interested in the ecological dynamics (change in
```
```
the population density over time). This system analysed in [19, 21] is briefly re-
```
introduced in our notation for later extension. We characterise the densities of coop-
erators and defectors in the population as u and v. Thus 0 ≤ u + v ≤ 1 and the empty
space is given by w = 1 − u − v. Low population density means that it is hard to
encounter other individuals and accordingly hard to interact with them. Hence, the
group size N , the maximum group size, in this case, is not always reachable. Instead,
S individuals form an interacting group. With fixed N the interacting group size S is
```
bounded, S ≤ N , and the probability p(S; N ) of interacting with S − 1 individuals
```
is depending on the total population density u + v = 1 − w. When we consider the
```
focal individual, the probability p(S; N ) of interacting with S − 1 individuals among
```
```
a maximum group of size N − 1 individuals (excluding the focal individual),
```
```
p(S; N ) =
```
```
(N − 1
```
S − 1
```
)
```
```
(1 − w)S−1w N −S . (3)
```
Then, the average payoffs for defectors and cooperators, f D and f C , are given as
188 C. S. Gokhale and H. J. Park
```
f D = ∑NS=2 p(S; N )PD (S),
```
```
f C = ∑NS=2 p(S; N )PC (S), (4)
```
```
where PD (S) and PC (S) are the expected payoffs for defectors and cooperators at
```
a given S. The sum for the group sizes S starts at two as for a social dilemma there
need to be at least two interacting individuals.
To derive the expected payoffs, we first need to assess the probability of having a
```
certain number of cooperators m in a group of size S − 1 which is given by p c(m; S),
```
```
p c(m; S) =
```
```
(S − 1
```
m
```
) ( u
```
1 − w
```
)m ( v
```
1 − w
```
)S−1−m
```
```
. (5)
```
```
Thus, the payoffs in Eq. (2) are weighted with the probability of there being m
```
cooperators, giving us the expected payoffs,
```
PD (S) =
```
S−1∑
```
m=0
```
```
p c(m; S)PD (m),
```
```
PC (S) =
```
S−1∑
```
m=0
```
```
p c(m; S)PC (m + 1). (6)
```
The average payoffs f D and f C are thus given by
```
f D = rN11−w−u(1−Ω)
```
```
[ (u(Ω − 1) + 1)N −1
```
Ω − 1 −
```
u(1 − w N )
```
1 − w
]
,
```
f C = f D − 1 − (r − 1)w N −1 + rN(1 − u(1 − Ω))
```
N − w N
```
1 − w − u(1 − Ω) , (7)
```
where the investment cost has been set to c = 1 without loss of generality. Again,
the linear version of the PGG can be recovered by setting Ω = 1,
f D = ru1 − w
[
```
1 − (1 − w
```
```
N )
```
```
N (1 − w)
```
]
,
```
f C = f D − 1 − (r − 1)w N −1 + rN1 − w
```
N
```
1 − w . (8)
```
2.2 Spatial Nonlinear Public Goods Games
For tracing the population dynamics, we are interested in the change in the densities
of cooperators and defectors over time. Both cooperators and defectors are assumed
to have a baseline birth rate of b and death rate of d. Growth is possible only when
Eco-evolutionary Spatial Dynamics of Nonlinear Social Dilemmas 189
there is empty space available, i.e. w > 0. We track the densities of cooperators and
defectors by an extension of the replicator dynamics [19, 22, 48],
```
˙u = u[w( f C + b) − d],
```
```
˙v = v[w( f D + b) − d]. (9)
```
To include spatial dynamics in the above system, we assume that a population of
cooperators and defectors resides in a given patch. Game interactions only occur
within patches, and the individuals can move adjacent patches. The patches live in a
two-dimensional space connected in the form of a regular lattice. Taking a continuum
limit, we obtain the differential equations with constant diffusion coefficients for
cooperators D c and defectors D d ,
```
˙u = D c∇2u + u[w( f C + b) − d],
```
```
˙v = D d ∇2v + v[w( f D + b) − d]. (10)
```
At the boundaries, there is no in- and out-flux. As in classical activator-inhibitor
systems, the different ratio of the diffusion coefficients D = D d /D c can generate
various patterns from coexistence, extinction as well as chaos [53].
Nonlinearity in PGG is implemented by Ω  = 1. Previous work shows that the
```
introduction of Ω is enriching the dynamics [13, 20]. Synergy (Ω > 1) enhances
```
```
cooperation while discounting (Ω < 1) suppresses it. Accordingly, synergy and dis-
```
counting with a multiplication factor r can map into the linear game with the higher
or lower multiplication factor r′, respectively: r′ > r for synergy and r′ < r for
discounting. We call r′ as the effective multiplication factor. As shown in Fig. 1,
```
for synergy effect (Ω = 1.1), we can find a chaotic coexistence of cooperators and
```
```
defectors. The same parameter for a linear case (Ω = 1.0) resulted in total extinction
```
of the population [53]. In the linear case, chaotic patterns were observed for r values
larger than that of extinction patterns. Thus, our observation implies the mechanism
of how synergy works by effectively increasing r value.
The change in the resulting patterns due to synergy or discounting is not limited to
extinction or chaos but is a general feature of the nonlinearity in payoffs. To illustrate
```
this change, we show how a stable pattern under linear PGG (Ω = 1) can change
```
the shape under discounting or synergy in Fig. 2. Such changes in the final structure
happen all over the parameter space. To confirm this tendency, we examine the spatial
patterns for various parameters and find five phases, same as in the linear PGG case
```
[53] but now with shifted phase boundaries (see Fig. 3). The effective multiplication
```
factor r′ increases with an increasing Ω, and thus the location of the Hopf bifurcation
also shifts. As a result of shifting rHopf , extinction region is reduced in the parameter
space with synergy effect. We thus focus our attention on the Hopf-bifurcation point
rHopf .
190 C. S. Gokhale and H. J. Park
```
t = 0 t = 950 t = 1900
```
```
t = 2850 t = 3800 t = 4750
```
Fig. 1 Pattern formation on the two-dimensional square lattice. We observe the chaotic pattern
```
for Ω = 1.1 (synergy effect) where extinction comes out with Ω = 1 [53]. Mint green and Fuchsia
```
pink colours represent the cooperator and defector densities, respectively. For a full explanation of
the colour scheme, we refer to the appendix. Black indicates no individual on the site, whereas blue
appears when the ratio of cooperators and defectors is the same. For a system of size L, initially, a
disc with radius L/10 at the centre is occupied by cooperator and defector with densities 0.1. We
use multiplication factor r = 2.2 and diffusion coefficient ratio D = 2. Throughout the paper, for
simulations, we used the system size L = 283, dt = 0.1 and dx = 1.4 with the Crank–Nicolson
algorithm
Ω=0.9 Ω=1.0 Ω=1.1
Homogeneous
coexistence
Diffusion induced
instability
Diffusion induced
coexistence
```
D=8 r =2.44
```
Fig. 2 Synergy and discounting effects on pattern formation. We get the different patterns
under discounting and synergy effects distinct from the linear PGG game at a given the same
parameter set. While diffusion-induced instability is observed in the linear PGG, the discounting
effect makes diffusion-induced coexistence pattern implying that the discounting effect makes the
Hopf-bifurcation point shift to the larger value. Under the synergy effect, on the contrary, we
obtain the opposite trend observing the homogenous coexistence pattern. In the linear PGG, the
homogenous patterns are observed in higher multiplication factor r, implying the shift of rHopf to
the smaller value under the synergy effect
Eco-evolutionary Spatial Dynamics of Nonlinear Social Dilemmas 191
multiplication factor r
ratio of diffusion constants
D
2.00 2.12 2.17 2.22 2.27 2.32 3.00
1
5
25
50
```
(a) (b)
```
ratio of diffusion constants
D
multiplication factor r
Extinction
Chaos
Diffusioninduced
coexistenceDiffusion induced instability
Homogeneous coexistence
Fig. 3 Spatial patterns and corresponding phase diagram for Ω = 1.1. There are five phases
```
(framed using different colours), extinction (black), chaos (blue), diffusion-induced coexistence
```
```
(red), diffusion-induced instability (green) and homogeneous coexistence (orange). The Hopf-
```
bifurcation point rHopf  2.2208 and the boundary between diffusion-induced instability and homo-
geneous coexistence are analytically calculated, while the other boundaries are from the simulation
results. All boundaries and rHopf shift to the left, indicating that the multiplication factor r with the
synergy maps into the higher multiplication factor r′ in the linear game
2.2.1 Hopf Bifuraction in Nonlinear PGG
```
We find the Hopf-bifurcation point rHopf for various Ω values using Eq. (7).
```
The effective multiplication factor r′ increases as Ω increases, and thus rHopf is
monotonically decreasing with Ω as in Fig. 4a. The tangential line at Ω = 1
Fig. 4 Hopf-bifurcation points in Ω and shift of the phase boundary. a The Hopf-bifurcation
```
point rHopf for various Ω (solid line with points). Synergy (Ω > 1) decreases rHopf while discount-
```
```
ing (Ω < 1) increases rHopf . By decreasing rHopf , the surviving region is extended in the parameter
```
space. The solid line without points is a tangential line at Ω = 1. b The phase boundaries between
diffusion-induced instability and homogeneous coexistence phases are also examined for various
Ω. Since rHopf increases with a decreasing Ω, the boundaries also move to the right
192 C. S. Gokhale and H. J. Park
is drawn for comparing the effects of synergy and discounting. If we focus on
the differences between the tangent and rHopf line, synergy changes rHopf more
dramatically than discounting. Synergy and discounting effects originate from
```
1 + (1 ± Ω) + (1 ± Ω)2 + · · · + (1 ± Ω)m−1 in Eq. (2), where Ω > 0 and
```
plus and minus signs for synergy and discounting, respectively. Straightforwardly,
```
the difference between 1 and (1 + Ω)k is larger than that of (1 − Ω)k for k > 2.
```
Hence, the nonlinear PGG itself gives different rHopf for the same Ω.
2.2.2 Criterion for Diffusion-Induced Instability
Since Ω changes r′ value, the phase boundary also moves. By using the linear
stability analysis, we find phase boundaries between diffusion-induced instability
and homogeneous coexistence phases in r-D space shown in Fig. 4b. To do that,
```
we introduce new notations, and two reaction–diffusion equations in Eq. (10) can be
```
written as
```
∂t u = D∇2u + R(u), (11)
```
```
with density vector u = (u, v)T and matrix D =
```
```
( D
```
c 0
0 D d
```
)
```
. Elements of the vector
```
R(u) =
```
```
( g(u, v)
```
```
h(u, v)
```
```
)
```
indicate reaction terms for each density which is the second terms
```
in Eq. (10). Without diffusion, the differential equations have homogeneous solution
```
```
u0 = (u0, v0)T where g(u0, v0) = h(u0, v0) = 0. We assume that the solution is a
```
fixed point, and examine its stability under diffusion.
If we consider small perturbation ˜u from the homogeneous solution, u ∼= u0 + ˜u,
we get the relation,
```
∂t ˜u = D∇2 ˜u + J ˜u, (12)
```
```
where J = (∂R/∂u)u 0 ≡
```
```
( g
```
u gv
h u h v
```
)∣∣
```
∣∣
u 0
. Subscripts of the g and h mean partial deriva-
tive of that variable, e.g. gu means ∂g/∂u. Decomposing ˜u = ∑k ak e ikr based on
propagation wave number k gives us relation ˙ak = Bak where B ≡ J − k2D. There-
fore, the stability of the homogeneous solution can be examined by the matrix B.
```
Note that Tr(B) < 0 is guaranteed because Tr(J) < 0. Hence, if the determinant of
```
```
B is smaller than zero [det(B) < 0], it means one of the eigenvalues of the matrix B
```
is positive. The homogeneous solution becomes unstable and Turing patterns appear.
```
The condition for det(B) < 0 is given by
```
```
( g
```
u
D c+
h v
D d
```
)2
```
```
> 4 det(J)D
```
c D d
```
. (13)
```
It can be rewritten as following form:
Eco-evolutionary Spatial Dynamics of Nonlinear Social Dilemmas 193
multiplication factor r
ratio of diffusion constants
D
```
rhopf (Ω = 1) rhopf (Ω = 0.9)rhopf (Ω = 1.1)
```
Ω = 1.1 Ω = 1.0 Ω = 0.9
Δr
Fig. 5 Schematic figure for expected shift of phase boundaries. According to the change of
rHopf , over all phase boundaries may shift together at the same direction. As we have seen in
Fig. 4b, the phase boundaries with rHopf move to the right with discounting effect and move to
the left with synergy effect, respectively. Accordingly, the surviving region in the parameter space
expands with synergy effect while it shrinks with discounting effect
D d
D c>
```
gu h v − 2gv h u + 2√−gv h u det(J)
```
```
g2u. (14)
```
With our model parameters this inequality is equivalent to
D > vu1C2
u
[
C u D v − 2C v D u
```
(
```
1 −
√
C v D u E
```
)]∣∣
```
∣∣
```
u=u∗,v=v∗
```
```
, (15)
```
where u∗ and v∗ are values at the fixed point. The symbols indicate
```
( C
```
u C v
D u D v
```
)
```
=
```
( d − w2∂
```
u f C d − w2∂v f C
d − w2∂u f D d − w2∂v f D
```
)
```
```
, (16)
```
```
E = C v∂u f D − C u ∂v f D + d∂u f C − d∂v f C ,
```
with ∂x y = ∂ y∂ x . If the above criterion is satisfied, the stable fixed point predicted
```
without diffusion becomes unstable with diffusion (Fig. 5).
```
3 Discussion
Linear public goods game is a useful approximation of the real nonlinearities in
social dilemmas from microbes to macro-life [15, 36, 49] with applications such
as in antibiotic resistance [25] as well as cancer [1]. However, taking nonlinearities
into account might show different resulting outcomes from naive expectations [13].
194 C. S. Gokhale and H. J. Park
Especially, nonlinearities in interactions have a profound effect in ecology when it
comes to fecundity and avoiding predation [56, 57]. In this manuscript, we have
extended the analysis of spatial public goods games beyond the traditional linear
public goods games.
The benefits, in our case, accumulate in a nonlinear fashion in the number of
cooperators in the group. Each cooperator can provide a larger benefit than the last
```
one as the number of cooperators increases (resulting in a synergy), or each cooperator
```
```
provides a smaller benefit than the previous one (thus leading to discounting) [20].
```
Such an extension to public goods game was proposed very early on by [10]. Termed
as superadditivity in benefits, extending from this particular model framework, we
can visualise nonlinearities in costs as well, a concept not yet dealt with. Again, such
economies of scale [9] can be justified in both bacterial and human interactions as
```
proxies for quorum sensing (or quenching) or accruing of wealth (or austerity) [3,
```
4, 40].
We show that including such nonlinearities in the benefit function affects the
effective rate of return from the public goods game, irrespective of the types of
diffusion dynamics. With spatial dynamics, synergy increases the effective rate of
return on the investment and expands the region in the parameter space where survival
of the population is possible. This itself may make cooperation a favourable strategy.
Besides the trivial observation that synergy helps cooperators, we show that as we
move symmetrically away from the linear case towards more synergy or discounting,
the change in the eventual dynamics is not symmetric. It would be interesting to check
if the asymmetry holds for different designs of benefit functions.
We used the particular functional form of the benefit function, including nonlin-
earities in payoffs [20]. However, there are various ways of including nonlinearities
in the benefit function [4, 7, 40]. The model considered in [40] extends the results
of [20] to games between relatives. Furthermore, [40] has described the relation-
ships between different nonlinear social dilemma models with a variety of benefit
functions. Also these nonlinear social dilemmas have been analysed in a structured
population [29, 40, 41]. However, previous studies have focused on the approach
presented in [46], which provide a criterion for strategy selection rather than explic-
itly positioning the populations on a grid and including diffusion. When studying
games in structured populations, often a network structure is considered [2, 42]. The
role of network connectivity is determined to be critical for the eventual evolutionary
outcome [41, 50, 51] and some structures can result in hindering the evolution of
cooperation as well [26]. In contrast, our approach focuses more on the ecological
framework but not in network structures. We take into account not only the changes
in frequencies of cooperators and defectors but also the population dynamics, which
is usually missed in a network approach. While both approaches make evolutionary
games ecologically explicit, the models are thoroughly different in their setup and
implementation.
The importance of including ecology in evolutionary games has been known for
long, but the complexity that it generates has prevented it from garnering widespread
attention [11]. Seasonal variations in the rate of return radically change the selection
pressures on cooperation and defection. Changes in the ecology may not feedback
Eco-evolutionary Spatial Dynamics of Nonlinear Social Dilemmas 195
Fig. 6 The exact colour
scheme developed for
colouring the patterns. Each
patch in a pattern is coloured
using this palette by
choosing the corresponding
f and ρ values. For
```
brightness we used Eq. (17)
```
with a = 15
directly to the frequencies of cooperators and defectors but on to a variable in benefit–
```
cost functions. If the variable affects the frequency of cooperators and defectors (or
```
```
even the group size) in a nonlinear fashion, then the results are not trivial [13, 38].
```
Thus, even a simple connection between evolutionary and ecological dynamics may
already generate rich dynamics [31, 54], and the feedback between the two is often
already convoluted. Similar to [12, 37], it is possible to include feedback between the
population dynamics and diffusion here, but together with a nonlinear social dilemma,
we envision that the formal analysis and the computational implementation will be
a considerable challenge.
Acknowledgments We thank Christoph Hauert for comments and suggestions in improving an
early version of the manuscript. The authors thank the constructive comments of the reviewers.
Both authors acknowledge generous support from the Max Planck Society.
Appendix
Colour Coding
```
Similar to the colour coding used in [37] we use mint green (colour code: #A7FF70)
```
```
and Fuchsia pink (colour code: #FF8AF3) colours for denoting the cooperator and
```
defector densities, respectively, for each type. The colour spectrum and saturation is
determined by the ratio of cooperators to defectors which results in the Maya blue
colour for equal densities of cooperators and defectors. For convenience, we use
```
HSB colour space which is a cylindrical coordinate system (r, θ, h) = (saturation,
```
```
hue, brightness). The radius of circle r indicates saturation or the colour whereas
```
θ helps us transform the RGB space to HSB. The total density of the population
ρ = u + v is represented by the brightness h of the colour. For better visualisation,
we formulate the brightness h as
196 C. S. Gokhale and H. J. Park
log aρ + 1
```
log a + 1 , (17)
```
```
where a control parameter a (> −1 and  = 0) (see Fig. 6). The complete colour
```
scheme so developed passes the standard tests for colour blindness.
References
1. Aktipis A (2016) Principles of cooperation across systems: from human sharing to multicellu-
```
larity and cancer. Evolutionary Applications 9(1):17–36
```
2. Allen B, Lipper G, Chen YT, Fotouhi B, Nowak MA, Yau ST (2017) Evolutionary dynamics
on any population structure. Nature 544:227–230
3. Archetti M (2009) Cooperation as a volunteer’s dilemma and the strategy of conflict in public
goods games. Journal of Evolutionary Biology 11:2192–2200
4. Archetti M, Scheuring I (2011) Co-existence of cooperation and defection in public goods
```
games. Evolution 65(4):1140–1148
```
5. Archetti M, Scheuring I (2012) Review: Game theory of public goods in one-shot social dilem-
```
mas without assortment. Journal of Theoretical Biology 299(0):9–20
```
6. Axelrod R (1984) The evolution of cooperation. Basic Books, New York, NY
7. Bach LA, Helvik T, Christiansen FB (2006) The evolution of n-player cooperation - threshold
games and ESS bifurcations. Journal of Theoretical Biology 238:426–434
8. Binmore KG (1994) Playing fair: game theory and the social contract. MIT Press, Cambridge
9. Dawes RM, Orbell JM, Simmons RT, Van De Kragt AJC (1986) Organizing groups for collec-
```
tive action. The American Political Science Review 80(4):1171–1185
```
10. Eshel I, Motro U (1988) The Three Brothers’ Problem: Kin Selection with More than One
```
Potential Helper. 1. The Case of Immediate Help. The American Naturalist 132(4):550–566
```
11. Estrela S, Libby E, Van Cleve J, Débarre F, Deforet M, Harcombe WR, Peña J, Brown SP,
```
Hochberg ME (2018) Environmentally Mediated Social Dilemmas. Trends in Ecology & Evo-
```
```
lution 34(1):6–18
```
12. Funk F, Hauert C (2019) Directed migration shapes cooperation in spatial ecological public
```
goods games. PLOS Computational Biology 15(8):1–14
```
13. Gokhale CS, Hauert C (2016) Eco-evolutionary dynamics of social dilemmas. Theoretical
Population Biology 111:28–42
14. Gokhale CS, Traulsen A (2010) Evolutionary games in the multiverse. Proceedings of the
National Academy of Sciences USA 107:5500–5504
15. Gore J, Youk H, van Oudenaarden A (2009) Snowdrift game dynamics and facultative cheating
in yeast. Nature 459:253–256
16. Grauwin S, Bertin E, Lemoy R, Jensen P (2009) Competition between collective and individual
dynamics. Proceedings of the National Academy of Sciences of the United States of America
```
106(49):20,622–20,626
```
17. Hardin G (1968) The tragedy of the commons. Science 162:1243–1248
18. Hauert C, Imhof L (2012) Evolutionary games in deme structured, finite populations. Journal
of Theoretical Biology 299:106–112
19. Hauert C, Holmes M, Doebeli M (2006a) Evolutionary games and population dynamics: main-
tenance of cooperation in public goods games. Proceedings of the Royal Society B 273:2565–
2570
20. Hauert C, Michor F, Nowak MA, Doebeli M (2006b) Synergy and discounting of cooperation
in social dilemmas. Journal of Theoretical Biology 239:195–202
21. Hauert C, Yuichiro Wakano J, Doebeli M (2008) Ecological public goods games: cooperation
and bifurcation. Theoretical Population Biology 73:257–263
Eco-evolutionary Spatial Dynamics of Nonlinear Social Dilemmas 197
22. Hofbauer J, Sigmund K (1998) Evolutionary Games and Population Dynamics. Cambridge
University Press, Cambridge, UK
23. Kawasaki K, Mochizuki A, Matsushita M, Umeda T, Shigesada N (1997) Modeling spatio-
temporal patterns generated by bacillus subtilis. Journal of Theoretical Biology 188:177–185
24. Kollock P (1998) Social dilemmas: The anatomy of cooperation. Annual Review of Sociology
24:183–214
25. Lee HH, Molla MN, Cantor CR, Collins JJ (2010) Bacterial charity work leads to population-
```
wide resistance. Nature 467(7311):82–85
```
26. Li A, Broom M, Du J, Wang L (2016) Evolutionary dynamics of general group interactions in
```
structured populations. Physical Review E 93(2):022,407
```
27. Loe LE, Mysterud A, Veiberg V, Langvatn R (2009) Negative density-dependent emigration
of males in an increasing red deer population. Proc R Soc B 276:2581–2587
28. Lou Y, Martínez S (2009) Evolution of cross-diffusion and self-diffusion. Journal of Biological
```
Dynamics 3(4):410–429
```
29. McAvoy A, Hauert C (2016) Structure coefficients and strategy selection in multiplayer games.
Journal of Mathematical Biology pp 1–36
30. McAvoy A, Fraiman N, Hauert C, Wakeley J, Nowak MA (2018) Public goods
games in populations with fluctuating size. Theoretical Population Biology 121:72–84,
```
https://doi.org/10.1016/j.tpb.2018.01.004
```
31. McNamara JM (2013) Towards a richer evolutionary game theory. Journal of The Royal Society
Interface 10:20130,544
32. Ohgiwari M, Matsushita M, Matsuyama T (1992) Morphological changes in growth phenomena
of bacterial colony patterns. J Phys Soc Jap 61:816–822
33. Ohtsuki H, Pacheco J, Nowak MA (2007) Evolutionary graph theory: Breaking the symmetry
between interaction and replacement. Journal of Theoretical Biology 246:681–694
34. Okubo A, Levin SA (1980) Diffusion and Ecological Problems: Mathematical Models.
Springerr-Verlag
35. Pacheco JM, Santos FC, Souza MO, Skyrms B (2009) Evolutionary dynamics of collective
action in n-person stag hunt dilemmas. Proceedings of the Royal Society B 276:315–321
36. Packer C, Ruttan L (1988) The evolution of cooperative hunting. The American Naturalist
132:159–198
37. Park HJ, Gokhale CS (2019) Ecological feedback on diffusion dynamics. Journal of the Royal
Society Open Science 6:181,273
38. Peña J (2012) Group size diversity in public goods games. Evolution 66:623–636
39. Peña J, Lehmann L, Nöldeke G (2014) Gains from switching and evolutionary stability in
multi-player matrix games. Journal of Theoretical Biology 346:23–33
40. Peña J, Nöldeke G, Lehmann L (2015) Evolutionary dynamics of collective action in spatially
structured populations. Journal of Theoretical Biology 382:122–136
41. Peña J, Wu B, Arranz J, Traulsen A (2016) Evolutionary games of multiplayer cooperation on
```
graphs. PLoS Computational Biology 12(8):1–15
```
42. Santos FC, Pacheco JM, Lenaerts T (2006) Evolutionary dynamics of social dilemmas in
structured heterogeneous populations. Proceedings of the National Academy of Sciences USA
103:3490–3494
43. Shigesada N, Kawasaki K, Teramoto E (1979) Spatial segregation of interacting species. Journal
```
of Theoretical Biology 79(1):83–99
```
44. Souza MO, Pacheco JM, Santos FC (2009) Evolution of cooperation under n-person snowdrift
games. Journal of Theoretical Biology 260:581–588
45. Tarnita CE, Antal T, Ohtsuki H, Nowak MA (2009a) Evolutionary dynamics in set structured
populations. Proceedings of the National Academy of Sciences USA 106:8601–8604
46. Tarnita CE, Ohtsuki H, Antal T, Fu F, Nowak MA (2009b) Strategy selection in structured
populations. Journal of Theoretical Biology 259:570–581
47. Tarnita CE, Wage N, Nowak MA (2011) Multiple strategies in structured populations. Pro-
ceedings of the National Academy of Sciences USA 108:2334–2337
198 C. S. Gokhale and H. J. Park
48. Taylor PD, Jonker LB (1978) Evolutionarily stable strategies and game dynamics. Mathematical
Biosciences 40:145–156
49. Turner PE, Chao L (1999) Prisoner’s Dilemma in an RNA virus. Nature 398:441–443
50. van Veelen M, Nowak MA (2012) Multi-player games on the cycle. Journal of Theoretical
Biology 292:116–128
51. van Veelen M, García J, Rand DG, Nowak MA (2012) Direct reciprocity in structured popu-
lations. Proceedings of the National Academy of Sciences USA 109:9929–9934
52. Venkateswaran VR, Gokhale CS (2019) Evolutionary dynamics of complex multiple games.
```
Proceedings of the Royal Society B: Biological Sciences 286(1905):20190,900
```
53. Wakano JY, Nowak MA, Hauert C (2009) Spatial dynamics of ecological public goods. Pro-
ceedings of the National Academy of Sciences USA 106:7910–7914
54. Weitz JS, Eksin C, Paarporn K, Brown SP, Ratcliff WC (2016) An oscillating tragedy of the
commons in replicator dynamics with game-environment feedback. Proceedings of the National
```
Academy of Sciences of the United States of America 113(47):E7518–E7525
```
55. Wright S (1930) The genetical theory of natural selection. Journal of Heredity 21:349–356
56. Wrona FJ, Jamieson Dixon RW (1991) Group Size and Predation Risk: A Field Analysis of
```
Encounter and Dilution Effects. The American Naturalist 137(2):186–201
```
57. Zöttl M, Frommen JG, Taborsky M (2013) Group size adjustment to ecological demand
in a cooperative breeder. Proceedings of the Royal Society B: Biological Sciences
```
280(1756):20122,772
```
Applications to Economics
Heuristic Optimization for Multi-Depot
Vehicle Routing Problem in ATM
Network Model
Valeria Platonova, Elena Gubar, and Saku Kukkonen
1 Introduction
This work is inspired by a real-life optimization problem, which is generally based on
the distribution of goods, traffic planning, and management. The modern metropoli-
tan environment cannot be imagined without facilities such as ATM networks. One
of the most actual problems in the ATM network of the bank is cash flow opti-
mization and organization of uninterrupted work. The current paper considers the
problem in which a set of geographically dispersed ATMs with known requirements
must be serviced with a heterogenous fleet of money collector teams stationed in
the depots with the objective of minimizing the total distribution costs. Metropolitan
banks typically come across the problem of long distances between encashment cen-
ters, depots, and ATMs, particularly in the situations where several ATMs are to be
located in remote districts of the city. Generally speaking, client support and servic-
ing the ATM network can be costly: it takes employees time to supervise the network
and make decisions on managing the cash flow efficiently and it also involves high
```
operating costs (i.e., financial, transport, etc.). The servicing costs of the bank can
```
be reduced through the implementation of an appropriate encashment strategy and
optimizing encashment routes in ATM network. In the previous study [14], the com-
bined framework has been considered where the optimal encashment routes were
designed based on the statistical prediction of money demand in the ATM network.
V. Platonova
Intermedia Ltd, Sunnyvale, CA, USA
e-mail: vplatonova@intermedia.net
E. Gubar (B)
Faculty of Applied Mathematics and Control Processes,
St. Petersburg State University, St Petersburg, Russia
e-mail: e.gubar@spbu.ru
S. Kukkonen
Machine Learning Group, School of Computing,
University of Eastern Finland, Joensuu, Finland
e-mail: saku.kukkonen@uef.fi
```
© The Editor(s) (if applicable) and The Author(s), under exclusive license
```
to Springer Nature Switzerland AG 2020
D. M. Ramsey and J. Renault (eds.), Advances in Dynamic Games,
Annals of the International Society of Dynamic Games 17,
```
https://doi.org/10.1007/978-3-030-56534-3_9
```
201
202 V. Platonova et al.
ATMs in suburbs
Depot
ATMs in
the
city center
Fig. 1 An example of location of encashment centers and ATMs for one bank in St.Petersburg
However, the research takes into account the Capacitated Vehicle Routing Problem
```
(CVRP) with only one depot. The problem of remote locations inevitably leads to
```
the increase in servicing costs and thus requires a new approach to develop for new
depots. Figure 1 illustrates an example of encashment centers and ATMs location
in St.Petersburg and the neighboring districts. The picture enables to consider the
necessity of establishing new depots and optimization of encashment routes.
The foregoing discussion stipulates the necessity of considering the complex
problem of encashment process in the bank with many banking branches and ATM
network dispersed across a large area as a composition of several modified Capaci-
```
tated Vehicle Routing Problems (CVRP). This model is a widely used extension of
```
```
the Vehicle Routing Problem (VRP), which have been one of the key models in the
```
optimization studies, since it was proposed by Dantzig in [11]. Recently, the VRP has
been one of the most studied problems in the combinatorial optimization of cargo,
passenger traffic, and logistics, which can be explained by its great relevance for
real-life applications as well as its being one of the most challenging combinatorial
optimization tasks. In the classical VRP, CVRP routes are constructed starting from
one common vertex to multiple geographically dispersed customers and service them
with the minimum total cost. Today minimization of operational costs without qual-
ity and safety lapses is considered to be one of the most important objectives. This
tendency has attracted considerable attention in the recent years, see in [10, 15, 21].
The main objective of the study is to adapt and consider the possibilities of applying
```
well-known transportation (logistics) models together with approved optimization
```
methods as a solution to the problems arising in banking sphere, particularly during
encashment process. This study can be considered, on the one hand, as a research
project that is aimed at examining the possibilities of applying various techniques to
solve problems related to complex transportation models, and, on the other hand, if
Heuristic Optimization for Multi-Depot Vehicle … 203
the paper can be considered as a case study of an encashment process in one bank of
St. Petersburg, taking into account the real-life traffic conditions.
The logistics problem concerned marks out two possible approaches: the first one
```
is the optimization of the location of depot (encashment centers) over the feasible area
```
and evaluation of the ATMs availability and construction/opening a new depot, the
second, calculation of the optimal or nearly optimal routes from to existing depots.
Previous studies have presented a wide range of different optimization methods for
transportation models that lead to the necessity of selecting of relevant techniques
for the problems considered. We have opted for the Multi-Depot Location Routing
```
Problem (MDLRP) and Multi-Depot Vehicle Routing Problem (MDVRP). On the
```
one hand, these two models are widely applied nowadays, but on the other hand
they can be modified according to the real-life problem concerned. The MDVRP
presents a generalization of the vehicle routing problem, where vehicles depart from
and arrive to one of multiple depots. Furthermore, it is necessary to mark which depot
the money collector teams visit, additionally to the definition of the vehicles routes.
The MDVRP simultaneously defines the service areas of each depot and establishes
the associated vehicle routes [28].
It is more cost efficient for a bank to have several encashment centers, which are
located in different districts of the city. Therefore, the problem of encashment of the
ATMs network can be described through a complex model which combines Multi-
Depot Location Routing Problem and Multi-Depot Vehicle Routing Problem. In the
current study, we use Cluster First-Route Second approach to find a solution to the
considered optimization tasks. Thus, in this paper we propose two-stage process to
solve the MDLRP. On the first stage, a feasible solution is obtained using the Clarke–
Wright algorithm [7]. The second stage includes defining the optimal locations of
encashment centers through the method of Super-ATMs [26] and the construction of
```
a heuristic solution using evolutionary computation (EC) [13].
```
The constructive heuristics have been considered as one of the most convenient and
efficient methods to solve the VRP and its modifications. Evolutionary computation
is a stochastic approach to global optimization. Although evolutionary computation
does not guarantee finding the optimum, it can often find a good solution even to
hard problems. The problem discussed in this paper is basically a modification of
the traveling salesman problem which is suitable for evolutionary computation.
Solving the MDLRP by using the method of Super-ATMs enables clustering the
ATM network according to the distance between them and the nearest encashment
center. This process helps to reduce transportation servicing costs of ATMs in remote
districts of the city. However, the introduction of a new encashment center compli-
cates the solution as it generates new subproblems where each of them should satisfy
all constraints of the initial routing problem. The solution of the MDLRP provides a
depot location plan. As soon as a new distinct location plan is found, the set of routes
from the depots can be defined. At this stage, the MDVRP formulation can be used
for defining the optimal routes of money collector teams. The MDVRP belongs to
the class of NP-hard optimization problems, hence it is very difficult to receive the
optimal solution for a large amount of units [2, 3].
204 V. Platonova et al.
Routing problems concern a vast range of real-life problems, which makes it a
widely discussed subject nowadays. Numerous research studies have been dedicated
to developing and improving new and existing algorithms for solving such problems
[8, 31, 34]. The key objective of improving the algorithm is to obtain better solutions,
as well as to increase the efficiency of the algorithm and avoid premature conver-
gence. For example, in [6], Carlsson considered two heuristic methods for solving
the MDVRP. The first method is based on the technique of linear programming with
global improvements. The second method is based on the asymptotic optimality. As
a solution to the problem, Nallusamy, in his turn, has proposed clustering at the first
stage [24]. This technique allows to divide the serviced territory into several areas
with a given number of vehicles, hence the original problem is also divided into sev-
eral subproblems such as the VRP, each of them has a feasible solution, which was
```
optimized using a genetic algorithm (GA) (one form of evolutionary computation).
```
The paper by Crevier [8] introduces the concept of an intermediate depot. This depot
is a station where vehicles refill their resources. The paper considers the combined
heuristic method based on tabu search algorithm and integrates programming algo-
rithms into solving subproblems. A project of networking and emerging optimization
has been dedicated to the study of the VRP [22]. The work of [30] represents a case
study of the VRP problem in a distribution company. The paper [28] concerns a two-
commodity flow formulation for the MDVRP considering a heterogeneous vehicle
fleet and maximum routing time.
In the current paper, the method of improving the encashment process in the
ATM network is proposed taking into account the real-life traffic conditions in
St.Petersburg and the neighboring districts.
In our study, we focus on the joint optimization problem, which includes MDLRP
and MDVRP models for defining the location of new depots and optimal circular
routes from the existing depots. The solution method of MDVRP has been developed
using two different evolutionary computation approaches and is illustrated through
geo-location of ATMs network on the map of St.Petersburg and the suburbs including
the valid delivery costs.
The paper is structured as follows. Section 2 represents the formulation of the
MDLRP and its adaptation to the network of ATMs. Section 3 describes method of
solving the MDLRP. Section 4 includes the formulation of the MDVRP for ATM
network. Section 5 focuses on two specific approaches of solving the MDLRP and
the MDVRP. Section 6 provides a numerical example. Section 7 concludes the paper
and outlines the future research prospects.
```
2 Multi-Depot Location Routing Problem (MDLRP)
```
The paper considers a problem in which a set of geographically dispersed ATMs must
be served with a fleet of money collector teams stationed in the several encashment
centers of the bank. This problem is a modification of the original vehicle routing
```
problem (VRP), proposed by Dantzig in 1959 [11], which has a simple interpretation:
```
Heuristic Optimization for Multi-Depot Vehicle … 205
a set of service vehicles need to visit all customers in a geographical region with
the minimum cost. In our study, we use the extensions of this basic formulation,
where, firstly, it is necessary to define the location of depots with minimal costs.
Secondly, the ATMs which are located in different clusters are serviced by a fleet of
homogeneous vehicles with the minimal costs. To define the optimization problem
of the encashment process with minimum operational costs, the MDLRP and the
MDVRP have been integrated. According to [6, 16], vehicle capacity and traveling
costs are minimized subject to vehicle capacity constraints as well as the depot
opening-closing is defined by MDLRP.
This formulation helps to define the optimal location of the encashment centers to
cover all the city’s central districts and remote suburbs. After obtaining the optimal
location of depots, the routes for collector teams can be found using the MDVRP
[8]. In this case, received depots are fixed and used as an input data to the MDVRP.
Solutions of Multi-Depots Vehicle Routing problem help to define feasible routes for
a set of homogeneous vehicles that make up a vehicle fleet. The routes are planned
according to the minimization of travel costs for each of the routes. Each route begins
and ends at the depot and contains a subset of stops for servicing ATMs. A solution
to this problem is feasible if the vehicle capacity on each route is not exceeded
and all stops are located within this route. The simplest formulation of the MDVRP
stipulates no lower and upper bounds for the length of each route. The MDVRP shall
satisfy the next conditions:
```
• The objective is to minimize the costs of each of the routes;
```
• A solution to this problem is feasible if the vehicle capacity on each route is not
```
exceeded and all stops are located within this route;
```
```
• Each route starts and ends at the same depot;
```
```
• Each ATM is serviced once;
```
```
• A fleet of vehicles consists of homogeneous cars with the same capacity;
```
• Each depot should have a sufficient amount of money so that the encashment
process remains uninterrupted.
```
A network of ATM contains two subsets: I is a set of encashment centers (depots)
```
belonging to the bank and J is a set of ATMs, where i ∈ I is the variable which
defines the index of encashment centers of the bank and j ∈ J is the index of each
ATM. The money collector teams, which are located in depots, have a set of vehicles
denoted as K, where k ∈ K is a route index, Qk is the capacity of vehicle k with the
given route k. F is a variable that shows the delivery costs for each money collector
team. A subset of ATMs, in its turn, can be divided into two parts: firstly, there is a
group of ATMs, which has been already serviced and secondly, there is a group of
ATMs, that needs to be serviced. The set of unserviced ATMs will be denoted as S.
Lets denote N as the number of vehicles and L as the number of ATMs. We set M
```
as the number of all encashment centers (depots). Variable Z (Z ⊂ M ) corresponds
```
with the number of depots which already exist and operate. The introduction of a
```
new encashment center leads to additional costs Oi, for each i, C = {cij} is a distance
```
```
matrix, the associated variable c∗ = {c∗ij} is calculated based on the distance cij and
```
shows the costs for each route. As in [14], it is assumed that variable dj corresponds
206 V. Platonova et al.
with the demand for cash cartridges for each ATM j, and Vi is the amount of cartridges
which are kept in the i-th encashment center of the bank. The artificial variable yi is
binary that has been introduced to show whether an encashment center i is closed or
```
not;
```
```
yi =
```
```
{ 1, if depot i is fictitious,
```
0, if depot i exists.
• xijk is a binary variable, which shows that vehicle k starts from depot i and then
moves to ATM j.
```
xijk =
```
```
{ 1, if i immediately precedes j on route k, i ∈ I , j ∈ J , k ∈ K;
```
0, otherwise.
• xjik is binary variable, which shows that a vehicle k finishes in the encashment
center i:
```
xjik =
```
```
{ 1, if j immediately precedes i on route k, i ∈ I , j ∈ J , k ∈ K;
```
0, otherwise.
• an artificial variable mik shows that each route k starts and finishes in the same
encashment center i.
```
mik : ∀i ∈ I , ∀k ∈ K, mik = xijk + xjik .
```
• xjlk is binary variable, which shows that vehicle k after servicing ATM j moves to
ATM l on the same route:
```
xjlk =
```
```
{ 1, if j immediately precedes l on route k, j, l ∈ S, k ∈ K;
```
0, otherwise.
• z ij is binary variable, which shows consolidation of ATM j and depot i:
z ij =
```
{ 1, if ATM j belongs to depot i;
```
0, otherwise.
Formally, a definition of a route based on the notations that were introduced before
```
(Fig. 2).
```
Definition 1 Route is a set of vertices xijk , xjlk , xjik , which show that each ATM
should be serviced only once and a team of money collectors starts and finishes in
the same encashment center of the bank [28]. Capacity of the vehicles and amount of
```
money in ATMs should satisfy to all restrictions for i-th department (see [8, 15, 32]).
```
Heuristic Optimization for Multi-Depot Vehicle … 207
Fig. 2 An example of route
from a depot to ATM:
i − j1 − j2 − i
Bank i
ATM
ATM
1
2
x i j 1 k x
j 2 j 1k
x i j 2 k
Based on these notations, the definition of the objective function and constraints
```
are:
```
min
```
( ∑
```
i∈I
∑
j∈J
∑
k∈K
cij xijk + ∑
j,l∈J
∑
k∈K
cjl xjlk + ∑
i∈I
∑
j∈J
∑
k∈K
cji xjik +
```
+F(∑
```
i∈I
∑
j∈J
∑
k∈K
xijk + ∑
j,l∈J
∑
k∈K
xjlk + ∑
i∈I
∑
j∈J
∑
k∈K
```
xjik ) + ∑
```
i∈I
Oi yi
```
)
```
```
;
```
```
(1)
```
together with constraints:
∑
k∈K
∑
i∈I
```
mik =
```
∑
i∈I
∑
k∈K
```
(xijk + xjik ) = 2, j ∈ J ; (2)
```
∑
i∈I
∑
j∈J
```
xijk = 1, k ∈ K; (3)
```
∑
j∈J ,l∈S
```
xjlk ≤ 1, S ⊆ J , k ∈ K; (4)
```
∑
j∈J
dj
⎛
⎝∑
i∈I
xijk +
∑
j,l∈J
xjlk
⎞
```
⎠ ≤ Qk , k ∈ K; (5)
```
∑
i∈S
∑
j∈S
```
xijk ≤ |S| − 1, ∀S ⊆ J, k ∈ K; (6)
```
∑
j,l∈J
xjlk −
∑
j,l∈J
```
xljk  = 0, k ∈ K; (7)
```
∑
j∈J
```
dj z ij ≤ Vi, i ∈ I ; (8)
```
− z ij +
∑
u∈I ∪J
```
(xiuk + xujk ) ≤ 1, i ∈ I, j ∈ J, k ∈ K; (9)
```
208 V. Platonova et al.
```
xijk ∈ {0, 1} , i ∈ I , j ∈ J , k ∈ K
```
```
z ij ∈ {0, 1} , i ∈ I , j ∈ J
```
```
yi ∈ {0, 1} , i ∈ I .
```
```
(10)
```
```
Expression (1) is the objective function which minimizes the total distance of
```
```
all given vehicles. Constraint (2) guarantees that the route starts and finishes in the
```
```
same encashment center. Constraints (3) and (4) show that to each ATM is assigned
```
```
to only one route; (5) is a capacity constraint for a given set of vehicles; (6) gives
```
```
the new sub-tour elimination constraint set; (7) represents that the route between
```
```
an ATM i and j is asymmetric; (8) is the capacity constraints for the given depots;
```
```
Constraint (9) demonstrates that each route should be served only once; Definitions
```
```
in (10) specify that each collector team can be assigned to a depot only if a route
```
from the depot to an ATM is available.
3 Solving Methods of the Multi-Depot Location Routing
```
Problem (MDLRP)
```
According to the previous discussions, in a large city, the optimal location of depots
decreases the servicing costs of encashment process of ATM network significantly.
At the first stage of our framework, the optimal place to establish new encashment
centers is defined or the subnetwork which is operated by the corresponding depot
should be reorganized. The aforementioned MDLRP considers several encashment
centers, where some centers already exist and some centers are virtual. The solution
of the MDLRP can be found according to the next iterative process.
1. Firstly, we form a cluster which contains an encashment center and neighbor-
ing ATMs through comparing the distance between them. As a result, several
subnetworks are received, each of them includes one depot and a set of ATMs.
For each cluster we can find optimal or heuristic optimal routes for encashment
teams. For example, clustering for two depots A and B follows the next rules:
```
• if D(j, A) < D(j, B), then j-th ATM belongs to depot A;
```
```
• if D(j, A) > D(j, B), then j-th ATM belongs to depot B;
```
```
• if D(j, A) = D(j, B), then j-th ATM belongs to depot A or B,
```
```
where D(j, A), D(j, B) are distances between ATM j and depot A and B, corre-
```
spondingly. If numbers of depots M ≥ 2, then clustering follows the same rule
[12]. Hence we divide a large problem into several simple subproblems accord-
ing to the number of depots. This procedure enables reducing the total number
of routes, which satisfy the capacity of bank’s encashment centers and mini-
mize the costs of servicing. After the clustering is completed, we focus on two
```
subproblems: optimization of encashment routes of depot A and B separately.
```
Heuristic Optimization for Multi-Depot Vehicle … 209
Fig. 3 Feasible solution.
Here empty dots are depots
and black dots are ATMs
On the first stage, we use a method called Super-ATMs, which was proposed in
[26], to reduce a number of variables. The Super-ATMs algorithm contains the
following steps:
• It is supposed that there are several presumed places to open a new encashment
```
center. Then we find a feasible solution of the original system (1)–(10) by any
```
heuristic algorithm, for example, by Clarke and Wright [7], taking into account
```
all the possible locations of the encashment centers;
```
```
• exclude all encashment centers from the constructed routes;
```
```
• collect ATMs of each route into Super-ATM;
```
```
• construct new routes, using Super-ATMs and encashment centers;
```
• for each constructed route Super-ATM is divided into new sub-routes thus we
obtain a new solution.
We illustrate the stages of Super-ATMs algorithm in Figs. 3, 4, 5, 6 and 7.
2. On the second stage, the set feasible routes that were obtained at the stage 1
are used as an initial solution, where each ATM is serviced by a certain vehicle.
Hence, the number of such routes coincide to the number of ATMs. To construct
a feasible solution, for each of the subproblems, the Clarke–Wright method is
used.
Below the mathematical formulation of the MDLRP with the concept of Super-
ATMs is presented:
min
```
(∑
```
i∈I
Oi yi +
∑
i∈I
∑
h∈H
Cih Xih
```
)
```
```
(11)
```
∑
i∈I
```
Xih = 1, h ∈ H ; (12)
```
∑
h∈H
```
Dh Xih ≤ Vi yi, i ∈ I ; (13)
```
210 V. Platonova et al.
Fig. 4 Excluding
encashment centers from
constructed routes
Fig. 5 Recombination of a
set of ATM of each route
into Super-ATMs. Stars are
Super-ATMs, empty dots are
depots
Fig. 6 Constructing of new
routes between Super-ATMs
and initial depots
Heuristic Optimization for Multi-Depot Vehicle … 211
Fig. 7 Disconnection of
Super-ATMs and
constructing new sub-routes
```
Xih ∈ {0, 1}, i ∈ I , h ∈ H , (14)
```
```
yi ∈ {0, 1}, i ∈ I . (15)
```
Here variable Dh is the aggregated demand of ATMs, which corresponds to Super-
```
ATMs denoted as h, H is a set of Super-ATMs; the binary variable Xih represents
```
```
whether Super-ATM h is grouped with encashment center i;
```
```
Xih =
```
```
{ 1, if encashment center i is grouped with Super-ATMs h, i ∈ I , h ∈ H ;
```
0, otherwise.
Additional encashment center is grouped with the neighboring Super-ATM
through comparing the distances between them. The distance from the encashment
```
center to some Super-ATMs is approximately equal tô h ( herê h is the average
```
sum of distances from this encashment center to each ATM which is included into
```
Super-ATMs). Value Oh is the additional costs generated by the distancê h.
```
```
In contrast to the original MDLRP in (1)–(10), in considered modification, the
```
```
number of constraints is significantly reduced since the constraints (5), (6), (7), and (9)
```
are not used. Whereas they do not impact on the solution of the problem, constraints
```
(2), (3), and (4) are replaced by (12), and (9) is replaced by (13). The replacement
```
guarantees that Super-ATMs can be combined only with the open encashment centers,
which have sufficient amount cash cartridges. After using the Super-ATMs method,
we received the optimal locations of encashment, thereafter the original problem is
transformed to the MDVRP.
212 V. Platonova et al.
```
4 Multi-Depot Vehicle Routing Problem (MDVRP)
```
After obtaining the optimal location of depots, we construct the routes for money
```
collector teams in the second part of the initial framework. Let G = (V , E) be an
```
undirected complete graph, where V is a vertex set and E is an edge set. The vertex
set V is partitioned into a subset of encashments centers I = 1, . . . , m and a subset of
ATMs J = 1, . . . , n. Each ATM j ∈ J has a nonnegative demand dj and a nonnegative
service time δj. A service time δi = 0, corresponds to each depot i ∈ I , shows that
not all depots are necessarily used in the MDVRP. A set of k identical vehicles,
```
each with capacity Q, is available in each depot i. Each edge (i, j) ∈ E is associated
```
with nonnegative traveling costs cij . The objective of the MDVRP is to define the
routes which satisfy the demand of the ATMs with the minimal servicing costs. The
MDVRP is subject to the following constraints [6, 28, 34]:
```
• Each route should start and finish at the same depot;
```
```
• Each ATM should be visited exactly once on one route;
```
```
• The total demand of each route should not exceed the vehicle capacity Q;
```
• The number of routes from each depot should not exceed the value of k.
• The total distance of each route should not exceed a given value D.
```
Mathematical formulation of the MDVRP follows the model from (1)–(10); how-
```
ever, we use a new objective function:
min
```
( ∑
```
i∈I
∑
j∈J
∑
k∈K
cij xijk + ∑
j,l∈J
∑
k∈K
cjl xjlk + ∑
i∈I
∑
j∈J
∑
k∈K
cji xjik +
```
+F(∑
```
i∈I
∑
j∈J
∑
k∈K
xijk + ∑
j,l∈J
∑
k∈K
xjlk + ∑
i∈I
∑
j∈J
∑
k∈K
```
xjik )
```
```
)
```
.
```
(16)
```
5 Solution Methods for MDVRP
```
Evolutionary Algorithms (EAs) are population-based stochastic methods that are
```
inspired by Darwin’s Theory of Evolution [13]. EAs are most often applied for
optimization, since EAs have minimal demand for the problem in hand, and EAs
have shown their good performance in solving many hard problems. Different types
```
of EAs have been developed and Genetic Algorithms (GAs) are one of the historical
```
main branches of EAs. Genetic Algorithms are in all application domains traditionally
use to solve different modification of VRP [4, 17]. The usage of EAs has become
increasingly popular in the last few years and performs good results in optimization of
VRP and its modification. In the previous studies [19, 23, 24, 32] various algorithms
were developed to find the optimal or good solutions, depending on the dimension of
the problem. Originally, GAs used binary numbers for coding variables. Later also
other values such as integers and real numbers have been used as variable values.
Heuristic Optimization for Multi-Depot Vehicle … 213
In GA, a random population of individuals is first created. Then this population
undergoes changes and selection based on goodness of individuals that guides the
evolution. Two main genetic operators with a GA are crossover and mutation. In
crossover, two individuals are mixed to obtain two new individuals. In mutation, one
individual undergo a little change.
```
GAs as other EAs did not guarantee finding the optimal solution (that would be
```
```
quite impossible in general case), but they are often able to find good solutions.
```
A disadvantage of EAs is that they need lots of calculations compared to some
problem-specific methods. On the other hand, EAs are easy to parallelize thus parallel
computation can be applied for calculations.
5.1 Genetic Algorithm 1
In the current section, the Clarke and Wright method is used to find a feasible solution
for the problem and then the modified GA is applied to improve the received feasible
solution. However, despite the considered case study has low problem size, we turn
to genetic algorithm to improve a feasible solution. This approach allows scaling our
method to the problems with a larger dimension. Thus, we use GA as a basic method
of solving the MDVRP for each encashment center. GA is a heuristic method, which
provides more effective solutions than some other classical optimization methods,
such as branch and bound, or the simulated annealing. The algorithm is based on
the natural selection and adaptive mechanism. In Fig. 8, we show the main steps of
computation [13].
Usually, genetic algorithm includes several required stages: representation of the
problem, definition of the initial population, selection of parent individuals for future
evaluation, applying of crossover operator, mutation procedure and finally the sur-
```
vival selection of the best offsprings (Figs. 9 and 10).
```
```
Definition 2 Chromosome (sometimes it is called a genome) is a set of parameters
```
which defines the proposed solution to the problem that the GA1 is trying to solve.
The chromosome is often represented as a simple string.
Definition 3 Gene is a part of chromosome. A gene contains a part of solution such
as each variable xijk shows if ATM j is included in a route of vehicle k or not.
Definition 4 Crossover operator is a genetic operator that combines two chromo-
```
somes (parents) to produce a new chromosome (children) with crossover with some
```
probability
In the current chapter, we use a modified single-point crossover which satisfies
following conditions [5]:
• Randomly choose two chromosomes, which describe routes starting from any
```
depot;
```
214 V. Platonova et al.
Fig. 8 Sheme of evolutionary algorithm
Fig. 9 An example of chromosome. Route A − 1 − 2 − A represented as a chromosome, where
```
variables of genes are x A11 = 1; x121 = 1; x2A1 = 1
```
Fig. 10 An example of chromosome. Route A − 1 − A represented as a chromosome, where gene-
```
variables are x A11 = 1; x121 = 1
```
```
• A single-point, called a breaking point, is randomly defined in each chromosome;
```
• Each chromosome is divided into two parts in the breaking point and two chro-
mosomes exchange their parts before or after breaking point. Hence as a result,
```
we receive two new chromosomes and each depot gets two new routes;
```
```
• Calculate new value of the objective function;
```
Definition 5 Mutation operator helps to avoid the appearance of a uniform popula-
tion. This operator randomly changes or alters one or more gene values at randomly
selected locations in a chromosome with a mutation probability.
Heuristic Optimization for Multi-Depot Vehicle … 215
```
We randomly choose any variable (gen) xijk of chromosome and change its value
```
to any other possible value, i.e., if we have 0 then it becomes 1. As an example,
we consider a chromosome which consists of six genes: 101101. Mutation of this
chromosome can be 001101 or 100101, if only one gene is changed, if two genes
are altered then 011101 or 101110.
Definition 6 Selection operator guides evolution to right direction by promoting
better solutions.
5.2 Genetic Algorithm 2
Another GA approach for the MDVRP is to consider the whole routing problem as
one big traveling salesman problem with an exception that there are multiple depots
that can serve as starting and ending points for sub-routes. Since in traveling salesman
problem a solution is the permutation of different locations, permutation of locations
indexes is a natural way of coding when GA is applied for the MDVRP. Several
different ways of performing crossover and mutation with permutation coding have
been developed especially targeted for traveling salesman problem [4, 13, 17].
6 Numerical Simulations
In this section, the results of application of clustering method and two genetic algo-
rithms GA1 and GA2 are presented, based on the ATM subnetwork of a bank from
St.Petersburg. We consider a subset of ATMs, which contains 99 ATMs, located in
the city center and the remote suburbs. Special cartographic sources such as QGIS
```
2.2; Topplan, [33]; Google maps; ArcGis [1], the Google Distance Matrix API are
```
used to illustrate the results of simulations. We form a distance matrix 109 × 109,
which includes 10 depots and 99 ATMs. All distances correspond to real-life loca-
tions in the city’s central districts and remote suburbs of St.Petersburg. The results
of computation are presented in Appendix 2. The received routes of the money col-
lector teams are depicted on the city-map, base on the coordinates for 20 ATMs and
4 depots. The matrix of distances is presented in Appendix 1. To simplify the repre-
sentation of the computation results, we additionally suppose that the bank receives
a claim for servicing of 20 ATMs. This claim includes four encashment centers with
money collector teams. The notations and addresses of depots are
```
• open depot: A(Vereiskaya st. 16, A), B(Bukharestskaya st. 23);
```
```
• fictitious depots: C(Oleca Dundich St. 34), D(Marata st. 65).
```
The list of addresses of ATMs included in the claim for servicing is presented in
Appendix 1.
216 V. Platonova et al.
Firstly, a solution for this subnetwork of 20 × 20 ATMs is found by using the
method of Super-ATMs. At the first stage, the optimal location of encashment cen-
```
ters is obtained, such as servicing costs are minimized and constraints (2)–(10) are
```
satisfied. As in [14], we assume that every ATM contains di = 4 cash cartridges and
capacity of every vehicle is Q = 16. Distances between depots and ATMs are pre-
sented in Fig. 14. In the example, we take into account the cost of technical and human
resources separately, because its allocation can affect on the bank’s decision about
the effectiveness of the used optimization approach. To calculate the servicing costs
we assess costs per 1 km of route and one working day of collector team. Following
the statistical data we use following values: cost of gasoline is about 30 rubles/liter,
every vehicle consumes 1 l of gasoline per 10 km, hence the costs of 1 km is 3 rubles.
In dynamics, fuel costs impact on the total cost of the encashment process if a number
of serviced ATMs will increase. Each money collector team includes driver, security
guard, and a cashier. Average salaries for these positions in St. Petersburg are 20
000 rubles/month, 27 000 rubles/month, and 30 000 rubles/month, respectively. We
```
assume that the work schedule of collection team is 2/2 (two working day/two days
```
```
of rest) then the cost of one working day is about 5500 rubles. The solution of the
```
framework consists of two stages:
```
Stages:
```
```
(1) First, we combine encashment centers and its neighboring ATMs taking into
```
account the distance matrix:
• depot A: 15, 19, 20.
• depot B: 3, 4, 6, 7, 9, 10, 13, 14, 18.
• depot C: 1, 2, 8, 12, 16, 17.
• depot D: 5, 11.
Following the Clarke–Write algorithm, we find a feasible solution for 4 encash-
```
ment centers: A − 15 − 19 − 20 − A; B − 18 − 4 − 9 − 3 − B; B − 13 − 14 − 6 −
```
```
B; B − 7 − 10 − B; C − 17 − 16 − 8 − 2 − C; C − 1 − 12 − C; D − 5 − 11 − D.
```
```
(2) On the second stage, the Super-ATMs method is applied, according to it we
```
exclude encashment centers from the routes and merge ATMs into seven Super-
```
ATMs:
```
```
• a = 15–19–20; b = 18–4–9–3; c = 13–14–6;
```
```
• d = 7–10; e = 17–16–8–2; f = 1–12; j = 5–11.
```
Received solution shows that depot D is connected with two ATMs, but it is closer
to depot A than ATMs 5 and 11 should be connected with the depot A. Depot B is
connected with ATMs 18, 4, 9, 3, 13, 14, 6, 7, 10. Depot C is grouped with ATMs
17, 16, 8, 2, 1, 12. Thus for the considered subset of ATMs, the opening of depots B
and C is the optimal solution.
Hence, the solution of MDLRP problem is the following: A − 15 − 19 − 20 −
```
A − 5 − 11 − A; B − 18 − 4 − 9 − 3 − B − 13 − 14 − 6 − B − 7 − 10 − B; C −
```
17 − 16 − 8 − 2 − C − 1 − 12 − C.
Further, GA1 is applied to improve the feasible solution. Then the distances from
depots to Super-ATMs are defined as the average of the sum of distances from each
Heuristic Optimization for Multi-Depot Vehicle … 217
Table 1 The average distance between depot and Super-ATMs
Variable Distance Variable Distance Variable Distance Variable Distance
X Aa 5.76 X Ab 11.675 X Ac 8.3 X Ad 6.7
X Ba 11.1 X Bb 10.05 X Bc 5.73 X Bd 4.55
X Ca 15.9 X Cb 11.225 X Cc 8.93 X Cd 9.2
X Da 6.2 X Db 11.775 X Dc 8.5 X Dd 6.5
Table 2 The average distance between depot and Super-ATMs
Variable Distance Variable Distance Variable Distance
X Ae 5.76 X Af 11.675 X Aj 8.3
X Be 11.1 X Bf 10.05 X Bj 5.73
X Ce 15.9 X Cf 11.225 X Cj 8.93
X De 6.2 X Df 11.775 X Dj 8.5
Table 3 The shortest distances between depots and Super-ATMs
Super-ATMs Variable Minimum distance
a X Aa 5.76
b X Bb 10.05
c X Bc 5.75
d X Bd 4.55
e X Ce 9.95
f X Cf 4.4
j X Dj 2.75
ATM to Super-ATMs. In Tables 1, 2 variables XAa–XDj represent the average distance
between depot and Super-ATMs, for example, XAa is the distance between depot A
and Super-ATMs a.
Thus, the number of constraints is reduced, which simplifies solving of the prob-
```
lem and finding the shortest distances between a depot and Super-ATMs (Table 3).
```
```
GA1 gives the next solution: A − 5 − 11 − 15 − 19 − A; B − 4 − 16 − 17 −
```
```
18 − B − 10 − 20 − 13 − 6 − B, B − 14 − 3 − 9 − 8 − B; C − 12 − 1 − 2 − 8 −
```
16 − 17 − C, where total length is 114.7 km and costs are 17 000 rubles. Figure
11 represents the routes of money collector teams from depots A on the map of the
streets.
Applying the second GA2, we obtain a slightly different solution: B − 4 − 6 −
17 − 18 − B − 10 − 20 − 13 − 6 − B − 14 − 3 − 8 − 9 − B, C − 12 − 1 − 2 −
8 − 16 − 17 − C, D − 5 − 11 − 15 − 19 − D, where total length of encashment
routes is 113.5 km and costs are 16 800 rubles. Figures 11, 12, 13, 16, 17, 18, 19 and
20 show an influence of the transportation system of St.Petersburgs on the solutions.
218 V. Platonova et al.
Fig. 11 Routes for depot A. A − 5 − 11 − 15 − 19 − A, route length is 28.4 km
Fig. 12 Routes for depot B. B − 4 − 16 − 17 − 18 − B, B − 10 − 20 − 13 − 6 − B, B − 14 −
3 − 9 − 8 − B, route length is 67.3 km
Fig. 13 Routes for depot C. C − 12 − 1 − 2 − 8 − 16 − 17 − C, route length is 19 km
Heuristic Optimization for Multi-Depot Vehicle … 219
Figure 11 represents routes from depot A. Figures 16, 17, 18 and 19 in Appendix 4
represent the routes which are similar for the solutions of GA1 and GA2. Figure 20
shows the routes correspond to the depot D.
7 Conclusion and Discussion
The paper represents the two-stage encashment problem solution consisting of adap-
tation of Multi-Depot Location Routing Problem for defining the optimal location
of the encashment at the first stage and application of Multi-Depot Vehicle Routing
Problem for the construction of routes though ATM subnetworks at the second stage.
We consider the modified routing model which incorporates the problem of opti-
```
mal location of the encashment centers (depots) and the multi-depot vehicle routing
```
problem. This approach allows receiving a solution of routing problem with large
number of serviced ATMs by clustering them into different depots. As it was pre-
sented in the previous research studies, the scope of the problem leads to necessity
of application of different numerical methods to receive a satisfactory solution. To
solve the entire problem, we have used the Super-ATMs method to define the location
of encashment centers and evolutionary computation to calculate the better routes in
serviced areas of each encashment center. Here we use and compare two different
genetic algorithms to receive routes for the network of 99 ATMs and 10 depots. The
results show an insignificant difference between the results of GA1 and GA2 with a
smaller problem instance, but with the bigger instance, GA2 has given a significantly
better solution. The distance received by GA1 exceeds the distance obtained by GA2
by 18% in case of a large network of ATMs.
The recent studies [9, 25, 29] concerning the solution of this routing optimization
problem have shown that game theoretical approach is also applicable in construction
of the optimal distribution of nodes between depots as well as optimal routes between
nodes in each cluster. Hereby, the problem can be solved using two-stage method:
the game between encashment centers for designing the own subnetworks of ATMs
and the routing game inside each cluster for defining the optimal traffic flow to
encashment teams. At the first stage, we can formulate a game of grand players
```
(depots) pursuing their aims. The aim of a player is to enlarge his/her subnetwork by
```
adding new ATMs for increasing profit from ATMs. This triggers the competition
for the items from the total set of ATMs between the encashment centers. As it was
mentioned previously, in such a big city as St.Petersburg the distance between ATMs
and encashment centers is large. Consequently, the conjunction of each new ATM
increases the maintenance costs of subnetwork, since costs of service depend on the
distances between nodes in the network.
Therefore, each encashment center shall find a compromised solution between
connecting the maximum number of ATMs into the network and keeping the minimal
```
servicing costs. Furthermore, the strategy of a player (an encashment center) can be
```
defined as a selection of ATMs which can be connected to the network with the
minimal servicing costs. In other words, we can consider an iteration process where
220 V. Platonova et al.
on each step player estimates the distance between the existing subnetwork and the
nearest neighbors and makes a decision on a new unit.
Minimization of the total costs for maintenance of the subnetwork leads to the
restriction of the maximum number of nodes in each subnetwork. Thus, we can define
the payoff of the players as the function which depends on the difference between
profit and the costs of servicing of ATMs subnetwork.
At the second stage, we can formulate a routing game between money collector
teams inside each of the designed subnetworks. In this game, the set of players
consists of money collector teams. Each team starts and finishes its route in the
corresponding depot and plans a circle route with the minimal cost. We can define a
strategy set of each player as a set of routes between their initial and final locations.
As optimality principles in the game between depots and routing games inside
subnetworks we can use the Nash or Wardrop equilibriums, respectively. Equilibrium
concept provides us with the possibility of taking into account individual preferences
of the encashment centers. Moreover, the routing game can imply the detailed analysis
of two additional subcases: in the first case the routes are planned in accordance with
the principle of minimizing the route costs, while in the second, players take into
account the cost of all routes in the subnetwork which results in obtaining the state
of social optimum. According to this, further research studies can discuss social
and individual preferences of the grand players as well as estimation of different
strategies of the route planning of money collector teams.
Additionally, the game of competition between depots will also be discussed
from the cooperative point of view by considering the tendency of consolidation
between different branch offices of the banks. This new formulation of the problem
allows us to compare different approaches and their application to large dimensional
problem. As far as the considered complex optimization problem covers not only an
encashment process but also includes an ensemble of various logistic tasks, therefore
various techniques can be applied to solve the VRP and its different modifications
such as CVRP, MDLRP, and MDVRP [22, 28].
Another approach which can be used to solve the proposed complex optimization
```
problem of encashment is the dynamic programming (DP). Previous research studies
```
have offered the possibility of application of this approach to the VRP and the CVRP,
for example, in [18], the extension of the DP algorithm was introduced, where authors
notice the difficulties in applying the methods to real-life problems. In [20], the
MDVRP as a deterministic dynamic programming with finite state and action space
has been considered. In the current framework, the DP algorithm can be used at
the second stage of the optimization process as a method of constructing the giant
tour inside the clusters of ATMs belonging to one depot. However, according to
[18], the DP algorithm does not run in practically acceptable computation times
for problem instances of realistic sizes. The application of the method is restricted
by the maximum number of states and the number of state expansions of a single
state. Despite this, the application of the DP algorithm to our problem provides the
results which can be the subject for further research devoted to the comparison of
the computational complexity of the methods discussed.
Heuristic Optimization for Multi-Depot Vehicle … 221
Acknowledgments We are really grateful to Svetlana Medvedeva for many helpful suggestions
and constructive comments. The third author wants to acknowledge the support of the Academy of
Finland.
Appendix 1
```
A list of ATMs included in the claim of servicing: Vitebskiy av., 53/4; Zvezdnaya
```
```
st., 6; Leninskiy av., 129; Novatorov blvd., 11/2; Nevskiy av, 49; Gagarina av., 27;
```
```
Kosmonavtov av., 28; Krasnoputilovskaya st., 121; Leninskiy av, 151; Koli Tomchaka
```
```
st., 27; Dumskaya st., 4; Bukharestskaya st, 89; Basseynaya st., 17; Moskovskiy av.,
```
```
200; Novosmolenskaya emb., 1/3; Veteranov av., 43; Veteranov av., 89; Leni Golikova
```
```
st., 3; Izmaylovskiy av., 4; Moskovskiy av., 133 (Figs. 14, 15).
```
Appendix 2
In the current case study we apply both modification of genetic algorithms GA1 and
GA 2 respectively for the problem of 109 × 109, where we have 10 depots and 99
ATMs. By using GA1 we obtain
```
• A − 11 − 35 − 64 − A, A − 16 − 31 − 4 − A, length is 78.467 km;
```
Fig. 14 Matrix of distances C for 30 ATM and 4 encashment center
222 V. Platonova et al.
Fig. 15 Matrix of distances C for 30 ATM and 4 encashment center
• B − 42 − 70 − 80 − B, B − 46 − 12 − 14 − 2 − B, B − 56 − 62 − 21 − 37 − B,
```
B − 60 − 18 − 36 − 71 − B, length is 86.149 km;
```
```
• C − 42 − 85 − 13 − 61 − C, C − 81 − 44 − C, length is 39.988 km;
```
• D − 22 − 24 − 47 − D, D − 39 − 38 − 6 − D, D − 75 − 72 − 17 − 10 − D,
```
D − 82 − 5 − 89 − 66 − D, length is 87.649 km;
```
• E − 8 − 15 − 25 − 73 − E, E − 83 − 84 − 74 − 79 − E, E − 86 − 59−87−E,
```
length is 65.516 km;
```
```
• F − 3 − 41 − 48 − F, F − 54 − 69 − 58 − 88 − F, length is 42.953 km;
```
```
• G − 7 − 77 − 20 − G, G − 63 − 26 − G, length is 39.801 km;
```
```
• H − 52 − 76 − 32 − 68 − H , length is 27.390 km;
```
• I − 27 − 57 − 55 − 65 − I , I − 49 − 40 − 19 − 9 − I , I − 51 − 23 − 45 −
```
34 − I , I − 78 − I , length is 112.126 km;
```
• J − 28 − 30 − 50 − 1 − J , J − 53 − 33 − 29 − 67 − J , length is 47.477 km.
Total distance is 627.516 km and costs are 56883 rubles.
By GA2 approach we receive the next solution:
```
• A − 72 − 1 − 38 − 7 − A, A − 19 − 56 − A; A − 77 − 20 − 84 − 29 − A;
```
• B − 59 − 10 − 40 − 4 − B
```
• C − 85 − 36 − 17 − 41 − C;
```
```
• G − 8 − 21 − 14 − 46 − G;
```
```
• E − 74 − 26 − 71 − 35 − E;
```
```
• D − 18 − 30 − D; D − 87 − 78 − 88 − 6 − D;
```
Heuristic Optimization for Multi-Depot Vehicle … 223
```
• D − 58 − 89 − 49 − 13 − D;
```
```
• D − 44 − 76 − 5 − 50 − D, D − 23 − 63 − 82 − 73 − D;
```
```
• E − 42 − 34 − 65 − E;
```
```
• E − 9 − 53 − 61 − 54 − E; E − 64 − 69 − 37 − 51 − E,
```
```
• G − 60 − 63 − 57 − 75 − G;
```
```
• H − 43 − 45 − 67 − 33 − H ;
```
```
• H − 16 − H , H − 66 − 81 − 28 − 3 − H , H − 22 − 12 − 15 − 52 − H ;
```
```
• H − 27 − 90 − 31 − 68 − H ;
```
```
• H − 32 − 24 − H , H − 39 − 2 − 80 − 83 − H ;
```
• H − 48 − 25 − 47 − 11 − H .
Total distance is 452.119 km and costs are 39857 rubles.
From the computation we can see that the total distance on the routes for money
collector teams received by GA2 are shorter that total distance received by GA1 for
18%.
Appendix 3
The savings algorithm is a heuristic algorithm, and therefore it does not provide an
optimal solution to the problem with certainty. However it often gives a relatively
good solution. The basic savings concept depicts the cost savings obtained by joining
small routes into more large route. Consider the depot D and n demand points. Sup-
pose that initially the solution to the VRP consists of using n vehicles and dispatching
one vehicle to each one of the n demand points. The total tour length of this solution
is, 2
n∑
```
i=1
```
```
d (D, i). If now we use a single vehicle to serve two points, say i and j, on a
```
single trip, the total distance traveled is reduced by the amount
```
Sij = ci0 + c0j − cij .
```
```
Stage 1. Calculate the savings Sij = d (D, i) + d (D, j) − d (i, j) for every pair (i, j)
```
of demand points.
Stage 2. Rank the savings Sij and list them in descending order of magnitude.
This creates the “savings list.” Process the savings list beginning with the
```
topmost entry in the list (the largest Sij ).
```
```
Stage 3. For the savings Sij under consideration, include link (i, j) in a route if no
```
```
route constraints will be violated through the inclusion of (i, j) in a route,
```
and if:
224 V. Platonova et al.
a. Either, neither i nor j have already been assigned to a route, in which
case a new route is initiated including both i and j.
b. Or, exactly one of the two points (i or j) has already been included
```
in an existing route and that point is not interior to that route (a point
```
is interior to a route if it is not adjacent to the depot D in the order
```
of traversal of points), in which case the link (i, j) is added to that
```
same route.
c. Or, both i and j have already been included in two different existing
routes and neither point is interior to its route, in which case the two
routes are merged.
Stage 4. If the savings list Sij has not been exhausted, return to Stage 3, processing
```
the next entry in the list; otherwise, stop: the solution to the VRP consists
```
```
of the routes created during Stage 3. (Any points that have not been
```
assigned to a route during Stage 3 must each be served by a vehicle route
```
that begins at the depot D visits the unassigned point and returns to D.)
```
Appendix 4
See Figs. 16, 17, 18, 19, 20.
Fig. 16 Routes for depot B. B − 4 − 16 − 17 − 18 − B. Length of route is 31.4 km
Heuristic Optimization for Multi-Depot Vehicle … 225
Fig. 17 Routes for depot B. B − 10 − 20 − 13 − 6 − B. Length of route is 16 km
Fig. 18 Routes for depot B. B − 14 − 3 − 9 − 8 − B. Length of route is 19.9 km
226 V. Platonova et al.
Fig. 19 Routes for depot C. C − 12 − 1 − 7 − 2 − C. Length of route is 19 km
Fig. 20 Routes for depot D. D − 5 − 11 − 15 − 19 − D. Route length is 27.2 km
Heuristic Optimization for Multi-Depot Vehicle … 227
References
1. ArcGis Resource Center.: Working with spatial references. ArcObjects Help for .NET devel-
opers.
2. Arnold, F., Gendreau, M., Sorensen, K.: Efficiently solving very large-scale routing problems.
```
Comp. & Oper. Res. 107, 32–42 (2019)
```
3. Arora, S.: Approximation schemes for NP-hard geometric optimization problems: a survey.
```
Math. Prog. 97, 1, 43–69 (2003)
```
4. Baker, B. M., Ayechew, M. A.: A genetic algorithm for the vehicle routing problem. Comp. &
```
Oper. Res. 30, 5, 787–800 (2003)
```
5. Bentley, P. J. and Wakefield, J. P. Hierarchical Crossover in Genetic Algorithms. In: Proceedings
```
of the 1st On-line Workshop on Soft Computing (WSC1), Nagoya University, Japan (1996)
```
6. Carlsson, J. , Dongdong, G., Subramaniam, A., Wu, A., Yek, Y.: Solving Min-Max Multi-
```
Depot Vehicle Routing Problem. Fields Institute Communications, 55. (2009)
```
7. Clarke, G., Wright, J.: Scheduling of vehicles from a central depot to a number of delivery
```
points. Oper. Res. 12, 4, 568–581 (1964)
```
8. Crevier, B., Cordeau, J., Laporte, G.: The multi–depot vehicle routing problem with inter–depot
```
routes. E. J. of Oper. Res. 176, 756 –773 (2007)
```
9. Chkhartishvili, A. G., Gubanov, D. A., Novikov, D. A.: Social Networks: Models of Information
```
Influence, Control and Confrontation. Springer, Heidelberg (2019)
```
10. Christofides, N., Mingozzi, A., Toth, P.: Exact Algorithms for the Vehicle Routing Problem,
```
Based on Spanning Tree and Shortest Path Relaxations. Math. Prog. 20, 255–282 (1981)
```
11. Dantzig G.B., Ramser, J.H.: The truck dispatching problem. Manag. Sci. 6, 60, Vol. 80–91
```
(1959)
```
12. Dondo, R., Cerda, J.: A cluster–based optimization approach for the multi-depot heterogeneous
```
fleet vehicle routing problem with time windows. E. J. of Oper. Res. 176, 1478–1507 (2007)
```
13. Eiben, A. E., Smith, J. E.: Introduction to Evolutionary Computing. Springer (2003)
14. Gubar, E. A., Merzlyakova, J. D., Zubareva, M. L.: Cash flow optimization in ATMs network
```
model. Contrib. to Game Theory and Manag. 4, 213–223 (2011)
```
15. Hall, R. W.: Handbook of Transportation Science. Springer, 741 (2003)
16. Laporte, G., Nobert, Y., Taillefer, S.: Solving a family of multi-depot vehicle routing and
```
location-routing problems. Transp. Sci. 22, 161–172 (1988).
```
17. Hoa, W. Hob, G. T. S., Jib, P., Laub, H. C. W.: A hybrid genetic algorithm for the multi-depot
```
vehicle routing problem. Engin. App. of Artificial Intell. 21, 4, 548–557 (2008)
```
18. Kok A.L., Meyer C. M., Kopfer H., Schutten J. M. J.: Dynamic Programming Algorithm for
the Vehicle Routing Problem with Time Windows and EC Social Legislation. Transp. Sc. 44,
```
No. 4. 429–553 (2010).
```
19. Larranaga, P., Kuijpers, C. M. H., Murga, R. H., Inza, I., Dizdarevic, S.: Genetic Algorithms
for the Travelling Salesman Problem: A Review of Representations and Operators. Art. Intell.
```
Rev. 13, 2, 129–170 (1999)
```
20. Lee, C.-G., Epelman M., White Ch. C. and Bozer Ya. A.: A shortest path approach to the
```
multiple-vehicle routing problem with split pick-ups. 40, 4, 265–284 (2006)
```
21. Lysgaard, J., Letchford, A., Eglese, R. A New Branch-and-Cut Algorithm for the Capacitated
```
Vehicle Routing Problem. Math. Program., Ser. A 100, 423–445 (2004)
```
22. Vehicle Routing Problem | NEO Research Group. 2013. http://neo.lcc.uma.es/vrp/
23. Nagy G., Salhi S.: Heuristic algorithms for single and multiple depot vehicle routing problems
```
with pickups and deliveries. European Journal of Operational Research. 162, 126–141 (2005)
```
24. Nallusamy, R., Duraiswamy, K., Dhanalaksmi, R., Parthiban, P.: Optimization of Multiple
Vehicle Routing Problems using approximation algorithms. International Journal of Engineer-
```
ing Science and Technology. 1(3). 129–135 (2009)
```
25. Paltseva D. A., Parfyonov A. P.: Atomic routing game with capacity constraints, Mat. Teor. Igr
```
Pril., 10, 1, 65–82, (2018).
```
228 V. Platonova et al.
26. Prins, C., Prodhon, C., Ruiz, A., Soriano, P., Calvo, R. W.: Solving the Capacitated Location-
Routing Problem by a Cooperative Lagrangean Relaxation-Granular Tabu Search Heuristic.
```
Transp. Sc., 41, 4, 470–483 (2007)
```
27. Platonova V., Gubar E.: Multi-depots location routing problem in ATM’s network. In: The XLIV
```
annual international conference Control Processes and Stability (CPS’13). Saint-Petersburg,
```
```
644–650 (2013)
```
28. Ramos T. R. P., Gomes M.I. and Barbosa Póvoa A.P.: Multi-depot vehicle routing problem: a
comparative study of alternative formulations. Int. J. of Log. Res. and App., Taylor & Francis
```
0, pp. 1–18, (2019) https://doi.org/10.1080/13675567.2019.1630374
```
29. Roughgarden, T.: Routing Games. In N. Nisan, T. Roughgarden, E. Tardos, & V. Vazirani
```
(Eds.), Algorithmic Game Theory. Cambridge: Cambridge University Press. 461–486 (2007)
```
```
doi:https://doi.org/10.1017/CBO9780511800481.020
```
30. Santana R.M.: Heuristic algorithms and Variants of the Vehicle Routing Problem for a Distri-
bution Company: A Case Study. In: The European Master’s Program in Computational Logic
```
Master’s Thesis. Facultade de Ciencias e tecnologis Universidade Nova de Lisboa (2016)
```
31. Shchegryaev A., Zakharov V.: Multi-period cooperative vehicle routing games. Contrib. to
```
Game Theory and Management. 7, 349–359 (2014)
```
32. Wu, T.-H., Low, Ch., Bai, J.-W.: Heuristic solutions to multi-depot location-routing problems.
```
Comp. and oper. res. 29, 1393–1415 (2002)
```
33. Topplan, http://www.topplan.ru/
34. Velasquez, J., W., E., Heuristic Algorithms for the Capacitated Location-Routing Problem
and the Multi-Depot Vehicle Routing Problem. 4OR, A Quar. J. Oper. Res. Springer, Berlin,
```
12, 1, 99–100 (2014)
```
Load Balancing Congestion Games
and Their Asymptotic Behavior
Eitan Altman, Corinne Touati, Nisha Mishra, and Hisao Kameda
1 Introduction
A central question in routing games has been to establish conditions for the unique-
ness of the equilibria, either in terms of the network topology or in terms of the costs.
A survey on these issues is given in [1].
The question of uniqueness of equilibria has been studied in two different frame-
works. The first, which we call F1, is the non-atomic routing introduced by Wardrop
```
on 1952 in the context of road traffic in which each player (car) is infinitesimally
```
```
small; a single car has a negligible impact on the congestion. Each car wishes to
```
minimize its expected delay. Under arbitrary topology, such games are known to
have a convex potential and thus have a unique equilibrium [2]. The second frame-
work, denoted by F2, is splittable atomic games. There are finitely many players,
each controlling the route of a population of individuals. This type of games have
already been studied in the context of road traffic by Haurie and Marcotte [3] but
have become central in the telecom community to model routing decisions of Internet
Service Providers that can decide how to split the traffic of their subscribers among
various routes so as to minimize network congestion [4].
E. Altman (B)
1. INRIA, University Cote d’Azur 2. LIA, Avignon University, and 3. LINCS, Paris, France
e-mail: Eitan.Altman@inria.fr
C. Touati · N. Mishra
INRIA and CNRS, LIG, Univrsity of Grenobles, Saint-Martin-d’Héres, France
e-mail: Corinne.Touati@inria.fr
N. Mishra
e-mail: Nisha.Mishra@inria.fr
H. Kameda
Hisao Kameda, University of Tsukuba, Tsukuba, Japan
e-mail: kameda@cs.tsukuba.ac.jp
```
© The Editor(s) (if applicable) and The Author(s), under exclusive license
```
to Springer Nature Switzerland AG 2020
D. M. Ramsey and J. Renault (eds.), Advances in Dynamic Games,
Annals of the International Society of Dynamic Games 17,
```
https://doi.org/10.1007/978-3-030-56534-3_10
```
229
230 E. Altman et al.
In this paper, we study properties of equilibria in two other frameworks of routing
games which exhibit surprising behavior. The first, which we call F3, known as
congestion games [5], consists of atomic players with non-splittable traffic: each
player has to decide on the path to be followed by for its traffic and cannot split the
traffic among various paths. This is a non-splittable framework. We further introduce
a new semi-splittable framework, denoted by F4, in which each of several players
has an integer number of connections to route. It can choose different routes for
different connections but there is a constraint that the traffic of a connection cannot
be split. In the case where each player controls the route of a single connection and all
connections have the same size, this reduces to the congestion game of Rosenthal [5].
```
We consider in this paper routing games with additive costs (i.e., the cost of a path
```
```
equals to the sum of costs of the links over the path) and the cost of a link is assumed
```
to be convex increasing in the total flow in the link. The main goal of this paper is
to study a particular symmetric game of this type in a simple topology consisting
of three nodes and three links. We focus both on the uniqueness issue as well as on
other properties of the equilibria.
This game has already been studied within the two frameworks F1-F2 that we
mentioned above. In both frameworks it was shown [6] to have a unique equilibrium.
Our first finding is that in frameworks F3 and F4 there is a multitude of equilibria. The
price of stability is thus different from the price of anarchy and we compute both. We
show the uniqueness of the equilibrium in the limit as the number of players N grows
to infinity extending known results [3] from framework F2 to the new frameworks.
In framework F2 uniqueness is in fact achieved not only for the limiting games but
also for all N large enough. We show that this is not the case for F3-F4: for any
finite N there may be several equilibria. We show however in F3 that the whole set
of equilibria corresponding to a given N converge to the singleton corresponding to
the equilibrium in F1 as N → ∞. We finally show a surprising property of F4 that
exhibits non-symmetric equilibria in our symmetric network example while under
F1, F2, and F3 there are no asymmetric equilibria.
The structure of the paper is as follows. We first introduce the model and the
notations used in the study, we then move on to the properties of frameworks F3
```
(Sect. 3) and F4 (Sect. 4) and their relation to frameworks F1 and F2. We include in
```
the Appendix the proofs of the theorems and propositions of the paper.
2 Model and Notations
We shall use throughout the term atomic game to denote situations in which decisions
of a player have an impact on other players’ utility. It is non-atomic when players are
infinitesimally small and are viewed like a fluid of players, such that a single player
has a negligible impact on the utility of other players.
```
We consider a system of three nodes (A, B and C) with two incoming traffic
```
```
sources (respectively, from node A and B) and an exit node C. There are a total of N
```
connections originating from each one of the sources. Each connection can either be
Load Balancing Congestion Games and Their Asymptotic Behavior 231
Fig. 1 Physical system
sent directly to node C or rerouted via the remaining node. The system is illustrated
in Fig. 1.
This model has been used to model load balancing issues in computer networks,
see [6] and references therein. Jobs arrive to two computing centers represented by
nodes A and B. A job can be processed locally at the node where it arrives or it may be
forwarded to the other node incurring further communication delay. The costs of links
[AC] and [BC] represent the processing delays of jobs processed at nodes A and B,
respectively. Once processed, the jobs leave the system. A connection is a collection
```
of jobs with similar characteristics (e.g., belonging to the same application).
```
We introduce the following notations:
• A link between two nodes, say A and B, is denoted by [AB]. Our considered
system has three links [AB], [BC] and [AC].
• A route is simply referred by a sequence of nodes. Hence, the system has four
```
types of connections (routes): two originating from node A (route AC and ABC)
```
```
and two originating from node B (route BC and BAC).
```
Further, in the following, n AC , n BC , n ABC , and n B AC will refer to the number of
connections routed via the different routes while n[AC], n[BC] and n[AB] will refer
to the number of connections on each subsequent link. By conservation law, we have
n AC + n ABC = n BC + n B AC = N
and
⎧
⎨
⎩
n[AC] = n AC + n B AC ,
n[BC] = n ABC + n BC ,
n[AB] = n B AC + n ABC .
```
For each route r, we also define the fraction (among N ) of flow using it, i.e.,
```
f r = n r /N . The conservation law becomes f AC + f ABC = f BC + f B AC = 1.
```
Finally, the performance measure considered in this work is the cost (delay) of
```
connections experienced on their route. We consider a simple model in which the
```
cost is additive (i.e., the cost of a connection on a route is simply taken as the sum of
```
232 E. Altman et al.
```
delays experienced by the connection over the links that constitute this route). The
```
link costs are given by
⎧
⎨
⎩
```
C[AB] = a( f B AC + f ABC ),
```
```
C[AC] = b( f B AC + f AC ),
```
```
C[BC] = b( f BC + f ABC ),
```
```
where a(.) and b(.) are some functions of the corresponding fractions of link flows.
```
The path costs are given by
C AB = C[AB], C ABC = C[AB] + C[BC],
C BC = C[BC], C B AC = C[AB] + C[AC].
The cost for a user in frameworks F2-F4 is the average of path costs weighted by
the fraction that the player sends over each of the paths. For framework F3 a single
packet is sent by each player so the cost for the player is the cost for the path that it
takes.
We shall frequently assume that the costs on each link are linear with coefficient
α/N on link [AB] and coefficient β/N on link [AC] and [BC], i.e., for some positive
constants α and β we have
⎧
⎪⎪⎪
⎪⎨
⎪⎪⎪
⎪⎩
```
C[AB] = αN ( f B AC + f ABC ),
```
```
C[AC] = βN ( f B AC + f AC ),
```
```
C[BC] = βN ( f BC + f ABC ).
```
```
We restrict our study to the (pure) Nash equilibria which we express in terms of
```
the corresponding flows marked by a star. By conservation law, the equilibria are
```
uniquely determined by the specification of f ∗ABC and f ∗B AC (or equivalently n∗ABC
```
```
and n∗B AC ).
```
The main contribution of the paper is the study of the above network within the
```
following two types of decision models. In the first (F3), the decision is taken at the
```
```
connection level (Sect. 3), i.e., each connection has its own decision-maker that seeks
```
to minimize the connection’s cost, and the connection cannot be split into different
```
routes. In the second (F4), (Sect. 4) each one of the two source nodes decides on the
```
routing of all the connections originating there. Each connection of a given source
```
node (either A or B) can be routed independently but a connection cannot be split
```
into different routes. We hence refer to F4 this semi-splittable framework. Note that
```
the two approaches (F3 and F4) coincide when there is only N = 1 connection at
```
each source, which we also detail later. We shall relate frameworks F3 and F4 to
the frameworks F1 and F2 obtained as limits as the number of connections grows to
infinity.
Load Balancing Congestion Games and Their Asymptotic Behavior 233
```
3 Atomic Non-splittable (F3 Framework) Case and Its
```
```
Non-atomic Limit (F1 Framework)
```
We consider here the case where each 2N players connection belongs to an individual
user acting selfishly.
We first show that for fixed parameters, the game may have several equilibria, all
of which are symmetric for any number of players. The number of distinct equilibria
can be made arbitrarily large by an appropriate choice of functions a and b.
We then show properties of the limiting game obtained as the number of players
increases to infinity.
3.1 Non-uniqueness of the Equilibrium
Theorem 1 Assume that a is non-negative and non-decreasing and that b is increas-
ing. Then any equilibrium is symmetric, i.e., f ∗B AC = f ∗ABC . Routing a fraction 2x
```
players (x from A and x from B) to indirect links is an equilibrium if and only if
```
```
a(2x) ≤ b(1 + 1/N ) − b(1) (1)
```
```
Proof Consider an equilibrium ( f ∗ABC , f ∗B AC ). We first show that the equilibrium is
```
symmetric. Assume on the contrary that f ∗ABC > f ∗B AC . Since the demands are the
same this implies that f ∗BC > f ∗AC and the total flow on link BC is strictly larger
```
than the flow on link AC. But then, any player that takes the route ABC (note that
```
```
by assumption there is at least one such player) would strictly decrease its cost if
```
it deviates to the direct path AC. This contradicts the assumption of equilibrium.
Hence f ∗ABC = f ∗B AC and f ∗BC = f ∗AC .
At equilibrium a player that takes the direct path cannot gain by deviating. Thus
a routing multistrategy is an equilibrium if and only if a player that takes the indirect
path cannot strictly decrease its cost by deviation. Equivalently, routing a fraction
```
x of players via the indirect link is an equilibrium if and only if b(1) + a(2x) ≤
```
```
b(1 + 1/N ), which implies the Theorem. 
```
We shall call a multipolicy that routes k connections to each of the indirect path
a “k-policy”.
```
Corollary 1 Assume that a(x) and b(x) are increasing in x. Then, (i) if for some k,
```
the k-policy is an equilibrium then for any j < k, the j-policy is also equilibrium.
```
(ii) If for some N , a k-policy is an equilibrium then it is also an equilibrium for
```
smaller values of N .
We calculate the number of equilibria for different cost functions. Let k be the
```
solution of Eq. (1) obtained with equality. Hence the number of equilibria is k + 1.
```
We have the following cases:
234 E. Altman et al.
Fig. 2 Variation of the
number of equilibria with
```
respect to β (for α = 1)
```
```
• When b(x) = βx and a(x) = αx, then Condition (1) reduces to
```
x ≤ β2N α .
So the number of equilibria is  β2α  + 1.
The plot of the number of equilibria with respect to β for α = 1 and N = 10 is
given in Fig. 2.
We have the following observations:
1. The number of equilibria does not depend on the number N of players.
2. The number of equilibria increases as the cost function β increases for constant
value of α.
```
• When the cost function on the direct link is linear, i.e., b(x) = βx and indirect link
```
```
is non-linear and is of the form a(x) = x for  ≥ 0, then Condition (1) reduces
```
to
x ≤ 12
```
( β
```
N
```
) 1
```
.
So the number of equilibria is
⌊
```
N2( βN) 1
```
⌋
- 1.
The plot of the number of equilibria with respect to  for β = 1 is shown in Fig. 3.
We have the following observations:
1. The number of equilibria depends on the number of players, N . It increases with
N for  > 1 and decreases in N for  < 1.
2. The number of equilibria increases in the power factor .
Load Balancing Congestion Games and Their Asymptotic Behavior 235
Fig. 3 Variation of the
number of equilibria with
```
respect to  (for β = 1)
```
Remark 1 Consider the special case that a = 0. The problem is the equivalent to
routing on parallel links. Now assume that b is decreasing. Then the only equilibria
```
are (i) send no flow through AC and (ii) send no flow through BC.
```
```
Corollary 2 Assume that the derivative a′(0) of a at zero and the derivative b′(1)
```
of b at 1 exist. Then for large enough N , the k-policy is an equilibrium if
```
2ka′(0) < b′(1)
```
```
If moreover, b is convex and a concave (not necessarily strictly), then the above holds
```
for every n. If the opposite inequality holds above then for all n large enough the k
policy is not an equilibrium.
```
Proof The first part follows from (1). The second part follows from the fact that the
```
```
slope ( f (x + y) − f (x))/y of a function increases in y if the function is convex and
```
decreases in y if it is concave. 
3.2 The Potential and Asymptotic Uniqueness
When the number of players N grows to infinity, the limiting game becomes a non-
atomic game with a potential [7] defined by
```
F∞( f ABC , f B AC ) =
```
∫ r1
0
```
a(s)ds +
```
∫ r2
0
```
b(s)ds +
```
∫ r3
0
```
b(s)ds,
```
where r1 = f ABC + f B AC , r2 = 1 − f ABC + f B AC and r3 = 1 + f ABC − f B AC . In
```
the special case of linear cost of the form a(x) = αx, b(x) = βx, the above potential
```
```
is equivalent to the following one (upto a constant)
```
236 E. Altman et al.
```
F∞( f ABC , f B AC ) (2)
```
```
= β( f ABC − f B AC )2 + α2 ( f ABC + f B AC )2.
```
Hence we have the following:
```
Proposition 1 If a and b are strictly increasing then the non-atomic game (frame-
```
```
work F1) has a unique Nash equilibrium, which is f ∗ABC = f ∗B AC = 0.
```
Uniqueness of the equilibrium was shown to hold in [8, 9] under different conditions.
More general topological settings are considered and more general definition of
players. Yet it is assumed there that the costs are continuously differentiable which
we do not assume here.
To show the uniqueness of the equilibrium in the limiting game, we make use
of the fact that the limiting game has a potential which is convex. Yet, not only the
limiting game has a potential, but also the original one, as we conclude from next
theorem, whose proof is a direct application of [5].
```
Theorem 2 For any finite number of players, the game (in framework F3) is a
```
potential game [10] with the potential function up to a constant:
```
F( f ABC , f B AC ) =
```
Nr1∑
```
i=0
```
```
a(i) +
```
Nr2∑
```
i=0
```
```
b(i) +
```
Nr3∑
```
i=0
```
```
b(i). (3)
```
For the case of linear costs this gives
```
F( f ABC , f B AC ) = β N 2( f ABC − f B AC )2
```
- α N
2
```
2 ( f ABC + f B AC ) ( f ABC + f B AC + 1/N ) .
```
```
(4)
```
Note that unlike the framework F1 of non-atomic games, the fact that the game
has a potential which is convex over the action set does not imply uniqueness. The
reason for that is that in congestion games, the action space over which the potential
```
is minimized is not a convex set (due to the non-splittable nature) so that it may have
```
several local minima, each corresponding to another equilibrium, whereas a for a
convex function over the Euclidean space, there is a unique local minimum which is
```
also a global minimum of the function (and thus an equilibrium of the game).
```
Load Balancing Congestion Games and Their Asymptotic Behavior 237
3.3 Efficiency
Proposition 1 implies that
Theorem 3 In the non-atomic setting, F1, the only Nash equilibrium is also the
```
social optimum (i.e., the point minimizing the sum of costs of all players) of the
```
system.
Proof The sum of costs of all players is
f ABC C ABC + f AC C AC + f B AC C B AC + f BC C BC
```
= ( f ABC + f B AC )a( f ABC + f B AC ) + f ABC b( f BC + f ABC )
```
- f AC b( f AC + f B AC ) + f B AC b( f AC + f B AC )
- f BC b( f ABC + f BC ).
```
(5)
```
```
The minimum is hence obtained for ( f ABC , f B AC ) = (0, 0). 
```
See [8, 9] for related results. Since the game possesses several equilibria, we
```
can expect the PoA (Price of Anarchy—the largest ratio between the sum of costs
```
```
at an equilibrium and the sum of costs at the social optimum) and PoS (Price of
```
```
Stability—the smallest corresponding ratio) to be different.
```
```
Let k∗ be the largest integer such that x∗ = k∗/N satisfies Eq. (1). Then the
```
```
equilibrium ( ˆx∗, ˆx∗) with largest cost corresponds to this k.
```
Theorem 4 The price of stability of the game is 1 and the price of anarchy is
Po A = x
```
∗a(2x∗)
```
```
b(1) + 1
```
with x∗ = f ∗ABC = f ∗B AC .
Proof According to Theorem 1 we may restrict to symmetric equilibria, i.e., n∗ABC =
n∗B AC , then f ∗ABC = f ∗B AC = x∗. So the sum of costs of all the players becomes
```
2x∗a(2x∗) + 2b(1).
```
```
The sum of costs at social optimum is 2b(1), i.e., at x∗ = 0.
```
The price of anarchy is equal to the largest ratio between the sum of costs at an
```
equilibrium to the sum of costs at social optimum. So Po A = 2x∗a(2x∗ )+2b(1)2b(1 . Hence
```
the result. 
```
Note: Substituting x∗ = k∗/N , the price of anarchy becomes,
```
Po A = k
∗
```
N b(1) a
```
```
( 2k∗
```
N
```
)
```
- 1.
We look into different cases of cost functions and calculate the price of anarchy
using the value of x and the theorem.
We have the following cases:
238 E. Altman et al.
Fig. 4 Variation of the price
of anarchy with respect to β
```
(for α = 1)
```
• When the cost function on both the direct and indirect link is linear and is of the
```
form b(x) = βx and a(x) = αx, then Po A ≤ β2α N 2 + 1. The exact value of price
```
of anarchy can be obtained by substituting the exact value of k. So,
Po A = 2αN 2β
⌊ β
2α
⌋2
- 1.
The plot of the Po A with respect to varying β for a constant α = 1 is shown in
Fig. 4.
We have the following observations
1. As the number of player increases, the Po A decreases.
2. For large N , the price of anarchy may asymptotically reach 1.
3. The Po A increases as the cost function β increases.
4. If β > 2α, the Po A never becomes 1 for any value of N .
```
• When the cost function on the direct link is linear, i.e., b(x) = βx and the cost
```
```
of the indirect link is non-linear and is of the form a(x) = x for l ≥ 0, then the
```
exact value of price of anarchy can be obtained by substituting the exact value of
k. So,
Po A = 2

β N +1
⌊
N
2
```
( β
```
N
```
) 1⌋+1
```
- 1.
The plot of the Po A with respect to varying  for a constant β = 1 is given in
Fig. 5.
We have the following observations from the graph:
1. There is no monotonicity in the graph with either respect to the number of
players or with the power factor l.
2. If β < 2 N 1−, the Po A becomes 1.
Load Balancing Congestion Games and Their Asymptotic Behavior 239
Fig. 5 Variation of the
number of equilibria with
```
respect to  (for β = 1)
```
3. For large , the Po A again becomes 1.
4. For N = 1, 2, the Po A is 1 for all values of .
We also make the following observations:
```
(i) In the splittable atomic games studied in [6] the PoA was shown to be greater than
```
```
one for a sufficiently small number of players (smaller than some threshold) and was
```
```
1 for all large enough number of players (larger than the same threshold). Here for
```
any number of players, the PoS is 1 and the PoA is greater than 1.
```
(ii) The PoA decreases in N and tends to 1 as N tends to infinity, the case of splittable
```
games.
```
(iii) We have shown that the PoA is unbounded: for any real value K and any number
```
of players, one can choose the cost parameters a and b so that the PoA exceeds K .
This corresponds to what was observed in splittable games [8] and contrasts with the
non-atomic setting [11, 12].
```
4 Atomic Semi-splittable Case and Its Splittable Limit (F4
```
```
Framework)
```
We restrict in the rest of the paper to the linear cost. The game can be expressed
```
as a 2-player matrix game where each player (i.e., each source node A and B) has
```
N + 1 possible actions, for each of the N + 1 possible values of f ABC and f B AC ,
respectively.
The utility for player A is
```
U A( f ABC , f B AC ) = f AC C AC + f ABC C ABC
```
= b − b f ABC + b f B AC
```
+(a − 2b) f ABC f B AC + (a + 2b) f 2ABC .
```
```
(6)
```
240 E. Altman et al.
Similarly, for player B:
```
U B ( f ABC , f B AC ) = f BC C BC + f B AC C B AC
```
= b − b f B AC + b f ABC
```
+(a − 2b) f B AC f ABC + (a + 2b) f 2B AC .
```
```
(7)
```
Note that
∂U A
```
∂ f ABC= −b + (a − 2b) f B AC + 2(a + 2b) f ABC
```
and ∂U B∂ f
B AC
```
= −b + (a − 2b) f ABC + 2(a + 2b) f B AC .
```
Hence ∂
2U A
```
∂ f 2ABC= 2(a + 2b) =
```
∂2U B
```
∂ f 2B AC. Therefore, both u A : f ABC → U A( f ABC ,
```
```
f B AC ) and u B : f B AC → U B ( f ABC , f B AC ) are (strictly) convex functions. This
```
means that for each action of one player, there would be a unique best response
```
to the second player if its action space was the interval (0, 1). Hence, for the limit
```
```
case (when N → ∞), the best response is unique. In contrast, for any finite value of
```
N , there are either 1 or 2 possible best responses which are the discrete optima of
```
functions u A : f ABC → U A( f ABC , f B AC ) and u B : f B AC → U B ( f ABC , f B AC ). We
```
will however show that in the finite case, there may be up to 2 × 2 = 4 Nash equi-
libria while in the limit case the equilibrium is always unique.
4.1 Efficiency
Note that the total cost of the players is
```
Σ( f ABC , f B AC ) = U A( f ABC , f B AC ) + U B ( f ABC , f B AC )
```
```
= 2b + 2(a − 2b) f ABC f B AC + (a + 2b)( f 2ABC + f 2B AC )
```
```
= 2b + a( f ABC + f B AC )2 + 2b( f ABC − f B AC )2
```
≥ 2b.
```
Further, note that Σ = 2(F∞ + b). Hence Σ is strictly convex. Also Σ(0, 0) =
```
```
2b. Therefore (0, 0) is the (unique) social optimum of the system. Yet, for sufficiently
```
```
large N (that is, as soon as we add enough flexibility in the players’ strategies), this
```
is not a Nash equilibrium, as stated in the following theorem:
```
Theorem 5 The point ( f ABC , f B AC ) = (0, 0) is a Nash equilibrium if and only if
```
```
N ≤ (a/b) + 2.
```
```
Proof By symmetry and as u A : f ABC → U A( f ABC , f B AC ) is convex, then (0, 0) is
```
```
a Nash equilibrium iff U A(0, 0) ≤ U A(1/N , 0) = b − b/N + (a + 2b)/N 2 which
```
leads to the conclusion. 
Load Balancing Congestion Games and Their Asymptotic Behavior 241
Also, we can bound the total cost by
```
Σ( f ABC , f B AC ) =
```
```
= 2b + 2(a − 2b) f ABC f B AC + (a + 2b)( f 2ABC + f 2B AC )
```
```
≤ 2b + (a − 2b)( f 2ABC + f 2B AC ) + (a + 2b)( f 2ABC + f 2B AC )
```
```
≤ 2b + 2a( f 2ABC + f 2B AC )
```
≤ 2b + 4a.
```
This bound is attained at Σ(1, 1) = 2b + 2(a − 2b) + 2(a + 2b) = 4a + 2b.
```
Yet, it is not obtained at the Nash equilibrium for sufficiently large values of N :
```
Theorem 6 (1, 1) is a Nash equilibrium if and only if N ≤ 2b + a3a + b .
```
```
Proof We have U A(1, 1) = b + 2a and
```
```
U A(1 − 1/N , 1) = 2a + b − 3a/N − b/N + 2b/N 2 + a/N 2.
```
```
Therefore U A(1 − 1/N , 1) ≥ U A(1, 1) ⇔ 2b + a ≥ (3a + b)N . The conclusion
```
follows by convexity. 
```
Therefore, for N ≥ max( ab + 2, 2b + a3a + b ) the Nash equilibria are neither optimal
```
nor worse-case strategies of the game.
4.2 Case of N = 1
```
In case of N = 1 (one flow arrives at each source node and there are thus two
```
```
players) the two approach coincides: the atomic non-splittable case (F3) is also a
```
```
semi-splittable atomic game (F4). f ABC and f B AC take values in {{0}, {1}}. From
```
Eqs. 6 and 7, the matrix game can be written
```
( (b, b) (2b, a + 2b)
```
```
(a + 2b, 2b) (2a + b, 2a + b)
```
```
)
```
```
(8)
```
and the potential of Eq. 4 becomes
```
( 0 a + b
```
a + b 3a
```
)
```
.
```
Then, assuming that either a or b is non-null, we get that (0, 0) is always a Nash
```
```
equilibrium and that (1, 1) is a Nash equilibrium if and only if 3a ≤ a + b, i.e.,
```
2a < b.
We next consider any integer N and identify another surprising feature of the
equilibrium. We show that depending on the sign of a − 2b, non-symmetric equilibria
242 E. Altman et al.
arise in our symmetric game. In all frameworks other than the semi-splittable games
there are only symmetric equilibria in this game. We shall show however that in the
```
limit (as N grows to infinity), the limiting game has a single equilibrium.
```
4.3 Case a − 2b < 0
In this case, there may be multiple equilibria, as shown in the following example.
Example 1 Consider a = 1, b = 3, and N = 4, then the cost matrices are given
below, with the two Nash equilibria of the game represented in bold letters:
U A = 116
⎛
⎜⎜
⎜⎜
⎝
48 60 72 84 96
43 50 57 64 71
52 54 56 58 60
75 72 69 66 63
112 104 96 88 80
⎞
⎟⎟
⎟⎟
⎠
, and
U B = 116
⎛
⎜⎜
⎜⎜
⎝
48 43 52 75 112
60 50 54 72 104
72 57 56 69 96
84 64 58 66 88
96 71 60 63 80
⎞
⎟⎟
⎟⎟
⎠
.
Note that due to the shape of U A and U B the cost matrices of the game are transpose
of each other. Therefore in the following, we shall only give matrix U A.
We have the following theorem:
Theorem 7 All Nash equilibria are symmetric, i.e.,
f ∗ABC = f ∗B AC .
The proof is given in Appendix 1.
```
4.4 Case a = 2b (with a > 0)
```
When a = 2b, we shall show that some non-symmetric equilibria exist.
Theorem 8 If a = 2b, there are exactly either 1 or 4 Nash equilibria. For any N ,
let N = N /8.
```
• If N mod8 = 4, there are 4 equilibria (n∗ABC , n∗B AC ), which are (N , N ), (N +
```
```
1, N ), (N , N + 1) and (N + 1, N + 1).
```
Load Balancing Congestion Games and Their Asymptotic Behavior 243
```
• Otherwise, there is a unique equilibrium, which is (N , N ) if N mod8 < 4 or (N +
```
```
1, N + 1) if N mod8 > 4.
```
Proof The Nash equilibria are the optimal points for both u A and u B . They are
```
therefore either interior or boundary points (i.e., either f ABC or f B AC are in 0, 1). We
```
detail the interior point cases in Appendix 1. The rest of the proof derives directly
from the definition of ∂U A∂ f
ABC
and ∂U B∂ f
B AC
. Indeed:
∂U A
```
∂ f ABC= (a − 2b) f B AC + 2(2b + a) f ABC − b = 8b f ABC − b
```
∂U B
```
∂ f B AC= (a − 2b) f ABC + 2(a + 2b) f B AC − b = 8b f B AC − b.
```
Both are minimum for 1/8. Therefore, it is attained if N is a multiple of 8. Otherwise,
the best response of each player is either N /8/N if N mod8 ≤ 3 or N /8 /N
if N mod8 ≥ 5. If N mod8 = 4, then each player has 2 best responses which are
1
N
N − 4
8 and
1
N
N + 4
8 . Then, one can check that the boundary points follow the
law of Theorem 11 when N = N /8 = 0. 
4.5 Case a − 2b > 0
Theorem 9 If a − 2b > 0, there are exactly either 1, 2, or 3 Nash equilibria.
Let α = a + 2b3a + 2b , β = 2a3a + 2b and γ = b3a + 2b .
```
Define further ˜N = N γ  and z(N ) = N γ − ˜N . The equilibria are of the form
```
```
• Either ( ˜N , ˜N ), ( ˜N + 1, ˜N ), ( ˜N , ˜N + 1)
```
```
if N is such that z(N ) = α (mode 3-A in Fig. 6).
```
```
• Or ( ˜N + 1, ˜N + 1), ( ˜N + 1, ˜N ), ( ˜N , ˜N + 1) if N is such that z(N ) = β (mode
```
```
3-B).
```
```
• Or ( ˜N , ˜N + 1), ( ˜N + 1, ˜N )
```
```
if N is such that α < z(N ) < β (mode 2)
```
```
• Or ( ˜N , ˜N )
```
```
if N is such that β < z(N ) < α + 1 (mode 1).
```
We illustrate the different modes in the following example.
```
Example 2 Suppose that a = 10 and b = 3 (we represent only the part of the matri-
```
```
ces corresponding to 1/N ≤ f ABC , f B AC ≤ 4/N ).
```
If N = 24, there are 3 Nash equilibria:
244 E. Altman et al.
Fig. 6 Different modes according to different values of N
1152 1200 1248 1296
1118 1172 1226 1280
1112 1172 1232 1292
1134 1200 1266 1332
If N = 26, there are 2 Nash equilibria:
1352 1404 1456 1508
1314 1372 1430 1488
1304 1368 1432 1496
1322 1392 1462 1532
If N = 27, there are 3 Nash equilibria:
1458 1512 1566 1620
1418 1478 1538 1598
1406 1472 1538 1604
1422 1494 1566 1638
If N = 28, there is a single Nash equilibrium:
1568 1624 1680 1736
1526 1588 1650 1712
1512 1580 1648 1716
1526 1600 1674 1748
4.6 Limit Case: Perfectly Splittable Sessions
We focus here in the limit case where N → +∞.
Theorem 10 There exists a unique Nash equilibrium and it is such that
Load Balancing Congestion Games and Their Asymptotic Behavior 245
f ∗B AC = f ∗ABC = b3a + 2b .
Proof Note that ∂U A∂ f
ABC
```
(1) > 0 and ∂U B∂ f
```
B AC
```
(1) > 0. If f ABC = 0 then f B AC =
```
b
2a + 4b which implies that −b +
```
b(a − 2b)
```
2a + 4b ≥ 0, which further implies that −a −
6b > 0 which is impossible. Hence f ABC > 0. Similarly f B AC > 0 which concludes
the proof. 
```
Recall that the optimum sum (social optimum) is given by (0, 0) and that the
```
```
worse case is given by (1, 1). Hence, regardless of the values of a and b, at the limit
```
case, we observe that there is a unique Nash equilibrium, that is symmetric, and is
```
neither optimal (as opposed to F3), nor the worst case scenario. The price of anarchy
```
is then:
Po A = PoS = 2b + 2 f
∗2ABC a
2b = 1 +
ab
```
(3a + 2b)2 .
```
5 Conclusions
We revisited in this paper a load balancing problem within a non-cooperative rout-
ing game framework. This model had already received much attention in the past
```
within some classical frameworks (the Wardrop equilibrium analysis and the atomic
```
```
splittable routing game framework). We studied this game under other frameworks—
```
```
the non-splittable atomic game (known as congestion game) as well as a the semi-
```
splittable framework. We have identified many surprising features of equilibria in
both frameworks. We showed that unlike the previously studied frameworks, there is
```
no uniqueness of equilibrium, and non-symmetric equilibria may appear (depending
```
```
on the parameters). For each of the frameworks, we identified the different equilibria
```
and provided some of their properties. We also provided an efficiency analysis in
terms of price of anarchy and price of stability. In the future we plan to investigate
more general cost structures and topologies.
Appendix 1
Proof of Theorem 7
```
Suppose that ( f ∗ABC , f ∗B AC ) is a Nash equilibrium with f ∗ABC  = f ∗B AC . Then, by
```
```
definition:
```
```
U A( f ∗ABC , f ∗B AC ) ≤ U A( f ∗B AC , f ∗B AC )and
```
```
U B ( f ∗ABC , f ∗B AC ) ≤ U B ( f ∗ABC , f ∗ABC ),
```
246 E. Altman et al.
which gives, after some manipulations,
⎧
⎪⎪⎨
⎪⎪⎩
```
(a − 2b) f ∗ABC f ∗B AC ≤
```
```
2a f ∗2B AC + b f ∗ABC − b f B AC − (a + 2b) f ∗2ABC
```
```
(a − 2b) f ∗ABC f ∗B AC ≤
```
```
2a f ∗2ABC + b f ∗B AC − b f ∗ABC − (a + 2b) f ∗2B AC .
```
```
Therefore 2(a − 2b) f ∗ABC f ∗B AC ≤ (a − 2b)( f ∗2ABC + f ∗2B AC ) and hence 0 ≤ (a −
```
```
2b)( f ∗ABC − f ∗B AC )2 which is impossible.
```
Boundary Equilibria When a = 2b
```
Theorem 11 If a = 2b, there exists a single Nash equilibrium of the form (0, f ∗B AC )
```
```
and ( f ∗B AC , 0) with f ∗B AC non-null. It is obtained for N = 4 and f ∗B AC = 1/4. The
```
```
points (0, 0) are Nash equilibria if and only if N ≤ 4. Further, there are no equilib-
```
```
rium of the form ( f ABC , 1) or (1, f B AC ).
```
```
Proof We first study the equilibria of the form (0, f ABC ). (0, γ ) is a Nash equilibrium
```
iff ⎧
⎪⎪⎪
⎪⎪⎪
⎨
⎪⎪⎪
⎪⎪⎪
⎩
```
U A(0, γ ) ≤ U A
```
```
( 1
```
N , γ
```
)
```
```
U B (0, γ ) ≤ U B
```
```
(
```
0, γ + 1N
```
)
```
```
U B (0, γ ) ≤ U B
```
```
(
```
0, γ − 1N
```
)
```
⇔
⎧
⎪⎪⎪
⎪⎨
⎪⎪⎪
⎪⎩
b ≤ 2b + aN
```
b ≤ (a + 2b)(2γ + 1N )
```
```
b ≥ (a + 2b)(2γ − 1N )
```
⇔
⎧
⎪⎪⎪
⎨
⎪⎪⎪
⎩
1 ≤ 4N
```
1 ≤ 4(2γ + 1N )
```
```
1 ≥ 4(2γ − 1/N )
```
⇔
```
{ N ≤ 4
```
N /8 − 1/2
N ≤ γ
≤ N /8 + 1/2N .
```
(9)
```
If N ≤ 3 then N /8 + 1/2 ≤ 7/8 < 1 which cannot be obtained by the player
otherwise than in 0. For N = 4, the second inequality becomes 0 ≤ γ ≤ 14 which
hence leads to the only non-null Nash equilibrium.
```
We next study the potential equilibria of the form ( f ABC , 1). Let (γ , 1) be a Nash
```
```
equilibrium. Then U B (γ , 1) ≤ U B (γ , 1 − 1/N ). Then
```
```
bγ + a + 2b ≤ b − b(1 − 1/N ) + bγ + (a + 2b)(1 − 1/N )2
```
```
⇒ a + 2b ≤ b/N + (a + 2b)(1 + 1/N 2 − 2/N )
```
```
⇒ 0 ≤ b + (a + 2b)(1/N − 2)
```
```
⇒ 2a + 3b ≤ (a + 2b)/N ⇒ N ≤ 1/4. 
```
Load Balancing Congestion Games and Their Asymptotic Behavior 247
Boundary Equilibria When a − 2b > 0
```
Theorem 12 (0, α) and (α, 0) are Nash equilibria iff:
```
b
a − 2b −
1
N
a + 2b
a − 2b ≤ α ≤
b
```
2(a + 2b) +
```
1
2N .
```
Further, there are no Nash equilibrium of the form (A, 1).
```
```
Proof We first focus on the Nash equilibria of the form (0, A). Since U A(., f B AC )
```
```
and U B ( f ABC , .) are convex, (0, γ ) is a Nash equilibrium iff
```
⎧
⎪⎪⎪
⎪⎪⎪
⎨
⎪⎪⎪
⎪⎪⎪
⎩
```
U A(0, γ ) ≤ U A
```
```
( 1
```
N , γ
```
)
```
```
U B (0, γ ) ≤ U B
```
```
(
```
0, γ + 1N
```
)
```
```
U B (0, γ ) ≤ U B
```
```
(
```
0, γ − 1N
```
)
```
⇔
⎧
⎪⎪⎪
⎨
⎪⎪⎪
⎩
```
b ≤ (a − 2b)γ + 2b + aN
```
```
b ≤ (a + 2b)(2γ + 1N )
```
```
b ≥ (a + 2b)(2γ − 1N )
```
⇔
⎧
⎪⎪⎪
⎪⎪⎨
⎪⎪⎪
⎪⎪⎩
```
γ ≥ bN − 2b − aN (a − 2b)
```
```
γ ≥ bN − a − 2b2N (a + 2b)
```
```
γ ≤ bN + a + 2b2N (a + 2b)
```
```
But bN − 2b − aN (a − 2b) ≥ bN − a − 2b2N (a + 2b) which concludes the proof. and hence
```
bN − a − 2b
```
2N (a + 2b) ≤ γ ≤
```
bN + a + 2b
```
2N (a + 2b) .
```
```
We now study the potential equilibria of the form (A, 1). Let (A, 1) be a Nash
```
```
equilibrium. Then U B (A, 1) ≤ U B (A, 1 − 1/N ). Then
```
```
−b + (a − 2b)A + (a + 2b) ≤ −b(1 − 1/N )
```
```
+(a − 2b)A(1 − 1/N ) + (a + 2b)(1 − 1/N )2
```
```
⇒ 0 ≤ b − (a − 2b)A + (a + 2b)(−2 + 1/N )
```
```
⇒ (a − 2b)A ≤ −2a − 3b + (a + 2b)/N ⇒
```
```
⇒ 2a + 3b ≤ (a − 2b)A + 2a + 3b ≤ (a + 2b)/N
```
.
```
But 2a + 3b ≤ (a + 2b)/N ⇒ N ≤ a + 2b2a + 3b < 1. 
```
248 E. Altman et al.
Proof of Theorem 9
We first start by showing that there are at most 4 interior Nash equilibria and that
```
they are of the form: (A, A),(A + 1, A),(A, A + 1),(A + 1, A + 1).
```
```
Proof Let f ABC , f B AC be a Nash equilibrium in the interior (i.e., 0 < f ABC < 1
```
```
and 0 < f B AC < 1). Then f ABC and f B AC are the (discrete) minimizers of x →
```
```
U A(x, f B AC ) and x → U B ( f ABC , x), respectively. Further:
```
⎧
⎪⎨
⎪⎩
∂U A
```
∂ f ABC= −b + (a − 2b) f B AC + 2(2b + a) f ABC
```
∂U B
```
∂ f B AC= −b + (a − 2b) f ABC + 2(a + 2b) f B AC
```
The optimum values are therefore, respectively:
x A = b − θ f B ACλ and x B = b − θ f ABCλ
```
with λ = 2(2b + a) and θ = a − 2b. Therefore:
```
```
{ x
```
```
A − 1/(2N ) ≤ f ABC ≤ x A + 1/(2N ),
```
```
x B − 1/(2N ) ≤ f B AC ≤ x B + 1/(2N ).
```
Hence
b
λ −
θ
λ
```
( b
```
λ −
θ
λ f ABC +
1
2N
```
)
```
− 12N ≤ f ABC ≤ 12N
- bλ − θλ
```
( b
```
λ −
θ
λ f ABC −
1
2N
```
)
```
.
Then
b
λ + θ −
λ
```
2N (λ − θ) ≤ f ABC ≤
```
λ
```
2N (λ − θ) +
```
b
λ + θ .
```
Then bλ + θ = b2b + 3a , λ2N (λ − θ) = 4b + 2a2N (6b + a) and λ2N (λ − θ) = 2(a + 2b)2N (6b + a) ,
```
which gives
b
2b + 3a −
a + 2b
```
N (6b + a) ≤ f ABC ≤
```
2b + a
```
N (6b + a) +
```
b
2b + 3a .
Similarly, we have
b
2b + 3a −
```
(2b + a)
```
```
N (6b + a) ≤ f B AC ≤
```
b
2b + 3a +
2b + a
```
N (6b + a) .
```
Load Balancing Congestion Games and Their Asymptotic Behavior 249
Note that 12 < 2b + a6b + a < 1. Therefore there are either 1 or 2 possible values, which
are identical for f ABC and f B AC . There are therefore 4 possible equilibria. 
```
Now, the potential equilibria are of the form (A, A), (A, A + 1), (A + 1, A), and
```
```
(A + 1, A + 1). By symmetry, note that if (A, A + 1) is a Nash equilibrium, then
```
```
(A + 1, A) also is. The following lemma reduces the number of combinations of
```
```
equilibria:
```
```
Lemma 1 If (A, A) is a Nash equilibrium then (A + 1, A + 1) is not a Nash equi-
```
librium.
```
Proof Suppose that (A, A) and (A + 1, A + 1) are two Nash equilibria. Then
```
```
U A(A, A) ≤ U A(A + 1, A) and U A(A + 1, A + 1) ≤ U A(A, A + 1), which implies
```
⎧
⎪⎪⎨
⎪⎪⎩
```
−b AN + (a − 2b)A2 + (2b + a)A2 ≤
```
```
−b(A + 1)N + (a − 2b)A(A + 1) + (2b + a)(A + 1)2
```
```
−b(A + 1)N + (a − 2b)(A + 1)2 + (2b + a)(A + 1)2 ≤
```
```
−b AN + (a − 2b)A(A + 1) + (2b + a)A2
```
⇒
```
{ bN ≤ (a − 2b)A + (2b + a)(2 A + 1)
```
```
(a − 2b)(A + 1) + (2b + a)(2 A + 1) ≤ bN
```
```
⇒ (a − 2b)(A + 1) ≤ bN − (2b + a)(2 A + 1) ≤ (a − 2b)A
```
.
```
Hence (a − 2b)(A + 1) ≤ (a − 2b)A and therefore a − 2b ≤ 0 which is impos-
```
sible. 
Therefore the different possible combinations are mode 1, mode 2, mode 3-A,
```
and mode 3-B in Fig. 6).
```
We first start by the occurrence of mode 3-A:
```
Lemma 2 Suppose that a − 2b > 0. Suppose that (A, A) and (A + 1, A) are two
```
Nash equilibria. Then
```
A = bN − 2b − a3a + 2b .
```
```
Proof Suppose that (A, A) and (A + 1, A) are two Nash equilibria. Then necessarily
```
```
U A(A, A) = U A(A + 1, A). Hence
```
```
−b AN + (a − 2b)A2 + (2b + a)A2
```
```
= −b(A + 1)N + (a − 2b)A(A + 1) + (2b + a)(A + 1)2
```
i.e.,
```
bN = (a − 2b)A + (2b + a)(2 A + 1) ⇒ bN − 2b − a = (3a + 2b)A
```
250 E. Altman et al.
which leads to the conclusion. 
Hence, the system is in mode 3-A iff bN − 2b − a is divisible by 3a + 2b or in
```
other words, if N is of the form [(3a + 2b)K + 2a]/b for some integer K .
```
We then move on to Mode 3-B:
```
Lemma 3 Suppose that a − 2b > 0. Suppose that (A + 1, A + 1) and (A + 1, A)
```
are two Nash equilibria. Then
```
A = bN − 2a3a + 2b .
```
```
Proof Suppose that (A + 1, A + 1) and (A, A + 1) are two Nash equilibria, then
```
```
U1(A + 1, A + 1) = U1(A, A + 1). This implies
```
```
−N b(A + 1) + (a − 2b)(A + 1)2 + (2b + a)(A + 1)2 =
```
```
−N b A + (a − 2b)A(A + 1) + (2b + a)A2
```
```
⇒ (a − 2b)(A + 1) + (2b + a)(2 A + 1) = N b
```
```
⇒ (3a + 2b)A = N b − 2a
```
which concludes the proof. 
Hence, the system is in mode 3-B iff bN − 2a is divisible by 3a + 2b or in other
```
words, if N is of the form [(3a + 2b)K + 2b + a]/b for some integer K .
```
Finally, for Mode 2:
```
Lemma 4 Suppose that a − 2b > 0. Suppose that (A, A + 1) and (A + 1, A) are
```
only two Nash equilibria. Then
```
(3a + 2b)A + 2b + a < bN < (3a + 2b)A + 2a.
```
```
Proof Suppose that (A, A + 1) and (A + 1, A) are two Nash equilibria, then:
```
```
U A(A, A + 1) ≤ U A(A + 1, A + 1)and
```
```
U A(A + 1, A) ≤ U A(A, A),
```
```
i.e., {
```
```
bN ≤ (3a + 2b)A + 2a
```
```
(3a + 2b)A + 2b + a ≤ bN
```
```
The conclusion comes from Lemmas 2 and 3, since neither (A, A) nor (A +
```
```
1, A + 1) are Nash equilibria. 
```
Finally the system is in mode 1 if it is not in any other modes. One can then check
that the boundary cases found in Theorem 12 correspond to the case where A = 0
which concludes the proof.
Load Balancing Congestion Games and Their Asymptotic Behavior 251
References
1. N. Shimkin, “A survey of uniqueness results for selfish routing,” in Proc. of the International
```
Conference on Network Control and Optimization (NetCoop), L. N. in Computer Science 4465,
```
Ed., 2007, pp. 33–42.
2. M. Beckmann, C. McGuire, and C. Winsten, Studies in the Economics of Transportation. New
```
Haven: Yale University Press, 1956.
```
3. A. Haurie and P. Marcotte, “On the relationship between Nash-Cournot and Wardrop equilib-
ria,” Networks, vol. 15, no. 3, 1985.
4. A. Orda, R. Rom, and N. Shimkin, “Competitive routing in multiuser communication net-
works,” IEEE/ACM Trans. Netw., vol. 1, no. 5, pp. 510–521, 1993.
5. R. W. Rosenthal, “A class of games possessing pure-strategy Nash equilibria,” International
Journal of Game Theory, vol. 2, pp. 65–67, 1973.
6. E. Altman, H. Kameda, and Y. Hosokawa, “Nash equilibria in load balancing in distributed
```
computer systems,” International Game Theory Review (IGTR), vol. 4, no. 2, pp. 91–100, 2002.
```
7. M. Beckmann, C. McGuire, and C. Winsten, N. H. Y. U. Press, Ed., 1956.
8. H. Kameda and O. Pourtallier, “Paradoxes in distributed decisions on optimal load balancing
for networks of homogeneous computers,” J. ACM, vol. 49, no. 3, pp. 407–433, 2002.
9. H. Kameda, E. Altman, and O. Pourtallier, “A mixed optimum in symmetric distributed com-
puter systems,” IEEE Trans. Automatic Control, vol. 53, pp. 631–635, 2008.
10. D. Monderer and L. S. Shapley, “Potential games,” Games and economic behavior, vol. 14,
no. 1, pp. 124–143, 1996.
11. T. Roughgarden, Selfish routing and the price of anarchy. MIT Press, 2006.
12. H. Lin, T. Roughgarden, É. Tardos and A. Walkover, Stronger Bounds on Braess Paradox and
```
the Maximum Latency of Selfish Routing, SIAM J. Discrete Math., 25(4), pp. 1667–1686,
```
2011.
Non-deceptive Counterfeiting
and Consumer Welfare: A Differential
Game Approach
Bertrand Crettez, Naila Hayek, and Georges Zaccour
1 Introduction
Grossman and Shapiro [14, 15] define counterfeiting as illegally copying genuine
goods with a brand name, whereas Cordell et al. [8] state that “Any unauthorized
manufacturing of goods whose special characteristics are protected as intellectual
```
property rights (trademarks, patents and copyrights) constitutes product counterfeit-
```
ing.”As clearly shown by the numbers to follow, the worldwide magnitude of this
illegal activity is simply astonishing. According to Levin [24], American businesses
and industries lose approximately $200 billion in revenues annually due to counter-
feits, and on a broader scale, counterfeit goods account for more than half a trillion
dollars each year.1 Research analysts estimate that the number of jobs lost world-
wide to counterfeit black markets is approximately 2.5 million with 750,000 of them
```
being located in the United States (Levin, ibid) and 300,000 in Europe (Eisend and
```
1 See also A. Sowder, “The Harmful Effects of Counterfeit Goods”, Athens State University, http://
www.athens.edu/business-journal/spring-2013/asowder-couterfeit/.
We thank a referee for helpful remarks on a previous version of this work. The third author’s research
is supported by NSERC Canada, grant RGPIN-2016-04975 and was partially conducted during his
stay at CRED, Université Panthéon-Assas Paris II.
B. Crettez (B) · N. Hayek
Université Panthéon-Assas, Paris II, CRED, France
e-mail: bertrand.crettez@u-paris2.fr
N. Hayek
e-mail: naila.hayek@u-paris2.fr
G. Zaccour
GERAD, HEC Montréal, Montréal, Canada
e-mail: georges.zaccour@gerad.ca
```
© The Editor(s) (if applicable) and The Author(s), under exclusive license
```
to Springer Nature Switzerland AG 2020
D. M. Ramsey and J. Renault (eds.), Advances in Dynamic Games,
Annals of the International Society of Dynamic Games 17,
```
https://doi.org/10.1007/978-3-030-56534-3_11
```
253
254 B. Crettez et al.
```
Schichert-Guler [13]). Even though they are already impressive, these figures proba-
```
bly do not tell the whole story. For instance, it may well be that by violating property
rights, counterfeiting discourages the owners from investing in improving the quality
of their products, which undoubtedly has a private and a social cost. 2
It is natural to wonder how to efficiently combat and deter counterfeiting, and one
can distinguish between private and public efforts. Public enforcement of property
rights has often relied on the seizure of counterfeit goods, which is prescribed in the
commercial laws of many countries. For instance, more than 40 million counterfeit
products were seized at the European Union’s external border in 2012: their equiv-
alent value in genuine products is nearly e1 billion. 3,4 In addition to confiscation,
```
authorities can find anyone producing or trading (in) fake goods.5 Designing fines
```
involves two decisions. The first pertains to determining of the fines’ values, and
the second relates to how the proceeds of the fines are used. As regards the first
issue, the penalty for counterfeiting is often set as a function of the price charged by
```
the intellectual property right (henceforth IPR) holder. To illustrate, in the U.S., the
```
Anti-counterfeiting Consumer Protection Act of 1996, S. 1136, provides civil fines
pegged to the value of genuine goods. The fines are often rebated to the producers
of the genuine goods. For instance, in June 2008, a French Court “ordered e-Bay
to pay $63 million in damages to units of the Paris-based luxury goods mammoth
LVMH, after agreeing that the site had facilitated the sale of counterfeit versions of
```
its high-end products, particularly Louis Vuitton luggage...”).6
```
Another important issue when it comes to deterring counterfeiting is whether
```
consumers of fake products should be fined as well (in addition to being exposed to
```
```
seizure). This depends on whether consumers are victims of counterfeiting or whether
```
know perfectly well that the products they are buying are imitations. One can argue
that punishing the purchase of counterfeit products would deter the illegal trade of
such goods. For example, in Italy, purchasing counterfeit products is considered a
```
2 Staake et al. (2009) provides a comprehensive literature review and discusses the existing body of
```
research on the structures and mechanisms of counterfeit trade before 2010.
3 See T. Bashir: http://brandandcommercial.com/articles/show/brand-building/214/counterfeiting-
the-challenge-to-brand-owners-and-manufacturers1.
4 Interestingly, the law can even specify what to do with the confiscated products. In the US case,
the law gives the Customs Service four options regarding the uses of the seized goods at the border,
```
namely: reexportation of the goods, donation to charity, destruction, or turning them to the General
```
```
Services Administration for relabeling and sale (see Grossman and Shapiro, p. 72 [14]).
```
5 There can be either monetary or non-monetary sanctions. There are other policies that prevent
counterfeiting. For instance, a tariff on copying devices may prevent copyright infringement when
the copying cost is relatively low and the tariff raises the effective copying cost. The Copyright
```
Board of Canada has the power to impose tariffs on copying devices (subject to the approval of the
```
```
Supreme Court of Canada).
```
6 Pocketing, i.e., rebating fines to the producers of the genuine goods, affects their production
decisions. When fines imposed on counterfeiters are pegged to the price of the genuine items, a
```
luxury monopolist can find counterfeiting profitable (in comparison to the case where IPRs are
```
```
completely enforced) by raising its selling price (Yao [35]). This result is also obtained by Di Liddo
```
[12] in the case where the genuine firm can pocket fines not necessarily pegged to the price of its
product.
Non-deceptive Counterfeiting and Consumer … 255
crime. Buyers of counterfeit goods are given on-the-spot fines of up to 10,000 euros.
In France, the maximum fine for buying fake goods is 300,000 euros or three years
in jail. 7 In other countries, like the US or the UK, authorities target those who trade
in fake goods, but refrain from criminalizing consumers who buy them. A possible
drawback of prosecuting consumers of fake products is reducing the incentive of
consumers to buy genuine products when they cannot distinguish between fake items
and the genuine product [36].
Private enforcement of property rights can essentially take two forms, namely,
policing and policies by their owners. Qian [28] notes that the luxury house LVMH
assigns approximately 60 full-time employees to anti-counterfeiting, working in col-
laboration with a wide network of outside investigators and a team of lawyers, and
that it spent more than 16 million dollars on investigations and legal fees in 2004
alone. In terms of policies, a number of anti-counterfeiting strategies have been
recommended by numerous researchers. For instance, Chaudhry and Zimmerman
[7] suggest aggressively cutting prices, providing financial incentives to distributors
so they will reject counterfeits, and educating consumers about the harmful effects
of fake goods. Shultz and Saporito [32] propose ten anti-counterfeiting strategies,
among them, advertising as a tool to differentiate real products from phony ones,
```
pricing to influence demand; and finally, involvement in coalitions with organizations
```
```
that have similar intellectual property right (IPR) interests.
```
This paper looks at how the entry of a counterfeiter on the market affects the legal
firm’s pricing and advertising strategies and profits when there is no public nor private
enforcement of property rights. The rationale for focusing on price and advertising is
straightforward. First, it is probably the high margin, that is, the difference between
```
the price and the (comparatively very low) production cost that makes counterfeiting
```
financially attractive. Second, the high willingness-to-pay by consumers is driven
by the brand image or reputation, and this asset is built through advertising, and of
course, through other features such as design, quality, etc. Third, public enforcement
of property rights is often lax or imperfect and not all legal firms can afford private
enforcement policies. In such a setting, fining the consumption of fake products
would be especially relevant if counterfeiting were actually detrimental to both the
legal firm and the consumers.
To the best of our knowledge, excepting Buratto et al. [4], Crettez et al. [10],
and Biancardi et al. [3] there are no papers analyzing brand quality dynamics in the
presence of counterfeiting. To be sure, the impact of counterfeiting and piracy on
```
brand reputation (and quality) has already been analyzed—see, for instance, Banerjee
```
[2], Qian [28], Qian et al. [29], Zhang [37], and the review by Di Liddo [11]. But
```
in these contributions, the analysis is restricted to a two-period setup (or a static
```
```
setting). By contrast, the present paper, like Buratto et al. (ibid), Crettez et al. (ibid),
```
```
and Biancardi et al. (ibid) considers a continuous time framework, which allows us
```
to study how the genuine firm’s strategic decisions regarding pricing and advertising
change with the date of the counterfeiter’s arrival and the parameters describing the
7 Cox and Collins [9], which focuses on music and movie piracies in Finland, derives a demand
```
function for pirated products that take into account the expected cost of punishment.
```
256 B. Crettez et al.
dynamics of its brand reputation. Moreover, our framework allows us to study the
dynamics of brand reputation before as well as after the counterfeiter’s entry.8 We
will later highlight the differences between Buratto et al. and Crettez et al. papers
and ours. We shall answer the following research questions:
1. How does the counterfeiter’s entry affect the legal firm’s pricing and advertising
decisions?
2. Are there conditions under which the legal firm benefits from counterfeiting?
3. Does the consumer benefit from counterfeiting?
In a nutshell, our results are as follows: First, we obtain that counterfeiting influ-
ences pricing and advertising strategies before and after entry occurs. The legal firm
decreases its price and advertising investments in the counterfeiting scenarios. This
leads to a loss in a long-term brand equity, that is, counterfeiting has a long-lasting
effect on the legal firm even when the counterfeiter stops. This result contradicts some
findings in the literature, according to which counterfeiting may stimulate innovation
```
or the quality of the genuine good through product differentiation (e.g., Banerjee [2],
```
```
Qian [28], Qian et al. [29], Zhang et al. [37]). A common feature of these results
```
is that the legal firm is able to sustainably differentiate the quality of its product
from that of the counterfeiters. This, however, possibly overlooks the case where the
counterfeiters interact repeatedly with the legal firm. In such a case, it makes sense
for counterfeiters to react to the differentiation efforts of the legal firm by adapting
their own products. By construction, our analysis captures the repeated interactions
between the genuine firm and the counterfeiter and illustrates the relevance of a
differentiable game approach to counterfeiting.
Second, we show that while under no circumstances will counterfeiting be wel-
comed by a legal firm, there are indeed circumstances under which the consumer
```
benefits from this illegal trade (the decrease in the price of the genuine good com-
```
```
pensates for the decrease in the brand reputation of this good). This result can serve
```
as a rationale for not fining consumers of fake products.
The rest of the paper is organized as follows: In Sect. 2, we introduce the model
and present the two considered scenarios. In Sect 3, the optimal strategies and out-
comes are determined in the no-counterfeiting scenario, which is our benchmark. In
Sect. 4, we characterize the equilibrium strategies and payoffs in the counterfeiting
```
scenario; and in Sect. 5, we compare the results of the two scenarios. Section 6 briefly
```
concludes.
8 Our approach also differs from that of dynamic general equilibrium models, which study innovation
```
in the case where intellectual property rights are poorly protected (see, e.g., Suzuki [34]). An
```
important difference between these models and the present paper is that we pay more attention to
the brand reputation and to the nature of the imperfect competition between the genuine firm and
the counterfeiter.
Non-deceptive Counterfeiting and Consumer … 257
2 Model
We consider a planning horizon [0, T ], with time t running continuously. The initial
date corresponds to the launch of a new product by an established legal manufacturer,
player l, and T to the end of the selling season. After T , the product loses its appeal
because of, e.g., a change of season for fashion apparel, or the arrival of a new version
```
of software. At an exogenously given intermediate date E ∈ (0, T ] a counterfeiter,
```
player c, enters the market and offers a fake product, which performs the same
functions as the legal product, e.g., typing a scientific paper in the case of software.
```
Denote by pl (t) the price of the manufacturer’s product at time t ∈ [0, T ] and by
```
```
pc (t) the price of the copied product at t ∈ [E, T ] .
```
```
Denote by R (t) the manufacturer’s brand reputation, to which we can also refer as
```
goodwill or brand equity. In the absence of counterfeiting, the demand for the legal
firm is given by
```
ql (t) = max
```
```
{
```
0, ˜δl
√
```
R (t) − ˜βl pl (t)
```
```
}
```
, t ∈ [0, T ] ,
and in the scenario with counterfeiting the demand functions for the legal firm and
the counterfeiter are given by
```
ql1 (t) = max
```
```
{
```
0, ˜δl
√
```
R (t) − ˜βl pl1 (t)
```
```
}
```
```
, t ∈ [0, E), (1)
```
```
ql2 (t) = max
```
```
{
```
0, δl
√
```
R (t) − βl pl2 (t) + γpc (t)
```
```
}
```
```
, t ∈ [E, T ] , (2)
```
```
qc (t) = max
```
```
{
```
0, δc
√
```
R (t) − βc pc (t) + γpl2 (t)
```
```
}
```
```
, t ∈ [E, T ] , (3)
```
```
where ˜δl , δl , δc and βj, j ∈ {l, c} are positive parameters and γ ≥ 0 with βj > γ,
```
that is, the direct-price effect is larger than the cross-price effect. 9 The subscripts 1
and 2 are used to distinguish between the two periods, that is, before and after the
counterfeiter’s entry.
Remark 1 The fake product is non-deceptive, meaning that the buyer knows per-
fectly well that the product is not genuine. To illustrate, think of a consumer pur-
chasing an illegal copy of software on the Internet, or a tourist buying a Lancel bag
from a street seller in Paris.
We make the following comments on the above demand functions:
1. We show in Appendix 1 that these demand functions are obtained at each date by
maximizing the following consumer’s utility function:
```
U (ql , qc, y) = σl
```
√
Rql + σc
√
Rqc − κl q
2l
2 −
κc q2c
2 − ψql qc + y,
9 To study the interactions between firms in a dynamic setting it is most convenient to use linear
```
demand function (see, i.e., Cellini and Lambertini [6]).
```
258 B. Crettez et al.
subject to the budget constraint given by
pl ql + pc qc + y = I ,
```
where: y is a composite good; I the consumer’s income; and σl , σc, ψ, κl and κc are
```
positive parameters. The derivation of demand functions from utility maximiza-
```
tion provides a micro-foundation for the specifications in (1)–(3).10 Assuming
```
that the set of consumers can be represented by a single consumer at each date
is probably the simplest setting that allows us to the study the welfare effects of
counterfeiting.11
2. The demands for the genuine product, with and without the presence of a fake
good, are structurally different, that is, ˜δl  = δl and ˜βl  = βl , with ˜δl > δl and
```
˜βl < βl . Put differently, setting pc (t) = 0 in the duopoly market does not yield
```
the demand in the monopoly market.
3. The demand functions have the familiar affine shape, with, however, the additional
feature that the market potential is not a given constant but depends positively
on the brand reputation. The square root function is to account for marginal
decreasing returns in reputation.
4. As expected, each demand is decreasing in own price and increasing in competi-
tor’s price.
The manufacturer can increase the brand reputation by investing in advertising.
The evolution of the brand’s reputation is described by the following linear differen-
tial equation:
```
˙R (t) = ka (t) − σR (t) , R (0) = R0 > 0, (4)
```
```
where a (t) is the advertising effort of the legal producer at time t, k > 0 is an
```
efficiency parameter, and σ is the decay rate. 12 Following a substantial literature in
```
both optimal control and differential games (see, e.g., the book by Jørgensen and
```
10 A similar approach can be founded in Lai and Chang [22].
11 By contrast with the vertical product differentiation model used in several papers in the literature
```
(see inter alia Banerjee [1], Di Liddo [12], Zhang et al. [37]), in our approach the “representative
```
consumer”buys both the genuine and the fake product. It is possible, however, to give an alternative
derivation of the linear demand functions and the quadratic objective under which some consumers
do not buy any product, some consumers buy the two kinds of products and some other consumers
```
buy one kind of good only (see Martin [26]). A general discussion of demand functions can be
```
```
found in Huang et al. [20] (see especially Sect. 2.2). The fact that some consumers buy both genuine
```
goods and counterfeits, is documented, e.g., in Kapferer and Michaut [21] or Stöttinger and Penz
[33]. Thus, it seems acceptable to assume that the representative consumer buys both the genuine
good and the counterfeit.
```
12 We do not take into account word-of-mouth communication effects (see Remark 2 below). For
```
instance, Givon et al. [17] studies on an innovation diffusion model where pirates play an important
```
role in converting potential users into users and even buyers of the software (they show that this
```
effect was at work in the diffusion on spreadsheets and word processors during the 1990s in the
```
United Kingdom). Peres et al. [27] review the literature on innovation diffusion that, in addition to
```
word-of-mouth communications, incorporates network externalities and social signals.
Non-deceptive Counterfeiting and Consumer … 259
```
Zaccour [23] and the survey by Huang et al. [19]), we suppose that the advertising
```
cost is convex increasing and given by the quadratic function
```
Cl (a) = ω2 a2 (t) ,
```
where ω is a positive parameter. Further, we suppose that the marginal production
costs of both players are constant and we set them equal to zero. This is not a severe
assumption as adding costs will have only a quantitative impact on the results without
altering the qualitative insights.
The legal producer maximizes its stream of profit over the planning horizon. 13
Its optimization problem is defined as follows:
```
maxpl1(t), pl2 (t), a1(t), a2 (t) l =
```
[∫ E
0
```
(
```
```
pl1 (t)
```
```
(
```
```
˜δl√R (t) − ˜βl pl1 (t)
```
```
)
```
```
− ω2 a21 (t)
```
```
)
```
dt +
∫ T
E
```
(
```
```
pl2 (t)
```
```
(
```
δl
√
```
R (t) − βl pl2 (t) + γpc (t)
```
```
)
```
```
− ω2 a22 (t)
```
```
)
```
dt
]
```
(5)
```
- S (R (T )) ,
```
subject to (4),
```
```
where S (R (T )) is the salvage value of the brand at T , which captures the potential
```
future payoffs that the manufacturer can derive from other products having the same
brand name. We suppose that the salvage value can be well approximated by a linear
```
function, that is, S (R (T )) = sR (T ). Clearly, this is a simplifying assumption and
```
there is no conceptual difficulty in adopting a non-linear salvage value. However,
retaining a non-linear function would come at the cost of complicating consider-
ably the computations, without adding any qualitative gain in terms of our research
questions.
The counterfeiter’s optimization problem is given by
```
maxpc (t) c =
```
∫ T
E
```
pc (t)
```
```
(
```
δc
√
```
R (t) − βc pc (t) + γpl2 (t)
```
```
)
```
```
dt, t ∈ [E, T ] . (6)
```
As the counterfeiter’s decision does not affect the dynamics, its optimization problem
is equivalent to solving the following static one:
```
maxpc (t) πc = maxpc (t) pc (t)
```
```
(
```
δc
√
```
R (t) − βc pc (t) + γpl2 (t)
```
```
)
```
, ∀t ∈ [E, T ] .
To address our research questions, we shall characterize and compare the solutions
in the following two scenarios:
13 As the producer’s problem is defined on a short horizon, we do not include a discount factor in
the objective functional.
260 B. Crettez et al.
No Counterfeiting. The product cannot be copied and the only demand is legal.
The manufacturer then solves the following optimal control problem:
```
maxpl (t), a(t) Nl = maxpl (t), a(t)
```
∫ T
0
```
(
```
```
pl (t)
```
```
(
```
```
˜δl√R (t) − ˜βl pl (t)
```
```
)
```
```
− ω2 a2 (t)
```
```
)
```
```
dt + sR (T ) ,
```
```
(7)
```
```
˙R (t) = ka (t) − σR (t) , R (0) = R0,
```
where the superscript N refers to no counterfeiting. This is our benchmark sce-
nario, which corresponds either to a situation where the product life cycle is so
short that illegal producers do not have enough time to enter the market or to a
case where the institutions acting against counterfeiting are highly efficient.
Counterfeiting. Entry of the illegal producer occurs at time E ≤ T . The counter-
feiter and the manufacturer play a finite-horizon differential game during the time
interval [E, T ]. The manufacturer maximizes
Cl2 =
∫ T
E
```
(
```
```
pl2 (t)
```
```
(
```
δl
√
```
R (t) − βl pl2 (t) + γpc (t)
```
```
)
```
```
− ω2 a22 (t)
```
```
)
```
```
dt + sR (T ) ,
```
```
subject to (4) and R(E),
```
```
and the counterfeiter maximizes (6). A Nash equilibrium will be sought and the
```
```
equilibrium state and strategy will be superscripted with C (for counterfeiting). To
```
this Nash equilibrium we will associate a value function W l to the manufacturer
problem over the horizon [E, T ]. Next, we solve the following maximization
problem over the horizon [0, E]:
Cl1 =
∫ E
0
```
(
```
```
pl1 (t)
```
```
(
```
```
˜δl√R (t) − ˜βl pl1 (t)
```
```
)
```
```
− ω2 a21 (t)
```
```
)
```
```
dt + W l (E, R (E)).
```
By comparing the outcomes of the two scenarios, we will be able to measure
the impact of counterfeiting on the manufacturer’s profit and on the consumer. We
henceforth omit the time argument when no ambiguity may arise.
Remark 2 The closest papers to ours are Buratto et al. [4], Crettez et al. [10],
Biancardi et al. [3] and we wish to point out the following important differences
```
between these three contributions. With respect to Buratto et al. (ibid): (i) The demand
```
functions are different. In particular, in Buratto et al. [4] the demand functions are
```
structurally the same with and without counterfeiting. (ii) The demand functions
```
```
adopted here are micro-founded. (iii) The dynamics are different in two respects.
```
First, in Buratto et al., the illegal firm also advertises the product, which increases
the reputation of the legal brand. Here, the counterfeiter does not engage in such
activities, which is probably more in line with what is observed empirically. Sec-
```
ond, our dynamics include a decay rate to account for consumer forgetting. (iv) The
```
Non-deceptive Counterfeiting and Consumer … 261
strategies in the counterfeiting scenario are feedback, which is conceptually more
```
attractive than open-loop strategies. (v) And lastly, here, all results are analytical.
```
The main result obtained in Buratto et al. is that counterfeiting can increase the legal
firm’s profit, notably if the later can benefit from the advertising chosen by the coun-
```
terfeiter. We obtain a different conclusion. With respect to Crettez et al. (ibid): (i) The
```
```
demand function is slightly different. (ii) The present paper deals with counterfeiting
```
```
whereas Crettez et al. (ibid) also consider imitation more broadly conceived (e.g.,
```
```
knockoffs). (iii) Crettez et al. assume that the evolution of the incumbent’s brand rep-
```
utation also depends on the entrant’s sales during the duopoly period. They notably
show that the incumbent will price and advertise at a lower level before entry, inde-
pendently on whether the entrant will harm or not its brand reputation. Here, as was
mentioned above, we do not consider dilution or promotion effects. This is because
we are interested in the welfare effects of counterfeiting. For instance, it is clear that
in the presence of dilution or promotion effects, counterfeiting can be either welfare
decreasing or welfare increasing. To better understand the welfare effects of counter-
feiting, we concentrate on the case where counterfeiting has neutral effects on brand
```
reputation. 14 With respect to Biancardi et al. (ibid): (i) The demand functions are
```
```
different (in Biancardi et al. the demand functions are not micro-funded and they are
```
```
assumed to be proportional to the brand reputation). (ii) In contrast with the present
```
paper, Biancardi et al. pay attention to the case where whenever the counterfeiters are
caught, they are forced to pay a fine proportional to the quantity sold which is related
```
to the legal firm. (iii) The authors carry out a numerical analysis of a feedback-Nash
```
equilibrium and show that under specific values for the parameters of the model, the
genuine producer can be better off in the presence of counterfeiting rather than in its
absence.
3 No Counterfeiting
In this section, we characterize the optimal solution in the absence of counterfeiting
and derive some properties.
```
Denote by Vl (t, R (t)) : [0, T ] × R+ → R+ the value function of the legal firm.15
```
The following proposition provides the optimal solution.
14 According to Qian [28] “counterfeits have both advertising effects for a brand and substitution
effects for authentic products, additionally the effects linger for some years. The advertising effect
dominates the substitution effect for high-end authentic-product sales, and the substitution effect
the advertising effect for low-end product sales. Our model refers to the case where these two effects
are small. ”.
```
15 As a reminder, the value function gives the optimal payoff that can be obtained from (t, R (t)),
```
assuming that optimal policies are followed.
262 B. Crettez et al.
Proposition 1 In the absence of counterfeiting, the optimal pricing and advertising
policies are given by
```
pNl (t, R (t)) = pNl (R (t)) =
```
˜δl
2 ˜βl
√
```
R (t), (8)
```
```
aN (t, R (t)) = aN (t) = k
```
4σ ˜βl ω
```
( ˜δ2l + (4σ ˜βl s − ˜δ2l )eσ(t−T ) ), (9)
```
and the brand’s reputation trajectory by
```
RN (t) = R0e−σt + k
```
2
ω
4σ ˜βl s − ˜δ2l
8σ2 ˜βl
```
(
```
```
eσ(t−T ) − e−σ(T +t)
```
```
)
```
- k
2
ω
˜δ2l
4σ2 ˜βl
```
(
```
1 − e−σt
```
)
```
.
```
(10)
```
Proof See Appendix 2. 
The above proposition calls for the following remarks. First, it is easy to see that
the advertising level is strictly positive at each instant of time, which, along with
```
the assumption that R0 > 0, implies that RN (t) is strictly positive for all t ∈ [0, T ].
```
Consequently, the price is also strictly positive, and hence, the solution is indeed
interior. Second, from the proof in Appendix 2, we see that the optimal advertising
```
effort is dictated by the familiar rule of marginal cost (given by wa) equals marginal
```
revenue, which is measured by k ∂Vl∂R , that is, the marginal efficiency of advertising
in raising reputation times the shadow price of the brand’s reputation, measured by
the derivative of the value function with respect to reputation. Third, the firm adopts
a pricing policy that follows reputation: the higher the reputation, the higher the
price. This is observed empirically and is due to the fact that the market potential is
increasing in the brand’s reputation. Finally, the strategies vary as follows with the
different parameter values:
˜δl ˜βl k σ ω s
pNl + −
aN + − + − − +.
We note that the price only depends on the demand function parameters, namely, ˜δl
and ˜βl , and is increasing in market size parameter ˜δl and decreasing in consumer’s
sensitivity to price ˜βl . Advertising expenditures increase with ˜δl , with advertising
efficiency k, and with the marginal salvage value of reputation s, and they decrease
with advertising cost ω, with the decay rate σ and the consumer’s sensitivity to price
˜βl . These results are fairly intuitive.
Proposition 2 The optimal advertising policy is monotonically decreasing over time
if, and only if, s ≤ ˜δ2l4σ ˜βl.
Non-deceptive Counterfeiting and Consumer … 263
Proof It suffices to compute
```
˙aN (t) = ke
```
```
σ(t−T )
```
4 ˜βl ω
```
(
```
− ˜δ2l + 4σ ˜βl s
```
)
```
,
to get the result. 
The intuition behind this result is as follows: if the marginal value of the brand
reputation at the end of the planning horizon is sufficiently low, then the firm should
start by advertising at a relatively high level and decrease it over time. Early invest-
ments in advertising allow the firm to benefit from a high reputation for a longer
period of time. In particular, if the salvage value is zero, then the condition in the
above proposition will always be satisfied.
The evolution of the price over time follows the evolution of reputation. Indeed,
```
˙pNl (R (t)) =
```
```
˜δl ˙R (t)
```
```
4 ˜βl√R (t)
```
.
It can be easily verified that
```
˙RN (t) ≥ 0 ⇔ s ≥ 8σ
```
```
2 ˜βl ωR0e−σt − k2 ˜δ2l(2e−σt − eσ(t−T ) − e−σ(T +t))
```
4σ ˜βl k2
```
(
```
```
eσ(t−T ) + e−σ(T +t)
```
```
) .
```
The above inequality, which involves all the model’s parameters, states that, for
the reputation to be increasing over time, the marginal salvage value must be high
enough. Note that if the brand enjoys a large initial reputation value R0 or if the
advertising cost ω is high, then the condition becomes harder to satisfy. On the other
hand, the condition is easier to satisfy when the advertising efficiency k is high.
It is shown in Appendix 2 that the value function is linear and given by
```
Vl (t, R (t)) = z (t) R (t) + y (t) ,
```
where
```
z (t) =
```
˜δ2l
4σ ˜βl+
4σ ˜βl s − ˜δ2l
4σ ˜βle
```
σ(t−T ) ,
```
```
y (t) = k
```
2
16σ3ω ˜β2l
```
( ˜σδ4
```
l
```
2 (T − t) + ˜δ
```
```
2l (4σ ˜βl s − ˜δ2l )(1 − eσ(t−T ) ) + (4σ ˜βl s − ˜δ2l )2
```
```
4 (1 − e
```
```
2σ(t−T ) )
```
```
)
```
.
```
Proposition 3 The coefficients z (t) and y(t) are nonnegative for all t ∈ [0, T ].
```
```
Proof The coefficient z (t) is clearly strictly positive for all t ∈ [0, T ]. To show that
```
```
y (t) ≥ 0 for all t, it suffices to note that its derivative over time
```
264 B. Crettez et al.
```
˙y(t) = − k
```
2
32σ2ω ˜β2l
```
(
```
˜δ2l +
```
(
```
4σ ˜βl s − ˜δ2l
```
)
```
```
eσ(t−T )
```
```
)2
```
```
is strictly negative and that y(T ) = 0. 
```
```
The implications of the above proposition are as follows: (i) the value function is
```
```
strictly increasing in reputation; and (ii) even if the firm is new, that is, if its reputation
```
at initial instant of time is zero, it can still secure a nonnegative profit.
In the absence of counterfeiting, the legal firm’s payoff over the whole planning
horizon is given by
```
Vl (0, R0) =
```
```
( ˜δ2
```
l
4σ ˜βl+
4σ ˜βl s − ˜δ2l
4σ ˜βle
−σT
```
)
```
```
R0 + (11)
```
k2
16σ3ω ˜β2l
```
( ˜
```
σδ4l
2 T + ˜δ
```
2l (4σ ˜βl s − ˜δ2l )(1 − e−σT ) + (4σ ˜βl s − ˜δ2l )2
```
```
4 (1 − e
```
```
−2σT )
```
```
)
```
.
This value will be compared to the total profit that the legal firm obtains in the
presence of counterfeiting. Finally, the reputation of the legal firm by the terminal
planning date is
```
RN (T ) = R0e−σT + k
```
2
ω
4σ ˜βl s − ˜δ2l
8σ2 ˜βl
```
(
```
```
1 − e−2σT )
```
```
)
```
- k
2
ω
˜δ2l
4σ2 ˜βl
```
(
```
1 − e−σT
```
)
```
.
4 Counterfeiting
The manufacturer’s optimization problem is in two stages: between 0 and E, it is a
```
dynamic optimization problem with the solution being (qualitatively) similar to the
```
```
problem without counterfeiting; between E and T , the two agents play a noncoop-
```
erative game and a Nash equilibrium is sought. To obtain a subgame-perfect Nash
```
equilibrium (SPNE) in the two-stage problem, we first solve the second stage with
```
```
RC (E) as the initial value of the brand’s reputation.
```
4.1 The Duopoly Equilibrium
In this second-stage game, the counterfeiter solves the following static optimization
```
problem:
```
```
maxpc (t) pc (t)
```
```
(
```
δc
√
```
R (t) − βc pc (t) + γpl2 (t)
```
```
)
```
, ∀t ∈ [E, T ] ,
Non-deceptive Counterfeiting and Consumer … 265
while the legal firm solves
```
Cl2 = maxpl2 (t), a2 (t)
```
∫ T
E
```
(
```
```
pl2 (t)
```
```
(
```
δl
√
```
R (t) − βl pl2 (t) + γpc (t)
```
```
)
```
```
− ω2 a22 (t)
```
```
)
```
dt
```
+sR (T ) ,
```
```
subject to (4) and RC (E).
```
Denote by ϕi the strategy of player i = l, c. We assume that each player imple-
ments a feedback strategy that selects the control action according to the rule
```
ui(t) = ϕi(t, R(t)), where
```
```
ul (t) = (pl2 (t) , a2 (t)) ∈ R2+ and uc(t) = (pc (t)) ∈ R+.
```
```
This means that firm i = l, c observes the state (t, R(t)) of the system and then
```
chooses its action as prescribed by the decision rule ϕi.
```
Definition 1 A pair (ϕl , ϕc) of functions ϕi : [E, T ] × R+ −→ Rmi , i = l, c, is a
```
feedback-Nash equilibrium if
```
Cl2(ϕl , ϕc) ≥ Cl2(u1, ϕc), ∀ul ∈ R2+,
```
```
c(ϕl , ϕc) ≥ c(ϕl , uc), ∀uc ∈ R+.
```
```
To characterize a feedback-Nash equilibrium, denote by W l (t, R (t)) : [E, T ] ×
```
R+ → R the legal firm’s value function. The following proposition gives the equi-
librium solution of the duopoly game. 16
Proposition 4 Assuming that the counterfeiter enters the market at date E ≤ T , then
the feedback-Nash pricing and advertising strategies are given by
```
pCl2 (t, R (t)) = pCl2 (R (t)) = 2βcδl + δcγ4β
```
cβl − γ2
√
```
R (t), (12)
```
```
pCc (t, R (t)) = pCc (R (t)) = 2βl δc + δl γ4β
```
cβl − γ2
√
```
R (t), (13)
```
```
aC2 (t, R (t)) = aC2 (t) = kω
```
```
(
```
```
 + (s − ) e−σ(T −t)
```
```
)
```
```
, (14)
```
where
 = βlσ
```
( 2β
```
cδl + δcγ
4βcβl − γ2
```
)2
```
> 0.
16 See Haurie et al. [18] for details on determining a feedback-Nash equilibrium in differential
games.
266 B. Crettez et al.
The reputation trajectory is given by
```
RC2 (t) = R (E) e−σ(t−E) + k
```
2
σω
```
(
```
```
1 − e−σ(t−E)
```
```
)
```
- k
```
2 (s − )
```
2σω
```
(
```
```
1 − e−2σ(t−E)
```
```
)
```
```
e−σ(T −t) .
```
```
(15)
```
Proof See Appendix 2 
The results in the above proposition deserve the following comments. First, by the
same arguments provided after Proposition 1, it is easy to verify that the equilibrium
solution is indeed interior.
Second, the pricing policies are increasing in the legal firm’s reputation and are
invariant over time, that is, the time dependency is only through the reputation value.
Interestingly, the ratio of the two prices is constant, that is, independent of the state
R and of time. Indeed,
```
pCl2 (R (t))
```
```
pCc (R (t)) =
```
2βcδl + δcγ
2βl δc + δl γ .
It is shown in Appendix 1 that the assumptions made on the utility function imply that
the above ratio is always larger than one, which means that the price of the genuine
product is always higher than the price of the fake one. Clearly, this is in line with
what is observed in the market.
Third, the advertising policy is again determined by equating the marginal cost
ωa to the marginal revenue given by k ∂W l∂R and is monotonically decreasing over time
```
if s ≤ . Further, because the advertising policy is independent of R (t) and of the
```
counterfeiter’s entry date, it may appear at first glance that the legal firm’s advertising
policy is not affected by entry. This is clearly not the case since advertising depends
on , which involves the counterfeiter’s parameters, i.e., βc and γ.
Finally, we show in Appendix 2 that the value function of the second-stage problem
is linear and given by
```
W l (t, R (t)) = x (t) R (t) + v (t) ,
```
where
```
x (t) =  + (s − ) e−σ(T −t) , (16)
```
```
v (t) = k
```
2
2ω
```
(
```
```
2(T − t) + (s − )
```
2
```
2σ (1 − e
```
```
2σ(t−T ) ) + 2(s − )
```
```
σ (1 − e
```
```
σ(t−T ) )
```
```
)
```
.
```
(17)
```
Non-deceptive Counterfeiting and Consumer … 267
4.2 The First-Stage Optimal Solution
Inserting the equilibrium strategies pCc , pCl and aC in the legal firm’s second-stage
profit ultimately yields a function that depends on the reputation value at counter-
```
feiter’s entry time E, which we denote by W l (E, R (E)). This function is the salvage
```
value in the first-stage optimization problem of the legal firm, which is,
```
maxpl1(t), a1(t) Cl =
```
∫ E
0
```
(
```
```
pl1 (t)
```
```
(
```
```
˜δl√R (t) − ˜βl pl1 (t)
```
```
)
```
```
− ω2 a21 (t)
```
```
)
```
```
dt + W l (E, R (E))
```
subject to the reputation dynamics
```
˙R (t) = ka1 (t) − σR (t) , R (0) = R0.
```
Observe that this optimization problem is very similar to the one solved in the scenario
without counterfeiting. The main difference is the duration of the planning horizon
and of the transversality condition. Adapting the proof of Proposition 1, we get the
following optimal solution on [0, E]:
Proposition 5 The optimal pricing and advertising policies are given by
```
pCl1 (t, R1 (t)) = pCl1 (R1 (t)) = ˜δl2 ˜β
```
l
√R
```
1 (t),
```
```
aC1 (t, R1 (t)) = aC1 (t) = k4σ ˜β
```
l ω
```
(˜
```
δ2l
```
(
```
```
1 − eσ(t−E)
```
```
)
```
- 4σ ˜βl ( + (s − ) e−σ(T −E) )eσ(t−E)
```
)
```
,
and the reputation stock by
```
RC1 (t) = R0e−σt + k
```
2
ω
```
4σ ˜βl x(E) − ˜δ2l
```
8σ2 ˜βl
```
(
```
```
eσ(t−E) − e−σ(E+t)
```
```
)
```
- k
2
ω
˜δ2l
4σ2 ˜βl
```
(
```
1 − e−σt
```
)
```
.
Proof See Appendix 2. 
The same comments made after Proposition 1 remain valid, qualitatively speaking,
```
and therefore there is no need to repeat them. Substituting for x(E) in RC1 (t) we obtain
```
```
RC1 (t) = R0e−σt + k2ω4σ ˜βl
```
```
( + (s − ) e−σ(T −E)) − ˜δ2
```
l
8σ2 ˜βl
```
(
```
```
eσ(t−E) − e−σ(E+t)
```
```
)
```
- k2ω˜δ
2l
4σ2 ˜βl
```
(1 − e−σt ) ,
```
```
(18)
```
and in particular, the following value for reputation at the counterfeiter’s entry date:
```
RC1 (E) = R0e−σE + k28σ2 ˜βl ω((4σ ˜βl( + (s − ) e−σ(T −E))− ˜δ2l) (1 − e−2σE )+ 2˜δ2l(1 − e−σE )).
```
The reputation by the end of the planning horizon is
268 B. Crettez et al.
```
RC2 (T ) = RC1 (E) e−σ(T −E) + k
```
2
σω
```
(
```
```
1 − e−σ(T −E)
```
```
)
```
- k
```
2 (s − )
```
2σω
```
(
```
```
1 − e−2σ(T −E)
```
```
)
```
.
```
It is shown in Appendix 2 that the first-stage value function Zl (t, R (t)) is linear,
```
that is,
```
Zl (t, R (t)) = m (t) R (t) + n (t) ,
```
```
where the coefficients m (t) and n (t) are given by
```
```
m (t) =
```
˜δ2l
4σ ˜βl+
```
4σ ˜βl x(E) − ˜δ2l
```
4σ ˜βle
```
σ(t−E) ,
```
```
n (t) = − k
```
2
4σω
⎛
⎝ ˜δ4l
8σ ˜β2lt + ˜δ
2l
```
( 4σ ˜β
```
```
l x(E) − ˜δ2l
```
4σ2 ˜β2le
−σE
```
)
```
eσt +
```
( 4σ ˜β
```
```
l x(E) − ˜δ2l
```
4σ ˜βle
−σE
```
)2
```
e2σt
⎞
⎠
- k
2
16σ3ω ˜β2l
```
( σ ˜δ4
```
l
2 E + ˜δ
```
2l (4σ ˜βl x(E) − ˜δ2l ) + (4σ ˜βl x(E) − ˜δ2l )2
```
4
```
)
```
- v (E) .
```
Note that the above coefficients involve x (E) and v (E), that is, the coefficients of
```
the second-stage value function evaluated at entry time E. As alluded to it earlier,
```
W l (E, R (E)) plays the role of a salvage value in the first-stage optimization problem
```
```
of the legal firm. Substituting for x(E) and v(E), and next for m (t) and n (t) in
```
```
Zl (t, R (t)), we obtain the value function for the legal firm on [0, E], that is,
```
```
Zl (t, R (t)) = 14σ ˜β
```
l
```
(˜
```
```
δ2l + eσ(t−E)
```
```
)
```
```
R (t) + k
```
```
2 ˜δ4l (E − t)
```
32σ2ω ˜β2l
+
k2
```
(
```
```
1 − eσ(t−E)
```
```
)
```
64σ3ω ˜β2l
```
(
```
4˜δ2l + 
```
(
```
```
1 + eσ(t−E)
```
```
))
```
- k
2
2ω
```
(
```
```
2(T − E) + (s − )
```
2
```
2σ (1 − e
```
```
2σ(E−T ) ) + 2(s − )
```
```
σ (1 − e
```
```
σ(E−T ) )
```
```
)
```
,
where
 = 4σ ˜βl
```
(
```
```
 + (s − ) e−σ(T −E)
```
```
)
```
− ˜δ2l .
To obtain the total profit that the legal firm gets in the game with counterfeiting,
```
it suffices to evaluate the above value function at (0, R (0)), which yields
```
```
Z l (0, R (0)) = 14σ ˜βl(˜δ2l + e−σE))R0 + k
```
2 ˜δ4l E
32σ2ω ˜β2l
+k
```
2(1 − e−σE )
```
64σ3ω ˜β2l
```
(4˜δ2
```
l + 
```
(1 + e−σE ))
```
- k22ω
```
(
```
```
2(T − E) + (s − )22σ (1 − e2σ(E−T ) ) + 2(s − )σ (1 − eσ(E−T ) )
```
```
)
```
```
. (19)
```
Non-deceptive Counterfeiting and Consumer … 269
Before comparing the results of the two scenarios, it is of particular interest to
look at is the impact of the counterfeiter’s entry date on the legal firm’s pricing and
advertising policies and on the reputation of the brand. As we shall see, this impact
```
hinges on the sign of the difference between the instantaneous (static) revenue of the
```
```
legal firm without counterfeiting (which we denote by rNl (t)) and its revenue with
```
```
counterfeiting (denoted rCl (t)) for any given reputation level R (t). Substituting for
```
```
pNl (t) from (8) and for pCl2 (t) and pCc (t) from (12) and (13) in the relevant revenue
```
functions, we get
```
rNl (t) = pNl (t)
```
```
(
```
```
˜δl√R (t) − ˜βl pNl (t)
```
```
)
```
=
˜δ2l
4 ˜βl
```
R (t) ,
```
```
rCl (t) = βl (2βcδl + δcγ)
```
2
```
(
```
4βcβl − γ2
```
)2 R (t) .
```
We have the following result.
```
Lemma 1 For any given reputation level R (t), the revenue of the legal firm without
```
```
counterfeiting rNl (t)) is higher than its revenue with counterfeiting (denoted rCl (t)).
```
More formally, the following inequality holds true:
 =
˜δ2l
4 ˜βl
− βl
```
( 2β
```
cδl + δcγ
4βcβl − γ2
```
)2
```
```
> 0. (20)
```
Proof See Appendix 2. 
The proof of the above lemma relies on the general result that in imperfect compe-
tition, firms realize higher profits when they compete in quantities à la Cournot than
in prices à la Bertrand. This result also strongly depends on the micro-foundations
for the demand functions.
Noting that  can also be written as
 = 1
4 ˜βl
```
(
```
˜δ2l − 4σ ˜βl 
```
)
```
,
the effect of the counterfeiter’s entry date on the legal firm’s pricing and advertising
policies and on the reputation of the brand is given in the following result.
Proposition 6 On [0, E], the legal firm’s advertising, pricing, and reputation are
increasing in the counterfeiter’s entry date E.
270 B. Crettez et al.
Proof It suffices to compute the derivatives
```
∂aC1 (t)
```
∂E =
k
ω e
```
σ(t−E) ,
```
```
∂RC1 (t)
```
∂E =
k2
2σω
```
(
```
```
eσ(t−E) − e−σ(E+t)
```
```
)
```
,
```
∂pCl1 (t)
```
∂E =
˜δl
```
4 ˜βl√R1 (t)
```
```
∂RC1 (t)
```
∂E ,
and to use Lemma 1 to get the result. 
Intuitively, one would expect the price to be increasing in E, as the need to face
price competition is less urgent for the legal firm when the entry date is later. Fur-
ther, during the monopoly period [0, E], the legal firm is the only beneficiary from
advertising investment in reputation, and therefore, the later is the counterfeiter’s
entry date, the higher is the incentive to invest in advertising to raise the value of the
```
(private good) reputation.
```
Remark 3 During the duopoly period [E, T ], the advertising, reputation, and pricing
trajectories vary as follows in terms of entry date E:
```
∂aC2 (t)
```
∂E = 0,
```
∂RC2 (t)
```
∂E =
k2
2ω e
```
−σ(t−E)
```
```
(
```
```
2e−σ(T −E)s + e−2σE
```
```
(
```
```
1 − 2e−σ(T +E)
```
```
)
```
+
˜δ2l
4σ ˜βl− 
```
)
```
> 0,
```
∂pCl2 (t)
```
∂E =
2βcδl + δcγ
4βcβl − γ2
1
```
2√R (t)
```
```
∂RC2 (t)
```
∂E > 0.
The reputation and the counterfeiter’s price are increasing with respect to the date
of entry E. As shown above, the later the date of entry, the higher the values of
advertising and reputation before entry. Since reputation after E depends on the level
achieved at this date, the later the date of entry, the higher the level of reputation
after entry. And since the legal firm’s price increases with its reputation, the later
the entry date, the higher is this price. Observe also that advertising does not depend
on the date of entry. This is because advertising does not depend on the legal firm’s
```
reputation but only on the date at which it is carried out and the final date (to put it
```
differently, advertising does not depend on a state variable, which would take into
```
account what happened at date E). Notice that this property also holds for the case
```
where there is no counterfeiting.
Of particular interest is the impact of the counterfeiter’s entry date on the legal
firm’s total profit.
Non-deceptive Counterfeiting and Consumer … 271
Proposition 7 The impact of the counterfeiter’s entry date on the legal firm’s total
profit is positive and given by
```
∂Zl (0, R0; E)
```
∂E = π1
```
(
```
```
RC1 (E; E), aC1 (E; E), pCl1(E; E)
```
```
)
```
− π2
```
(
```
```
RC2 (E; E), aC2 (E; E), pCl2(E; E)
```
```
)
```
> 0.
Proof See Appendix 2. 
The proposition first establishes that the impact of the counterfeiter’s entry
date on the legal firm’s total profit is equal to the difference between the instan-
taneous profit of the legal firm just before the counterfeiter’s entry, denoted by
π1
```
(
```
```
RC1 (E; E), aC1 (E; E), pCl1(E; E)
```
```
)
```
, and its instantaneous profit just after the coun-
terfeiter’s entry, denoted by π2
```
(
```
```
RC2 (E; E), aC2 (E; E), pCl2(E; E)
```
```
)
```
```
. 17 Since RC1 (E; E) =
```
```
RC2 (E; E), and since, from Lemma 1, we know that the instantaneous profit before
```
entry is higher than the instantaneous profit after entry, we see that the earlier the
counterfeiter enters the market, the greater is the legal firm’s loss, which is intuitive,
as entry changes the market from a monopoly to a duopoly.
Finally, as we assumed that the entry date is exogenous, it is of interest to check
how the counterfeiter’s equilibrium payoff varies with this parameter. The total coun-
terfeiter’s payoff is given by
Ec =
∫ T
E
```
pc (t)
```
```
(
```
δc
√
```
R (t) − βc pc (t) + γpl2 (t)
```
```
)
```
dt.
```
Substituting for the equilibrium values for pc (t)and pl2 (t) we get
```
Cc = βc
```
( 2β
```
l δc + δl γ
4βcβl − γ2
```
)2 ∫ T
```
E
```
R (t) dt.
```
Taking the derivative with respect to E, we have
∂Cc
∂E = βc
```
( 2β
```
l δc + δl γ
4βcβl − γ2
```
)2 ∂(∫ TE R (t) dt)
```
∂E ,
∂
```
(∫ T
```
```
E R (t) dt
```
```
)
```
```
∂E = −R (E) +
```
∫ T
E
```
∂R (t)
```
∂E dt.
The above equality has the following interpretation: On the one hand, an increase
in E leads to the loss of the profit at date E. On the other hand, from Remark 3, the
value of the goodwill is higher at any date after E, and so is the price of the legal
firm. This directly increases the counterfeiter’s demand.
```
17 The argument (E; E) of the reputation, advertising, and pricing variables is to specify that these
```
variables depend on the entry date E and that this date is also a parameter.
272 B. Crettez et al.
```
Now, from Eq. (18) in the text, we have
```
```
R(E) = RC1 (E) = R0e−σE + k28σ2 ˜βl ω((4σ ˜βl( + (s − ) e−σ(T −E))− ˜δ2l) (1 − e−2σE )+ 2˜δ2l(1 − e−σE )),
```
and from Remark 3, we know that
```
∂RC2 (t)
```
∂E =
k2
2ω e
```
−σ(t−E)
```
```
(
```
```
2e−σ(T −E)s + e−2σE
```
```
(
```
```
1 − 2e−σ(T +E)
```
```
)
```
+
˜δ2l
4σ ˜βl
− 
```
)
```
.
Therefore,
∫ T
E
∂R c2
∂E dt =
```
1 − e−σ(T −E)
```
σ
k2
2ω
```
(
```
```
2e−σ(T −E)s + e−2σE
```
```
(
```
```
1 − 2e−σ(T +E)
```
```
)
```
+
˜δ2l
4σ ˜βl− 
```
)
```
.
After some algebra we find that
∂
```
(∫ T
```
```
E R (t) dt
```
```
)
```
∂E = −R0e
−σE − sk2
2ωσ e
```
−σ(T −E) (2e−σ(T −E) − e−2σE − 1) (21)
```
− k
2 ˜δ2l
8ωσ2 ˜βl
```
(
```
```
e−2σE − 2e−σE + e−σ(T −E)
```
```
)
```
```
(22)
```
− k
2
```
ωσ (1 − e
```
```
−σ(T −E) ) (1 − e−2σE + e−3σE−σT ) . (23)
```
The right-hand side of the above equation is highly non-linear in all model’s
parameters and cannot be utterly signed. However, we see that for an R0 high enough,
we have ∂
```
(∫ T
```
```
E R(t)dt
```
```
)
```
∂E < 0, that is, the counterfeiter’s equilibrium payoff is decreasing
in the entry date.
5 Comparison
In this section, we compare the strategies and outcomes in the two scenarios. Further,
we determine the cost of counterfeiting to the legal firm and to the consumer.
5.1 Profit Comparison
We shall first compare the advertising policies with and without counterfeiting.
Proposition 8 The legal firm advertises more when there is no counterfeiting. That
```
is, aN (t) > aC (t), for all t in [0, T ]
```
Proof See Appendix 2. 
Non-deceptive Counterfeiting and Consumer … 273
Before interpreting the above result, we shall next compare the trajectories of
reputation and the prices in the two scenarios.
Proposition 9 At each instant of time, the legal brand enjoys a higher reputation
when there is no counterfeiting, and the legal firm sells throughout the whole planning
```
horizon at a higher price. That is, RN (t) > RC (t), and pNl (t) > pCl (t) for all t in
```
[0, T ].
Proof See Appendix 2. 
Proposition 9 shows that the impact of entry on reputation is felt at any instant of
time throughout the planning horizon, and not only after entry actually occurs. The
fact that a counterfeiter will enter the market influences the advertising behavior of
the legal firm during the monopoly period and this results in a loss of reputation even
before entry takes place.
The interpretation of these results is as follows: Counterfeiting induces a compet-
itive pressure on the legal firm pushing it to lower its price. Further, the legal firm
invests less in advertising because the consequent reward, namely, a higher reputation
and larger market size, is not fully appropriable in the counterfeiting scenario since
the illegal firm benefits for free from the advertising investments and the brand’s
reputation. This is a typical case where the counterfeiter enjoys a positive externality
without contributing at all to the building of reputation.
The above result differs from some of the findings in the literature, according to
which counterfeiting may stimulate innovation or the quality of the genuine good
```
(see Zhang et al. [37]). This occurs notably when there are network externalities and
```
```
R&D competition (Banerjee [2]) or imperfect information (Qian [28], Qian et al.
```
```
[29]). A common feature of these results is that the legal firm is able to sustainably
```
differentiate the quality of its product from that of the counterfeiters. This, however,
probably overlooks the case where the counterfeiters interact repeatedly with the legal
firm. In such a case, it makes sense for counterfeiters to react to the differentiation
efforts of the legal firm by adapting their own products. Here, we capture this reaction
by assuming that the reputation of the genuine good always positively affects the
reputation of the counterfeited product.
```
The following proposition shows that, for any given value of reputation R (t),
```
the legal firm obtains a higher total payoff in the no-counterfeiting case than in the
counterfeiting scenario.
```
Proposition 10 For any R (t) and all t ∈ [E, T ], we have W l (t, R(t)) < Vl (t, R(t)).
```
Proof See Appendix 2. 
The two preceding propositions imply the following corollary:
```
Corollary 1 We have W l (E, RC (E)) < Vl (E, RN (E)) .
```
274 B. Crettez et al.
Proof From Proposition 10, we have
```
W l (t, RC (t)) < Vl (t, RC (t))
```
```
and from Proposition 8, we have RN (E) > RC (E), so W l (E, RC (E)) < Vl (E, RN
```
```
(E)). 
```
The impact of counterfeiting on total profit is given in the following result.
Proposition 11 The total profit of the legal firm calculated by starting at any date t in
```
[0, E] is higher in the absence of counterfeiting. That is, Vl (t, RN (t)) > Zl (t, RC (t)).
```
Proof Denote by
```
(
```
```
RC (s) , aC (s) , pCl (s)
```
```
)
```
the equilibrium trajectory in the presence of
the counterfeiter and by π1
```
(
```
```
RC (s) , aC (s) , pCs (s)
```
```
)
```
the corresponding instantaneous
profit of the legal firm before the counterfeiter’s entry. The total payoff that the legal
firm realizes in the game starting at any t in [0, E] can be written as
Zl
```
(
```
```
t, RC (t)
```
```
)
```
=
∫ E
t
π1
```
(
```
```
pCl (s) , aC (s) , RC (t)
```
```
)
```
```
ds + W l (E, RC (E)),
```
≤
∫ E
t
π1
```
(
```
```
pCl (s) , aC (s) , RC (s)
```
```
)
```
```
ds + Vl (E, RC (E)),
```
```
≤ Vl (t, RN (t)).
```
The first inequality is due to Proposition 10, and the second inequality follows from
the optimality principle of dynamic programming. In particular, the total payoff in
```
the whole game is higher in the absence of counterfeiting, that is, Zl (0, R0) ≤ Vl
```
```
(0, R0). 
```
Independently of the fact that counterfeiting is illegal, its very presence means
competition for the legal firm, and consequently, the above result is not surprising. A
relevant question is how much counterfeiting costs the legal firm and how this loss
```
varies with the parameter values. The total loss is given by  = Vl (0, R (0)) −
```
```
Zl (0, R (0)). We note that  is increasing in R0 , which means that a company
```
```
having a high initial brand equity (or reputation) suffers more from counterfeiting
```
than a firm with a lower value.18
The main message from the above comparisons is that counterfeiting is under no
circumstances beneficial to the legal firm. Although these results sometimes involved
complicated proofs, they are somewhat expected. If this were not the case, then
legal firms would not invest much effort in deterring counterfeiting. 19 In the next
subsection, we shift the focus from the firm to the consumer.
```
18 This assertion can be established using Eqs. (11) and (16), and Lemma 1.
```
19 See El Harbi and Grolleau [16], however, for a review of some cases where counterfeiting can
be profit enhancing for the legal firm.
Non-deceptive Counterfeiting and Consumer … 275
5.2 Consumer Welfare Comparison
Standard consumer measures of surplus are difficult to use here since, in our setting,
there are two goods whose prices change over time. It is then better to study the
welfare effect of counterfeiting by comparing the equilibrium value of the consumer’s
utility function with and without counterfeiting.
First, at any t ∈ [0, E], the consumer’s optimization problem is
```
maxqlU (ql , 0, y) = σl
```
√
Rql − κl q
2l
2 + I − pl ql .
From the first-order optimality condition, we obtain ql = σl
√R
2κl and, for any t ∈ [0, E],
```
the equilibrium (indirect) utility value
```
```
U (ql , 0, y) = κl2 (ql )2 + I .
```
```
The above expression is the same with and without counterfeiting (only the value
```
```
of brand reputation and the quantity ql are different). Knowing that the brand’s reputa-
```
tion is lower under counterfeiting, we conclude unambiguously that the counterfeiter
causes a loss in welfare even during the monopoly period, that is, even before it enters
into play.
Now at any t ∈ [E, T ], the consumer’s optimization problem is
```
maxq l ,q cU (ql , qc, y) =
```
```
(
```
σl√Rql + σc√Rqc − κl q
2l
2 −
κc q2c
2 − ψql qc + I − pl ql − pc qc
```
)
```
.
Assuming an interior solution, we can show that the equilibrium value of the demand
for the legal product and the counterfeit are, respectively, given as follows:
```
qCl = κc
```
```
(
```
2κcκl σl − ψσcκl − ψ2σl
```
)
```
```
(
```
4κcκl − ψ2
```
) (
```
κcκl − ψ2
```
)
```
√
R,
```
qCc = κl
```
```
(
```
2κcκl σc − ψσl κc − ψ2σc
```
)
```
```
(
```
4κcκl − ψ2
```
) (
```
κcκl − ψ2
```
)
```
√
R.
```
Inserting these demands in U (ql , qc, y), it is easy to show that the equilibrium value
```
```
of the consumer (indirect) utility function can be written as U (qCl , qCc , yC ) = χC RC ,
```
where
χC = κ
2c X 21 + κ2l X 22 + 2ψκcκl X1X2
2
```
(
```
4κcκl − ψ2
```
)2 (
```
κcκl − ψ2
```
)2 ,
```
276 B. Crettez et al.
and
```
X1 =
```
```
(
```
2κcκl σl − ψσcκl − ψ2σl
```
)
```
,
```
X2 =
```
```
(
```
2κcκl σc − ψσl κc − ψ2σc
```
)
```
.
We first want to compare χC with χN where we recall that
χN = σ
2l
8κl.
Assume that RC = RN = R. We know, of course, that this is false in equilibrium,
but it does not matter as we are dealing with variables that are solutions to static
optimization problems. We know that the equilibrium price of the legal good is
higher without counterfeiting than with counterfeiting. Therefore, the equilibrium
```
value of the consumer’s utility function with counterfeiting is no lower (and indeed
```
```
is higher) than this value when there is counterfeiting. This is because the consumer
```
can always buy the same quantity of the legal good that he bought when there was
no counterfeiting, at a lower price. Since his income is constant, he can also buy the
fake good, and this increases his utility. This leads to the following:
Proposition 12 We have χN < χC .
The next result gives a sufficient condition for counterfeiting to be welfare improv-
```
ing for any t ∈ [E, T ], that is, χN RN (t) < χC RC (t).
```
Proposition 13 There exists ω, such that, for all ω, such that ω ≤ ω, counterfeiting
is welfare improving for all t in [E, T ].
Proof See Appendix 2. 
One explanation of this result is the following: When the advertising cost is high,
the legal firm invests less in this activity, which results in a lower value for the
brand’s reputation, and consequently, the market size is smaller. This in turn increases
competition between the two firms, and prices are lower, which is good news for the
consumer. In this case, the positive effect of price competition on welfare more than
compensates for the negative effect of the decrease in the legal firm’s reputation
```
(since accumulating reputation is costly, even in the absence of counterfeiting, the
```
```
negative effect of counterfeiting on reputation is small).
```
Though counterfeiting may enhance consumer welfare on the interval [E, T ], we
have seen that counterfeiting is unambiguously welfare decreasing on the interval
[0, E]. The question of the global impact of counterfeiting on welfare is thus pending.
The next result extends Proposition 13 to ensure that counterfeiting may improve
consumer welfare on the whole horizon.
Non-deceptive Counterfeiting and Consumer … 277
Proposition 14 There exists ω′, such that, for all ω, such that ω′ ≤ ω, counterfeiting
is welfare improving [0, T ] in the sense that
∫ T
0
```
χN RN (t)dt <
```
∫ E
0
```
χN RC (t)dt +
```
∫ T
E
χC RC dt.
6 Concluding Remarks
To the best of our knowledge, this is the first attempt to analyze the impact of
counterfeiting in a fully dynamic context with micro-founded demand functions.
The decision variables, that is, price and advertising, are clearly the most relevant
ones for well-known brands that eventually end up being copied by illegal producers.
In one sentence, the main takeaway of our paper is that counterfeiting is under no
circumstances beneficial to the legal producer, but it can suit consumers under some
conditions. Further, we showed that brand equity is always lower in the presence of
counterfeiting. This implies that this illegal activity has a really damaging effect on
the legal firm over the long term.
This last effect clearly supports prosecuting counterfeiters, as it is currently done
in many countries. By contrast, only a few countries like France and Italy penalize
consumers who purchase counterfeits. Our finding that counterfeiting can benefit
consumers suggests acting with caution with regard to the introduction of consumer
liability. 20 That is because, it may be difficult to actually identify the goods for which
counterfeiting is detrimental to consumers from the others.
As in any modeling effort, some simplifying assumptions have been made here,
and it would clearly be advantageous to relax them in future work. First, we assumed
that the counterfeiter’s entry date is known, which in practice may be hard to predict
precisely. It would not really be conceptually difficult to keep the same framework
and consider a case where this date is random. However, one can expect this to
potentially lead to equilibria that cannot be either fully characterized analytically or
not be compared analytically.
Second, we have implicitly assumed that the legal producer cannot deter entry.
In the absence of efficient institutions to combat counterfeiting, one intuitive option
for private firms to prevent illegal producers from entering the market is to sell at a
```
lower price to reduce the temptation of consumers to buy the illegal product (The
```
assumption here is that the attractiveness of going illegal depends on the gap in
```
prices.). For this to work, we minimally need to assume that the illegal producer
```
faces a fixed cost. The relevance and the level of such cost is an empirical matter.
Indeed, the fixed cost that needs to be paid to be able to start selling an illegal version
of software is not the same as producing a fake Lancel bag.
20 For a defense of consumer liability in the U.S., see, e.g., Orscheln [25] or Riso [30]. According
to Orschel [25], in 1993, Ms. Chin, a representative for District 1 of New York City, proposed to
adapt New York legislation to prosecute consumers for purchasing counterfeit goods. The proposal
appears to be laid over.
278 B. Crettez et al.
Third, we assumed that the product is normal. An interesting question that we
did not address is what would happen if the product had a network externality value.
For instance, the value that a person derives from a video game may depend on the
number of individuals in the person’s circle who own the product. Here, the illegal
demand may have a positive effect on the brand’s reputation, that is, illegal demand
works as an additional advertising activity that feeds the brand equity. In such a case,
one expects very different results from those obtained here, and it is surely of interest
to investigate such a context.
Appendix 1
Derivation of the Demand Functions
Assume that the utility function of the representative consumer is given by the fol-
lowing quadratic function:
```
U (ql , qc, y) = σl
```
√
Rql + σc
√
Rqc − κl q
2l
2 −
κc q2c
2 − ψql qc + y,
where y is a composite good, and σl , σc, ψ, κl and κc are positive parameters, with
```
σl κc − σcψ > 0, (24)
```
```
σcκl − σl ψ > 0, (25)
```
```
ψ > 0. (26)
```
The budget constraint is given by
pl ql + pc qc + y = I .
Suppose now that there is no counterfeit good, i.e., qc = 0. Then, the representative
consumer solves the following problem:
maxql
```
(
```
σl
√
Rql − κl q
2l
2 + I − pl ql
```
)
```
.
We easily find that the demand function is
```
ql = σl
```
√
R − pl
```
κl. (27)
```
Non-deceptive Counterfeiting and Consumer … 279
By contrast, when there is a counterfeiter, the representative consumer solves the
following program:
maxql ,qc
```
(
```
σl
√
Rql + σc
√
Rqc − κl q
2l
2 −
κc q2c
2 − ψql qc + I − pl ql − pc qc
```
)
```
.
Assuming an interior solution, then the first-order optimality conditions are given by
σl
√
```
R − κl ql − ψqc − pl = 0, (28)
```
σc
√
```
R − κc qc − ψql − pc = 0. (29)
```
Solving for ql and qc, we obtain
```
ql = κcσl
```
√
R − ψσc
√
R − κc pl + ψpc
```
κl κc − ψ2 , (30)
```
```
qc = κl σc
```
√
R − ψσl
√
R − κl pc + ψpl
```
κl κc − ψ2 . (31)
```
We see at once that the demand functions for the legal good are structurally different
```
in the two cases. Setting pc = 0 in (30) does not yield (27). We shall then assume
```
that the demand functions for the legal good and the counterfeit good are given by
the next expressions:
```
ql (t) =
```
```
{ ˜
```
```
δl√R (t) − ˜βl pl (t) , t ∈ [0, E),
```
```
δl√R (t) − βl pl (t) + γpc (t) , t ∈ [E, T ] ,
```
```
qc (t) = δc
```
√
```
R (t) − βc pc (t) + γpl (t) , t ∈ [E, T ] ,
```
```
where βj > 0 and γ ≥ 0, with βj > γ, j ∈ {l, c}, and
```
˜δl = σl
κl, δl =
κcσl − ψσc
κcκl − ψ2 , δc =
κl σc − ψl σl
κcκl − ψ2 ,
˜βl = 1
κl, βl =
κc
κcκl − ψ2 , βc =
κl
κcκl − ψ2 , γ =
ψ
κcκl − ψ2 .
We notice that
δl = κcσl − ψσcκ
cκl − ψ2
< ˜δl = σlκ
l
,
if and only if σcκl − σl ψ > 0 which holds true by assumption.
280 B. Crettez et al.
Moreover, we have
˜βl = 1
κl< βl =
κc
κcκl − ψ2 .
To ensure that in equilibrium the price of the good produced by the legal firm is
higher than the price of the counterfeit good, that is,
```
pCl (R (t))
```
```
pCc (R (t)) =
```
2βcδl + δcγ
2βl δc + δl γ > 1,
we assume that σl − σc > 0 and
```
(
```
2κl κc − ψ2
```
)
```
```
(σl − σc) + ψ(κcσl − κl σc) > 0.
```
Appendix 2
Proofs
Proof of Proposition 1
```
Denote by Vl (t, R (t)) : [0, T ] × R+ → R+ the value function of the legal firm. The
```
```
Hamilton-Jacobi-Bellman (HJB) equation reads as follows:
```
```
− ∂Vl∂t (t, R (t)) = maxpl ,a
```
```
((
```
```
pl (t)
```
```
(
```
```
˜δl√R (t) − ˜βl pl (t)
```
```
)
```
```
− ω2 a2 (t)
```
```
)
```
- ∂Vl∂R (t, R (t)) (ka (t) − σR (t))
```
)
```
.
Assuming an interior solution, the first-order optimality conditions are
∂RHS
∂pl= ˜δl
√
R − 2 ˜βl pl = 0 ⇔ pl =
˜δl
2 ˜βl
√
R,
∂RHS
∂a = −ωa + k
∂Vl
∂R = 0 ⇔ a =
k
ω
∂Vl
∂R .
Substitute in the HJB equation to get
− ∂Vl∂t =
```
( ˜δ
```
l
2 ˜βl
```
√R (t)(˜δ
```
l
```
√R (t) − ˜β
```
l
˜δl
2 ˜βl
```
√R (t))− ω
```
2
```
( k
```
ω
∂Vl
∂R
```
)2)
```
- ∂Vl∂R
```
(
```
```
k kω∂Vl∂R − σR (t)
```
```
)
```
,
which simplifies to
Non-deceptive Counterfeiting and Consumer … 281
− ∂Vl∂t =
˜δ2l
4 ˜βl
R + k
2
2ω
```
( ∂V
```
l
∂R
```
)2
```
```
− σR ∂Vl∂R . (32)
```
Conjecture that the value function is linear, i.e.,
```
Vl (t, R (t)) = z (t) R (t) + y (t) ,
```
```
Vl (T , R (T )) = sR (T ) ,
```
```
where z (t) and y (t) are the coefficient to be identified. Substituting in (32) yields
```
```
− (˙zR + ˙y) =
```
```
( ˜
```
δ2l
4 ˜βl
− σz
```
)
```
R + k
2
2ω z
2.
By identification, we have
−˙z =
˜δ2l
4 ˜βl
− σz,
```
−˙y (t) = k
```
2
```
2ω (z (t))
```
2 .
Solving the two above differential equations, we obtain
```
z (t) =
```
˜δ2l
4σ ˜βl
- C1eσt , (33)
```
y (t) = − k
```
2
4σω
```
( ˜
```
δ4l
8σ ˜β2l
t +
˜δ2l C1
σ ˜βl
eσt + C21 e2σt
```
)
```
- C2, (34)
where C1 and C2 are integration constants.
Using the terminal condition
```
Vl (T , R (T )) = sR (T ) ,
```
we conclude that
```
z (T ) = s,
```
```
y (T ) = 0.
```
Consequently,
```
z (T ) =
```
˜δ2l
4σ ˜βl
- C1eσT = s ⇔ C1 = 4σ
˜βl s − ˜δ2l
4σ ˜βl
e−σT .
282 B. Crettez et al.
Further, we have
```
y (T ) = − k24σω
```
```
( ˜δ4
```
l
8σ ˜β2lT +
˜δ2l C1
σ ˜βle
σT + C21 e2σT
```
)
```
- C2 = 0,
4σ ˜βl s − ˜δ2l
4σ ˜βle
−σT = − k2
4σω
⎛
⎜⎝˜δ4l
8σ ˜β2lT +
˜δ2l4σ ˜βl s−˜δ2l4σ ˜βle−σT
σ ˜βle
```
σT + ( 4σ ˜βl s − ˜δ2l
```
4σ ˜βle
```
−σT )2e2σT
```
⎞
⎟⎠ + C2 = 0,
⇔ C2 = k24σω
⎛
⎝ ˜δ4l
8σ ˜β2lT + ˜δ
2l4σ ˜βl s − ˜δ2l
4σ2 ˜β2l+
```
( 4σ ˜β
```
l s − ˜δ2l
4σ ˜βl
```
)2⎞
```
⎠
= k216σ3ω ˜β2
l
```
( ˜σδ4
```
l
2 T + ˜δ
```
2l (4σ ˜βl s − ˜δ2l ) + (4σ ˜βl s − ˜δ2l )2
```
4
```
)
```
```
Substituting for C1 and C2 in (33) and (34) yields the values of z(t) and y(t)
```
displayed p. 263. Now,
```
a = kω∂Vl∂R = kω z (t) = k
```
4σ ˜βl ω
```
( ˜δ2l + (4σ ˜βl s − ˜δ2l )eσ(t−T ) ).
```
Inserting in the dynamics and solving the differential equation, we obtain the brand’s
```
reputation trajectory given in (10).
```
```
Substituting for z (t) and y (t) in Vl (t, R (t)) yields the following value:
```
```
Vl (t, R (t)) =
```
```
( ˜
```
δ2l
4σ ˜βl
- 4σ
˜βl s − ˜δ2l
4σ ˜βl
```
eσ(t−T )
```
```
)
```
```
R (t)
```
- k
2
16σ3ω ˜β2l
```
( ˜
```
σδ4l
```
2 (T − t) + ˜δ
```
```
2l (4σ ˜βl s − ˜δ2l )(1 − eσ(t−T ) )
```
- (4σ
```
˜βl s − ˜δ2l )2
```
```
4 (1 − e
```
```
2σ(t−T ) )
```
```
)
```
.
```
The total payoff is obtained by evaluating the above value function at (0, R (0)),
```
that is,
```
Vl (0, R (0)) = z (0) R (0) + y (0) ,
```
=
```
( ˜δ2
```
l
4σ ˜βl+
4σ ˜βl s − ˜δ2l
4σ ˜βle
−σT
```
)
```
R0
- k
2
16σ3ω ˜β2l
```
( ˜σδ4
```
l
2 T + ˜δ
```
2l (4σ ˜βl s − ˜δ2l )(1 − e−σT ) + (4σ ˜βl s − ˜δ2l )2
```
```
4 (1 − e
```
```
−2σT )
```
```
)
```
.
Non-deceptive Counterfeiting and Consumer … 283
```
Payoff starting from (E, R (E)) is given by
```
```
Vl (E, R (E)) = z (E) R (E) + y (E) .
```
Proof of Proposition 4
```
Denote by W l (t, R (t)) : [E, T ] × R+ → R the legal firm’s value function. The HJB
```
equation of the legal firm is given by
```
− ∂W l∂t (t, R (t)) = maxpl ,a
```
```
((
```
```
pl (t)
```
```
(
```
δl
√
```
R (t) − βl pl (t) + γpc (t)
```
```
)
```
```
− ω2 a2 (t)
```
```
)
```
- ∂W l∂R (t, R (t)) (ka (t) − σR (t))
```
)
```
.
The counterfeiter’s optimization problem is
```
maxpc (t) πc (t) = maxpc (t) pc (t)
```
```
(
```
δc
√
```
R (t) − βc pc (t) + γpl (t)
```
```
)
```
, ∀t ∈ [E, T ] .
Assuming an interior solution, the first-order equilibrium conditions are
∂RHS
∂pl= δl
√
R − 2βl pl + γpc = 0,
∂RHS
∂a = −ωa + k
∂W l
∂R = 0,
∂πc
∂pc= δc
√
R − 2βc pc + γpl = 0 ⇔ pc = δc
√
R + γpl
2βc,
```
which is equivalent to (12), (13) and
```
```
a = kω∂W l∂R .
```
Substituting in the HJB yields
− ∂W l∂t = βl
```
( 2β
```
cδl + δcγ
4βcβl − γ2
```
)2
```
R + ω2
```
( k
```
ω
∂W l
∂R
```
)2
```
```
− σR ∂W l∂R . (35)
```
Conjecture the following linear form for the value function:
```
W l (t, R (t)) = x (t) R (t) + v (t) ,
```
284 B. Crettez et al.
then
```
a = kω x,
```
∂W l
∂t = ˙xR + ˙v.
```
Substituting in (35), we obtain
```
```
− (˙xR + ˙v) =
```
```
(
```
βl
```
( 2β
```
cδl + δcγ
4βcβl − γ2
```
)2
```
− σx
```
)
```
R + k
2x2
2ω .
By identification of terms in order of R, we have
−˙x + σx = βl
```
( 2β
```
cδl + δcγ
4βcβl − γ2
```
)2
```
,
˙v = − k
2
2ω x
2.
Solving the two above differential equations, we get
```
x (t) =  + C1eσt ,
```
```
v (t) = − k
```
2
2ω
```
(
```
2t + C
21
2σ e
2σt + 2C1
σ e
σt
```
)
```
- C2,
where C1 and C2 are integration constants and
 = βlσ
```
( 2β
```
cδl + δcγ
4βcβl − γ2
```
)2
```
.
Using the boundary condition
```
W l (T , R (T )) = sR (T )
```
yields
```
C1 = (s − ) e−σT ,
```
```
C2 = k
```
2
2ω
```
(
```
```
2T + (s − )
```
2
2σ +
```
2(s − )
```
σ
```
)
```
,
```
and consequently we get the values of x(t) and v(t) given in (16) and (17). Recalling
```
```
that a = kω x, we then get (14).
```
```
Substituting for a in the dynamics and solving the differential equation with R (E)
```
```
as initial condition, we get the value of the reputation after entry given in (15).
```
Non-deceptive Counterfeiting and Consumer … 285
Proof of Proposition 5
```
Denote by Zl (t, R (t)) : [0, T ] × R+ → R+ the value function of the legal firm. The
```
```
Hamilton-Jacobi-Bellman (HJB) equation reads as follows:
```
```
− ∂Zl∂t (t, R (t)) = maxpl ,a
```
```
((
```
```
pl (t)
```
```
(
```
```
˜δl√R (t) − ˜βl pl (t)
```
```
)
```
```
− ω2 a2 (t)
```
```
)
```
- ∂Zl∂R (t, R (t)) (ka (t) − σR (t))
```
)
```
.
Assuming an interior solution, the first-order optimality conditions are
∂RHS
∂pl= ˜δl
√
R − 2 ˜βl pl = 0 ⇔ pl =
˜δl
2 ˜βl
√
R,
∂RHS
∂a = −ωa + k
∂Zl
∂R = 0 ⇔ a =
k
ω
∂Zl
∂R .
Substitute in the HJB equation to get
− ∂Zl∂t = ˜δl2 ˜β
l
```
√R (t)(˜δ
```
l
```
√R (t) − ˜β
```
l
˜δl
2 ˜βl
```
√R (t))− ω
```
2
```
( k
```
ω
∂Zl
∂R
```
)2
```
- ∂Zl∂R
```
(
```
```
k kω∂Zl∂R − σR (t)
```
```
)
```
,
which simplifies to
− ∂Zl∂t =
˜δ2l
4 ˜βl
R + k
2
2ω
```
( ∂Z
```
l
∂R
```
)2
```
```
− σR ∂Zl∂R . (36)
```
Conjecture that the value function is linear, i.e.,
```
Zl (t, R (t)) = m (t) R (t) + n (t) ,
```
```
Zl (E, R (E)) = W l (E, R (E)) ,
```
```
where m (t) and n (t) are the coefficients to be identified. Substituting in (36) yields
```
```
− ( ˙mR + ˙n) =
```
```
( ˜
```
δ2l
4 ˜βl
− σm
```
)
```
R + k
2
2ω m
2.
By identification, we have
− ˙m =
˜δ2l
4 ˜βl
− σm
−˙n = k
2
2ω m
2.
286 B. Crettez et al.
Solving the two above differential equations, we obtain
```
m (t) =
```
˜δ2l
4σ ˜βl
- C1eσt , (37)
```
n (t) = − k
```
2
4σω
```
( ˜
```
δ4l
8σ ˜β2l
t +
˜δ2l C1
σ ˜βl
eσt + C21 e2σt
```
)
```
- C2, (38)
where C1 and C2 are integration constants.
Using the terminal condition
```
Zl (E, R (E)) = W l (E, R (E)) = x(E)R(E) + v(E),
```
we conclude that
```
m (E) = x(E) =  + (s − ) e−σ(T −E) ,
```
```
n (E) = v(E) = k
```
2
2ω
```
(
```
```
2(T − E) + (s − )
```
2
```
2σ (1 − e
```
```
2σ(E−T ) ) + 2(s − )
```
```
σ (1 − e
```
```
σ(E−T ) )
```
```
)
```
.
Consequently,
```
m (E) =
```
˜δ2l
4σ ˜βl
- C1eσE = x(E) ⇔ C1 = 4σ
```
˜βl x(E) − ˜δ2l
```
4σ ˜βl
e−σE .
Further, we have
```
n (E) = − k
```
2
4σω
```
( ˜
```
δ4l
8σ ˜β2l
E +
˜δ2l C1
σ ˜βl
eσE + C21 e2σE
```
)
```
- C2 = v (E) ,
= − k
2
16σ3ω ˜β2l
```
(
```
σ ˜δ4l
2 E + ˜δ
```
2l (4σ ˜βl x(E) − ˜δ2l ) + (4σ ˜βl x(E) − ˜δ2l )2
```
4
```
)
```
- C2 = v (E) .
```
Substituting for C1 and C2 in (37) and (38) yields the values of m(t) and n(t)
```
displayed page 268. Now,
```
a = kω∂Zl∂R = kω m (t) = k
```
4σ ˜βl ω
```
(
```
```
˜δ2l(1 − eσ(t−E)) + 4σ ˜βl x(E)eσ(t−E)
```
```
)
```
= k
4σ ˜βl ω
```
(
```
```
˜δ2l(1 − eσ(t−E)) + 4σ ˜βl ( + (s − ) e−σ(T −E) )eσ(t−E)
```
```
)
```
.
Inserting in the dynamics and solving the differential equation, we obtain the repu-
tation trajectory given in Proposition 5.
Non-deceptive Counterfeiting and Consumer … 287
Proof of Lemma 1
To prove the Lemma, we have to establish that the legal firm’s profit in the monopoly
case is higher than the profit under Bertrand competition. To do this, we shall rely
on the micro-foundations of the demand functions. From Appendix 1, we know that
```
when the consumptions of the three goods, ql , qc and y, are positive (where we recall
```
```
that y is the composite good), the next conditions hold:
```
```
σl − κl ql − ψqc = pl , (39)
```
```
σc − κl qc − ψql = pc. (40)
```
To derive the demand functions used in the paper, we have solved the consumer’s
```
maximization problem for quantities ql and qc (as a function of the prices) and we
```
have studied the Bertrand competition case. We could also have considered Cournot
```
competition where the legal firm (resp. the counterfeiter) maximizes pl ql (resp. pc qc)
```
```
with respect to ql (resp. qc), pl and pc being given by (39)–(40).
```
The quantities associated to a Cournot equilibrium satisfy the next conditions:
```
σl − 2κl ql − ψqc = 0, (41)
```
```
σc − 2κl qc − ψql = 0, (42)
```
and are given by
¯ql = 2κcσl − ψσc4κ
cκl − ψ2
```
, (43)
```
¯qc = 2κl σc − ψσl4κ
cκl − ψ2
```
. (44)
```
```
Using Eqs. (39), (40), (41), and (42) we notice that, in a Cournot equilibrium,
```
```
¯pl = κ¯ql , (45)
```
```
¯pc = κ¯qc. (46)
```
• Now recall that, in the monopoly case, the demand for the legal product is obtained
from the condition σl − κl ql − pl = 0. In this case, the legal firm chooses its price
so as to maximize its profit pl ql , and we obtain that q∗c = σl2κl and p∗l = σl2 .
• Next, we shall rely on Proposition 1 of Singh and Vives [31], p. 549, which asserts
that the profit of each firm under Cournot competition is higher than the profit
```
obtained under Bertrand Competition (which is the case considered in the paper).
```
• We shall now prove that the monopoly profit is higher than the Cournot profit. To
```
do this, we only have to show that q∗l > ¯ql (see Eqs. (45) and (46)). But we can
```
check that the condition q∗l > ¯ql , that is,
288 B. Crettez et al.
σl
2κl>
2κcσl − ψσc
```
4κcκl − ψ2 (47)
```
is equivalent to
2κl σc > σl ψ.
This last condition is always met since we have assumed that κl σc > σl ψ. In the
```
model’s notation, the inequality in (47) corresponds to the inequality in the Lemma.
```
Proof of Proposition 7
By the dynamic programming optimality principle, we have, along an optimal path
```
(here it is unique) for the legal firm, that
```
```
Zl (0, R0) =
```
∫ E
0
π1
```
(
```
```
RC (t; E), aC (t; E), pCl (t; E)
```
```
)
```
```
dt + W l (E, RC (E; E)).
```
Notice that the optimal path
```
(
```
```
RC (t; E), aC (t; E), pCl (t; E)
```
```
)
```
a priori depends on E.
Differentiating with respect to E, we get
```
∂Zl (0, R0; E)
```
∂E =
∫ E
0
```
{ ∂π1
```
∂R
∂R
∂E +
∂π1
∂a
∂a
∂E +
∂π1
∂p l
```
( ∂πl
```
∂R
∂R
∂E +
∂p l
∂E
```
)}
```
```
dt (48)
```
- π1
```
(
```
```
RC (E; E), aC (E; E), pCl (E; E)
```
```
)
```
- ∂W l∂t (E; RC (E; E)) + ∂W l∂R
```
( ∂R
```
```
∂t (E; E) +
```
∂R
```
∂E (E; E)
```
```
)
```
.
```
(49)
```
```
Now, by the Pontryagin maximum principle, there exists an adjoint variable λ(t; E),
```
```
such that, for all t in [0, E], the (unique) optimal path
```
```
(
```
```
RC (t; E), aC (t; E), pCl (t; E)
```
```
)
```
maximizes the Hamiltonian
```
π1(R(t), a(t), pl (t)) + λ(t)[ka(t) − σR(t)].
```
```
Moreover the adjoint variable λ(t) also satisfies
```
```
˙λ(t; E) = −
```
```
( ∂π
```
1
```
∂R − σλ(t, E)
```
```
)
```
,
```
λ(E; E) = ∂W l∂R (E; RC (E; E)).
```
Therefore, the next conditions must hold at each date t:
∂π1
```
∂a + λ(t; E)k = 0, (50)
```
∂π1
```
∂pl= 0. (51)
```
Non-deceptive Counterfeiting and Consumer … 289
```
Following an argument in the proof of the Dynamic Envelope Theorem (Th. 9.1, pp
```
```
233) in Caputo [5], we first differentiate the following dynamics equation:
```
```
˙R(t, E) = ka(t; E) − σR(t; E),
```
with respect to E to obtain
```
∂ ˙R(t; E)
```
∂E = k
```
∂a(t; E)
```
∂E − σ
```
∂R(t, E)
```
∂E .
Let us now add the following quantity
```
λ(t, E)
```
```
(
```
```
k ∂a(t; E)∂E − σ ∂R(t, E)∂E − ∂
```
```
˙R(t; E)
```
∂E
```
)
```
= 0,
```
to the integrand of the integral in (48). Using (51) we get
```
```
∂Zl (0, R0; E)
```
∂E =
∫ E
0
```
{ ∂π
```
1
∂R
∂R
∂E +
∂π1
∂a
∂a
∂E
```
+λ(t; E)
```
```
(
```
```
k ∂a(t; E)∂E − σ ∂R(t, E)∂E − ∂
```
```
˙R(t; E)
```
∂E
```
)}
```
dt
- π1
```
(
```
```
RC (E; E), aC (E; E), pCl (E; E)
```
```
)
```
- ∂W l∂t (E; R(E; E)) + ∂W l∂R
```
( ∂R
```
```
∂t (E; E) +
```
∂R
```
∂E (E; E)
```
```
)
```
```
(52)
```
To simplify the above expression, we integrate
∫ E
0
```
λ(t; E) ∂
```
```
˙R(t; E)
```
∂E dt,
by parts to obtain
∫ E
```
0λ(t, E)
```
```
∂ ˙R(t; E)
```
```
∂E dt = λ(E; E)
```
∂R
```
∂E (E; E) − λ(0; E)
```
∂R
```
∂E (0; E) −
```
∫ E
0
```
˙λ(t, E) ∂R(t; E)
```
∂E dt.
```
We observe that: ∂R∂E (0; E) = 0. Substituting the above expression in (52) we get after
```
a little algebra
```
∂Z l (0, R0; E)
```
∂E =
∫ E
0
```
{( ∂π
```
1
```
∂R − σλ(t; E) + ˙λ(t; E)
```
```
) ∂R
```
∂E +
```
( ∂π
```
1
```
∂a + kλ(t; E)
```
```
) ∂a
```
∂E
```
}
```
dt
```
− λ(E; E) ∂R∂E (E; E) + π1
```
```
(
```
```
RC (E; E), aC (E; E), pCl (E; E)
```
```
)
```
- ∂W l∂t (E; RC (E; E)) + ∂W l∂R
```
( ∂R
```
```
∂t (E; E) +
```
∂R
```
∂E (E; E)
```
```
)
```
```
. (53)
```
290 B. Crettez et al.
```
Using the Pontryagin maximum principle (and notably the fact that λ(E; E) =∂W
```
```
l∂R (E; RC (E; E))) the above expression reduces to
```
```
∂Zl (0, R0; E)
```
∂E = π1
```
(RC (E; E), aC (E; E), pC
```
```
l (E; E)
```
```
) + ∂W l
```
```
∂t (E; R
```
```
C (E; E)) + ∂W l
```
∂R
∂R
```
∂t (E; E).
```
Now, we use the Hamilton-Jacobi-Bellman equation, which holds at date E, that is,
```
− ∂W l (E, R
```
```
C (E; E))
```
∂t = π2
```
(RC (E; E), aC (E; E), pC
```
```
l (E; E)
```
```
) + ∂W l (E; RC (E; E))
```
```
∂R ˙R(E; E).
```
```
Substituting the above equation in Eq. (53) yields
```
```
∂Zl (0, R0; E)
```
∂E = π1
```
(RC (E; E), aC (E; E), pC
```
```
l (E; E)
```
```
) − π
```
2
```
(RC (E; E), aC (E; E), pC
```
```
l (E; E)
```
```
) .
```
```
A more direct route consists in directly computing ∂Z l (0,R0 ;E)∂E . Indeed, we have
```
```
∂Z l (0, R0 ; E)
```
∂E =
1
4σ ˜βl
```
(′−σE − σe−σE ) R0 + k2 ˜δ4l
```
32σ2ω ˜β2l+
k2 ˜δ2l
```
16σ3ω ˜β2l(
```
```
′ (1 − e−σE ) + σe−σE )
```
- k264σ3ω ˜β2
l
```
(2′ (1 − e−2σE ) + 2 2σe−2σE )
```
```
− k22ω( + (s − )eσ(E−T ))2,
```
```
= R04σ ˜βl(˜δ2l − 4σ ˜βl )e−σE + k2 ˜δ4l32σ2ω ˜β2
```
l
- k2 ˜δ2l16σ3ω ˜β2
l
```
(σ( + ˜δ2
```
```
l − 4σ ˜βl ) + σ(4σ ˜βl  − ˜δ2l )e−σE
```
```
),
```
- k232σ3ω ˜β2
l
```
(σ( + ˜δ2
```
```
l − 4σ ˜βl ) + σ(4σ ˜βl  − ˜δ2l )e−2σE
```
```
)− k2
```
```
32σ2 ω ˜β2l( + ˜δ
```
```
2l )2,
```
```
= R04σ ˜βl(˜δ2l − 4σ ˜βl )e−σE + k2 ˜δ2l16σ3ω ˜β2
```
l
```
(σ(˜δ2
```
```
l − 4σ ˜βl )(1 − e−σE )
```
```
)
```
- k232σ3ω ˜β2
l
```
(σ(˜δ2
```
```
l − 4σ ˜βl )(1 − e−2σE )
```
```
),
```
```
= R04σ ˜βl(˜δ2l − 4σ ˜βl )e−σE
```
- k2 (σ(˜δ2l − 4σ ˜βl )32σ3ω ˜β2
l
```
(4σ ˜βl( + (s − ) e−σ(T −E))(1 − e−2σE ) + ˜δ2l (1 + e−2σE − 2e−σE )) > 0.
```
Proof of Proposition 8
We must prove the statement for the two periods, that is, before and after entry of
the counterfeiter.
```
During the interval [0, E), the difference in advertising is given by
```
```
aN (t) − aC1 (t) = kσω
```
```
(
```
```
eσ(t−E) − eσ(t−T )
```
```
)
```
≥ 0.
Non-deceptive Counterfeiting and Consumer … 291
During the interval [E, T ], the difference in advertising is given by
```
aN (t) − aC2 (t) = kσω
```
```
(
```
```
1 − e−σ(T −t)
```
```
)
```
≥ 0.
Proof of Proposition 9
On [0, E] the difference in reputation is given by
```
RN (t) − RC (t) = k
```
2
2σ2ω 
```
(
```
e−σE − e−σT
```
) (
```
eσt − e−σt
```
)
```
,
which is clearly always positive for all t ∈ [0, E].
To check that the difference in reputation is positive on [E, T ], we consider the
following differential equations:
```
˙RN (t) = kaN (t) − σRN (t),
```
```
˙RC (t) = kaC (t) − σRC (t),
```
```
with RN (E) > RC (E) from the above result. Moreover
```
```
aN (t) − aC2 (t) ≥ 0,
```
```
from the previous proposition. Set D(t) = RN (t) − RC (t) and b(t) = aN (t) − aC (t),
```
thus D satisfies
```
˙D(t) = kb(t) − σD(t)
```
```
D(E) > 0
```
```
and b(t) ≥ 0, so we have
```
```
D(t) = e−σ(t−E)D(E) + ke−σt
```
∫ t
E
```
b(s)eσs ds.
```
```
Clearly D(t) > 0. Hence the result.
```
```
During the interval [0, E), the difference in price is given by
```
pNl
```
(
```
```
RN (t)
```
```
)
```
− pCl1
```
(
```
```
t, RC (t)
```
```
)
```
=
˜δl
2 ˜βl
```
(√
```
```
RN (t) −
```
√
```
RC (t)
```
```
)
```
.
By the above result,
√
```
RN (t) >
```
√
```
RC (t) and consequently, pNl
```
```
(
```
```
RN (t)
```
```
)
```
```
> pCl1(
```
```
t, RC (t)
```
```
)
```
```
for all t ∈ [0, E).
```
292 B. Crettez et al.
During the interval [E, T ], the difference in price is given by
```
pNl (R (t)) − pCl2 (R (t)) =
```
˜δl
2 ˜βl
√
```
RN (t) − 2βcδl + δcγ4β
```
cβl − γ2
√
```
RC (t).
```
Given that
√
```
RN (t) >
```
√
```
RC (t) by the above result, to prove that pNl (R (t)) >
```
```
pCl2 (R (t)), it suffices to show that
```
˜δl
2 ˜βl
> 2βcδl + δcγ4β
cβl − γ2
.
By Lemma 1, we have
˜δ2l
4 ˜βl
> βl
```
( 2β
```
cδl + δcγ
4βcβl − γ2
```
)2
```
⇔
˜δ2l
4 ˜β2l
> βl˜
βl
```
( 2β
```
cδl + δcγ
4βcβl − γ2
```
)2
```
.
Since ˜βl < βl , the above inequality implies
˜δ2l
4 ˜β2l
>
```
( 2β
```
cδl + δcγ
4βcβl − γ2
```
)2
```
.
Taking the square root of both side yields
˜δl
4 ˜βl
>
```
( 2β
```
cδl + δcγ
4βcβl − γ2
```
)
```
,
which concludes the proof.
Proof of Proposition 10
We have
```
W l (t, R(t)) = maxp l2 (.),a2 (.)
```
∫ T
t
```
(
```
```
pl2 (h)
```
```
(
```
```
δl√R (h) − βl pl2 (h) + γpc (h)
```
```
)
```
```
− ω2 a22 (h)
```
```
)
```
```
dh + sR (T ) ,
```
```
(54)
```
```
subject to (4) and RC (t). (55)
```
```
Let pCl2 (t, R (t)), pCc (t, R (t)), aC2 (t, R (t)) be the feedback-Nash equilibrium. Let also
```
```
RC (.) be the induced path of the legal firm’s reputation. We can then compute the
```
```
values of the sales given the value of RC (.). Using our notations, we get
```
Non-deceptive Counterfeiting and Consumer … 293
```
rCl (h) = pCl2 (h)
```
```
(
```
δl
√
```
RC (h) − βl pCl2 (h) + γpCc (h)
```
```
)
```
```
(56)
```
```
= βl (2βcδl + δcγ)
```
2
```
(
```
4βcβl − γ2
```
)2 RC (h) (57)
```
```
< ˆrNl (h) (58)
```
```
= pNl (h)
```
```
(
```
```
˜δl√RC (h) − ˜βl pNl (h)
```
```
)
```
```
(59)
```
=
˜δ2l
4 ˜βl
```
RC (h) , (60)
```
```
where ˆrNl (h) is the maximum value of the sales of the legal firm at date h along the
```
reputation path chosen when there is counterfeiting. The above inequality implies
```
that:
```
```
W l (t, R(t)) =
```
∫ T
t
```
(
```
```
pCl2 (h)
```
```
(
```
δl
√
```
RC (h) − βl pCl2 (h) + γpCc (h)
```
```
)
```
```
− ω2 (aC2 )2 (h)
```
```
)
```
```
dh + sRC (T ) ,
```
```
(61)
```
<
∫ T
t
```
( ˜
```
δ2l
4 ˜βlR
```
C (h) − ω
```
```
2 (a
```
```
C2 )2 (h)
```
```
)
```
```
dh + sRC (T ) (62)
```
```
But by definition of Vl (t, R(t)), we have
```
```
Vl (t, R(t)) = maxpl (.),a(.)
```
∫ T
t
```
(
```
```
pl (h)
```
```
(
```
```
˜δl√R (h) − ˜βl pl (h)
```
```
)
```
```
− ω2 a2 (h)
```
```
)
```
```
dt + sR (T ) ,
```
```
(63)
```
```
= maxa(.)
```
∫ T
t
```
( ˜
```
δ2l
4 ˜βl
```
R (h) − ω2 a2 (h)
```
```
)
```
```
dt + sR (T ) , (64)
```
```
Therefore W l (t, R(t)) < Vl (t, R(t)).
```
Proof of Proposition 13
Notice that we can write
```
RC (t) = R0e−σt + G(t)ω ,
```
```
D(t) = RN (t) − RC (t) = F(t)ω ,
```
where G and F do not depend on ω.
```
Now let z ∈ [E, T ] be the value at which F (and therefore D) reaches its maximum
```
value on [E, T ], and y ∈ [E, T ] the value at which G reaches its minimum value on
that interval. These values exist, since F and G are continuous on [E, T ].
294 B. Crettez et al.
We have
```
limω→+∞(RN (z) − RC (z)) = 0,
```
```
limω→+∞ RC (t) ≥ limω→+∞ R0e−T + G(y)ω ≥ R0e−σT > 0.
```
Further, for all t ∈ [E, T ], we have
```
χC RC (t) − χN RN (t) =
```
```
(
```
χC − χN
```
)
```
```
RC (t) + χN
```
```
(
```
```
RC (t) − RN (t)
```
```
)
```
>
```
(
```
χC − χN
```
) (
```
```
R0e−T + G(y)ω
```
```
)
```
- χN
```
(
```
```
RC (z) − RN (z)
```
```
)
```
which implies
```
limω→ +∞(χC RC (t) − χN RN (t)) > 0.
```
And so the proposition follows.
Proof of Proposition 14
Following the proof of Proposition 13 the condition
∫ T
0
```
χN RN (t)dt <
```
∫ E
0
```
χN RC (t)dt +
```
∫ T
E
χC RC dt
is satisfied whenever
EχN σ
2l
8κlmaxt∈[0,E]
```
F(t)
```
```
ω < (T − E)
```
```
(
```
χC − χN
```
)
```
R−σT0 .
This condition is indeed satisfied for ω higher than a certain threshold ω′.
References
1. Banerjee, D. (2003) Software Piracy: a Strategic Analysis and Policy Instruments, International
Journal of Industrial Organization, 21, 97-127.
2. Banerjee, D. (2013) Effect of Piracy on Innovation in the Presence of Network Externalities,
Economic Modelling, 33, 526-532.
3. Biancardi, M., Di Liddo A., Villani G. (2019), Fines Imposed on Counterfeiters and Pocketed
by the Genuine Firm. A Differential Game Approach. Dynamic Games and Applications,
```
https://doi.org/10.1007/s13235-019-00310-6.
```
Non-deceptive Counterfeiting and Consumer … 295
4. Buratto, A., Grosset, L., Zaccour, G. (2016) Strategic Pricing and Advertising in the Presence
of a Counterfeiter. IMA Journal of Management Mathematics, 27, 3, 397-418.
5. Caputo, M.R (2005), Foundations of Dynamic Economic Analysis, Cambrige University Press,
Cambridge.
6. Cellini, R. Lambertini, L. (2007), A differential oligopoly game with differentiated goods and
sticky prices, European Journal of Operational Research, 176, 1131-1144.
7. Chaudhry, P., Zimmerman, A. (2009) Protecting Intellectual Property Rights: The Special Case
of China. Journal of Asia-Pacific Business, 10, 308–325.
8. Cordell, V., Wongtada, N., Kieschnick, R. (1996) Counterfeit Purchase Intentions: Role of
Lawfulness Attitudes and Product Traits as Determinants. Journal of Business Research, 35,
41–53.
9. Cox, J. and A. Collins (2014), Sailing in the Same Ship? Differences in Factors Motivatings
Piracy of Music and Movie Content, Journal of Behavioral and Experimental Economics, 50,
70-76.
10. Crettez B., Hayek N. and G. Zaccour (2018), Brand Imitation: A Dynamic-Game Approach
```
(2018), International Journal of Production Economics, 205, 139-155.
```
11. Di Liddo A. (2017) Counterfeiting Models (Mathematical/Economic). In: Marciano A.,
```
Ramello G. (eds) Encyclopedia of Law and Economics. Springer, New York, NY
```
12. Di Liddo, A. (2018), Does Counterfeiting Benefit Genuine Manufacturer?. The Role of Pro-
duction Cost. European Journal of Law and Economics, 45, 1, 81-125.
13. Eisend, M., & Schuchert-Guler, P. (2006). Exploring Counterfeit Purchases: A Review and
```
Preview. Academy of Marketing Science Review, 2006(12), 1-22.
```
14. Grossman, G.M., Shapiro, C. (1988a) Counterfeit-Product Trade. American Economic Review,
78, 1, 59-75.
15. Grossman, G.M., Shapiro, C., (1988b). Foreign Counterfeiting of Status Goods. Quarterly
Journal of Economics, 103, 1, 79-100.
16. El Harbi, S. and G. Grolleau (2008) Profiting from Being Pirated by ‘Pirating’ the Pirates,
Kyklos, 61, 385-390.
17. Givon, M., Mahajan V. and E. Muller (1995) Estimation of Lost Sales and the Impact on
Software Diffusion, Journal of Marketing, 59, 1, 29-37.
18. Haurie, A., Krawczyk, J.B., Zaccour, G. (2012) Games and Dynamic Games, Scientific World,
Singapore.
19. Huang, J., Lemg, M., Liang, L. (2012) Recent Developments in Dynamic Advertising Research.
European Journal of Operational Research, 220, 591–609.
20. Huang, J., Leng M. and M. Parlar (2013) Demand Functions in Decision Modeling: A Com-
prehensive Survey and Research Directions, Decisions Sciences, 44, 557–609.
21. Kapferer, J.N., and A. Michaut (2014), Luxury Counterfeit Purchasing: The Collateral Effect
of Luxury Trading Down Policy, Journal of Brand Strategy, 3, 1, 59-70.
22. Lai, F.T. and S.C. Chang (2012), Consumers’ choices, infringements and market competition,
European Journal of Law and Economics, 34, 77-103.
23. Jørgensen, S., & G. Zaccour (2004) Differential Games in Marketing, Boston: Kluwer Aca-
demic Publishers.
24. Levin, E. K. (2009). A Safe Harbor for Trademark: Reevaluating Secondary Trademark Lia-
```
bility after Tiffany v. eBay. Berkeley Technology Law Journal, 24, (1), 491-527.
```
25. Orscheln C. J. (2015), Bad News Birkins: Counterfeit in Luxury Brands (2015), The John
Marshall Review Of Intellectual Property Law, 250-266.
26. Martin, S. (2009), Microfundations for the Linear Demand Product Differentiation Model,
with Applications, Paper No. 1221, Institute for Research in the Behavioral Sciences, and
Management Sciences, Purdue University.
27. Peres, R., Muller E. and V. Mahajan (2010), Innovation Diffusion and New Product Growth
```
Models: A Critical Review and Research Directions, International Journal of Research in
```
Marketing, 27, 91-106.
28. Qian, Y. (2014) Brand Management and Strategies Against Counterfeits. Journal of Economics
and Management Strategy, 23, 2, 317–343.
296 B. Crettez et al.
29. Qian, Y. Gong, Q. and Y. Chen (2014) Untangling Searchable and Experiential Quality
Responses to Counterfeits, Marketing Science, 34, 4 , 522-538.
30. Riso J. (2015), Friend Or Faux: The Trademark Counterfeiting Act’s Inability To Stop The Sale
Of Counterfeit Sporting Goods, Wake Forest Journal Of Business And Intellectual Property
Law, 12, 2, 234-260
31. Singh, N., Vives, X. (1984) Price and Quantity Competition in a Differentiated Duopoly. Rand
Journal of Economics, 15, 4, 546-554.
32. Shultz II, C.J., Saporito, B. (1996) Protecting Intellectual Property: Strategies and Recommen-
dations to Deter Counterfeiting and Brand Piracy in Global Markets. The Columbia Journal of
World Business, 31, 18–28.
33. Stöttinger B., Penz, E. (2015), Concurrent Ownership of Brands and Counterfeits: Conceptual-
ization and Temporal Transformation from a Consumer Perspective, Psychology & Marketing,
32, 4, 373-391.
34. Suzuki, K. (2015), Legal Enforcement Agains Illegal Imitation in Developing Countries, Jour-
nal of Economics, 116, 247-270.
35. Yao, T. (2005), How a Luxury Monopolist Migh Benefit from a Stringent Counterfeit Moni-
toring, International Journal of Business and Economics, 4, 3, 177-192.
36. Yao, J.T (2015) The Impact of Counterfeit-purchase Penalties on Anti-Counterfeiting Under
Deceptive Counterfeiting, Journal of Economics and Business, 80, 51-61.
37. Zhang, J., Hong, J. and R. Q. Zhang (2012), Fighting Strategies in a Market with Counterfeits,
Annals of Operations Research, 192, 49-66.
Games where Players have Common
Interests
Equilibrium Coalition Structures
of Differential Games in Partition
Function Form
Simon Hoof
1 Introduction
In numerous real-life situations, coalition formation takes place. Among others, we
can think of the following applications: climate agreements, military alliances, car-
tels, resource extraction, or research collaborations. Without an enforcement tech-
nology, however, coalitional agreements are fragile for a number of reasons. For
```
example, unilaterally deviating from a climate agreement might be beneficial (at
```
```
least in the short run) if one can freeride on the effort of the other countries. A new
```
government might want to renegotiate terms of partnership with other countries.
Cartels are usually not legally allowed and thus very fragile. Finally, a country may
consume more of a common resource than agreed upon beforehand.
Coalition formation games thus intersect cooperative and noncooperative game
theory. On the one hand the coalition members act cooperatively within the coalition,
but on the other they act noncooperatively across coalitions. Further, in games with
externalities the worth of a coalition depends not only on the actions taken by the
members within a given coalition, but also on the actions taken by all left out play-
ers as well as on the coalition structure of these players. These kind of games can
be described in partition function form which were introduced by Thrall and Lucas
in 1963 [12]. 1 A partition function assigns a characteristic function to all coalition
structures, viz., partitions of the set of players. For a given coalition structure, the
characteristic function assigns a worth to a coalition of players. We follow an equilib-
rium approach to construct the partition function [15]. For a given coalition structure
1 See Kóczy [8] for a recent textbook treatment.
S. Hoof (B)
Department of Economics and SFB901, Paderborn University, Paderborn, Germany
e-mail: simon.hoof@upb.de
```
© The Editor(s) (if applicable) and The Author(s), under exclusive license
```
to Springer Nature Switzerland AG 2020
D. M. Ramsey and J. Renault (eds.), Advances in Dynamic Games,
Annals of the International Society of Dynamic Games 17,
```
https://doi.org/10.1007/978-3-030-56534-3_12
```
299
300 S. Hoof
the coalitions play a fully noncooperative game and each coalition basically acts as
a single agent. The worth of a coalition is then the equilibrium payoff.
While there exists a rich literature on endogenous coalition formation for static
games, 2 it is rather unexplored in the theory of dynamic games. A shortcoming in the
literature on coalition formation in differential games is that exogenous restrictions
are imposed on the set of feasible coalition structures. 3 In Petrosjan and Zaccour
[10] and Zaccour [14], for example, the authors fix a γ coalition structure such that
there exist one coalition and all left out players are singletons. A notable exception is
the recent work of Parilina and Sedakov [9], who use the same method as presented
here to construct the partition function for a difference game of cartel formation but
under open-loop strategies, while we study state-feedback strategies.
Recently, Hoof [7] introduced differential games in partition function form on
the restricted domain of linear-state games. In the present paper, we generalize the
previous one by showing how to construct a partition function for any autonomous
infinite horizon game. Since the resulting cooperative game is cohesive by construc-
```
tion (grand coalition is efficient), Hoof [7] studied the stability of the grand coalition
```
over time by means of the core. When defining the core for a partition function form
game, however, one has to impose ad hoc assumptions on the coalition structure of
the residual players. Here we fully endogenize the formation of coalitions by relying
on Bloch’s [2] coalition formation game. A coalition structure is then called stable
if it results from the equilibrium of an alternating offer bargaining game. We apply
the method to a well-studied model of dynamic cake eating [5]. After obtaining the
partition function in closed form we show how to solve for the equilibrium coalition
structure. Given that the agents are identical the equilibrium coalition structure is
equivalent to the solution of a finite dynamic programming problem in which the
number of stages equals the number of agents. Finally, we compute the equilibrium
coalition structures for up to 800′000′000 agents via MATLAB. It turns out that the
stability of the grand coalition decreases in the number of agents.
2 General Approach
2.1 Differential Games
```
An autonomous infinite horizon noncooperative differential game Γ (x) consists of
```
```
the following ingredients (with μ = (μi)i∈N ):
```
```
• Agents N = {1, 2, . . . , n}
```
• State space X ⊆ IR
• Action space U i ⊆ IR for each i ∈ N
```
• Strategy space Ui = {μi : X → U i | μi(x) Lipschitz continuous in x}
```
2 See the Handbook article of Ray and Vohra [11].
3 See the surveys of Calvo and Rubio [3] and de Zeeuw [6].
Equilibrium Coalition Structures of Differential Games … 301
```
• Payoff functional Ji(x, μ) =
```
∫ ∞
t
```
e−r(s−t)Fi(x(s), μ(x(s)))ds
```
```
• State equation ˙x(s) = f (x(s), μ(x(s)))
```
```
At every point in time t ∈ [0, ∞) each agent i chooses an action ui(t) ∈ U i accord-
```
```
ing to a feedback strategy μi : X → U i such that ui(t) = μi(x(t)). An agent derives
```
instantaneous payoffs according to a function Fi : X × U → IR, where U = ×i∈N U i
```
denotes the joint action space. The functions {Fi(x, u)}i∈N are assumed to be contin-
```
```
uously differentiable in x and u = (ui)i∈N . The objective functional Ji(x, μ) of each
```
```
agent is the discounted stream of payoffs over s ∈ [t, ∞), where r > 0 denotes the
```
common time preference rate and μ ∈ ×i∈N Ui a strategy profile. Since we consider
autonomous infinite horizon games, the payoff functional does not depend on the
```
current time t, but only on the current state x(t) = x [4, Theorem 19.2]. The state
```
evolves over time according to a stationary differential equation f : X × U → IR
```
with initial condition x(0) = x0 ∈ X . The evolution of the state over s ∈ [t, ∞) is
```
then described by the following dynamic system:
⎧
⎨
⎩
```
˙x(s) := dx(s)ds = f (x(s), μ(x(s))) (s ≥ t),
```
```
x(t) = x ∈ X .
```
```
(1)
```
```
We assume that the function f (x, u) is continuously differentiable in x and u. The
```
```
assumptions on the state equation f (·, ·) and strategy spaces {Ui}i∈N imply that the
```
```
solution x(s) of the differential equation (1) exists and is unique as well as continuous
```
[1, Theorem 5.1]. We further assume that a profile of admissible strategies μ jointly
```
generates a state trajectory x(s) that stays in the state space X and that payoffs are
```
```
finite. Therefore consider the parametrized solution of (1)
```
```
y(s; t, x, μ) = x +
```
∫ s
t
```
f (x(k), μ(x(k)))dk.
```
Now we define a set U ⊂ ×i∈N Ui of jointly admissible strategies by
```
U =
```
```
{
```
μ ∈ ×
i∈N
```
Ui | ∀(t, x) ∈ [0, ∞) × X : y(s; t, x, μ) ∈ X ∀s ≥ t,
```
```
∀x ∈ X : maxi∈N {|Ji(x, μ)|} < ∞
```
```
}
```
.
2.2 Partition Function
A subset of agents S ⊆ N is called a coalition with S = N being the grand coalition.
Let Π denote the set of all partitions of N . A coalition structure π ∈ Π splits N into
```
nonempty and disjoint subsets (the coalitions) such that S ∩ C = ∅ for all different
```
coalitions S, C ∈ π and ⋃S∈π S = N for all coalition structures π ∈ Π. Denote the
set of embedded coalitions by
302 S. Hoof
```
E =
```
```
{
```
```
(S, π) ∈ 2N × Π
```
∣∣
∣ ∅ = S ∈ π
```
}
```
.
A cooperative differential game in partition function form is a pair 〈N , V 〉 with
```
V : X × E → IR being the partition function. The partition function V (x, S, π)
```
is the worth of coalition S ∈ π in state x ∈ X . In the present paper we use an
```
equilibrium approach to construct V (·, ·, ·). The primitive is a differential game
```
```
Γ (x) = 〈N , (Ui)i∈N , (Ji(x, ·))i∈N 〉 with all agents being singletons. For a given coali-
```
tion structure π ∈ Π we assume that the agents i ∈ S act cooperatively within, but
noncooperatively across coalitions S ∈ π. Since a coalition acts as a single player, the
action and strategy space of coalition S becomes U S = ×i∈S U i and US = ×i∈S Ui,
```
respectively. The coalitional payoff JS (x, μ) is simply defined as the sum of individ-
```
ual payoffs
```
JS (x, μ) =
```
∑
i∈S
```
Ji(x, μ).
```
```
A noncooperative differential game in coalition form Γ π (x) is then described by a
```
```
triplet 〈π, (US )S∈π , (JS (x, ·))S∈π 〉 in which π is the set of players, US the strategy
```
```
space of player S ∈ π and JS (x, μ) the payoff of S ∈ π. The definition of a Nash equi-
```
```
librium for a game played between coalitions is straightforward. Let μS = (μi)i∈S
```
```
denote the strategy profile of coalition S and μ−S = (μC )C∈π\{S} the strategy profiles
```
of all coalitions but S.
Definition 1 The n-tuple μ ∈ U is a state-feedback Nash equilibrium of the game
```
Γ π (x) if for all coalitions S ∈ π and states x ∈ X the following inequalities hold:
```
```
JS (x, μ) ≥ JS (x, μS , μ−S ) ∀μS ∈ US .
```
One should note that the coalition structure π is fixed and it is thus an ordinary
Nash equilibrium and not a strong one. Since the instantaneous payoff functions
```
{Fi(x, u)}i∈N are assumed to be continuously differentiable in (x, u) the joint payoff
```
of coalition S given by
```
FS (x, u) =
```
∑
i∈S
```
Fi(x, u)
```
```
is also continuously differentiable in (x, u). This fact follows simply by the sum rule;
```
the sum of partial derivatives is equal to the partial derivative of the sum. Then we
can apply the standard theorem for the characterization of an equilibrium by means
of the solution of a system of coupled differential equation. The following theorem
is fundamental.
```
Theorem 1 ([13, cf. Theorem 1]) For a given partition π ∈ Π of N , the n-tuple
```
```
μ ∈ U is a Nash equilibrium of the game Γ π (x) if there exist |π| functions {vS :
```
```
X → IR}S∈π that are continuously differentiable in x and solve the following system
```
```
of coupled Hamilton-Jacobi-Bellman (HJB) equations:
```
Equilibrium Coalition Structures of Differential Games … 303
```
rvS (x) = maxuS ∈U S
```
```
{
```
```
FS (x, uS , μ−S (x)) + v′S (x)f (x, uS , μ−S (x))
```
```
}
```
```
= FS (x, μ(x)) + v′S (x)f (x, μ(x)).
```
```
Further, the transversality condition limt→∞ e−rt vS (x) must be satisfied for all coali-
```
tions S ∈ π and all feasible states x ∈ X .
```
For a given coalition structure π ∈ Π we can think of vS (x) = JS (x, μ) being a char-
```
acteristic function that assigns to each coalition a worth. And the partition function
then assigns to each partition a characteristic function.
Definition 2 The partition function V : X × E → IR assigns to each coalition S ∈ π
the noncooperative equilibrium payoff
```
V (x, S, π) = JS (x, μ) (S ∈ π).
```
2.3 Equilibrium Coalition Structure
Our stability concept rests on Bloch’s [2] sequential game of coalition formation. The
equilibrium of the game determines the coalition structure. Let p : N → N denote
a permutation of N , called the rule of order. Next we quote Bloch [2, p. 95] on the
```
rules of the game (my notation):
```
The first player according to the rule of order p starts the game by proposing the formation
of a coalition S to which she belongs. Each prospective member responds to the proposal
in the order determined by p. If one of the player rejects the proposal, she must make a
counteroffer and propose a coalition S′ to which she belongs. If all members accept, the
coalition is formed. All members of S then withdraw from the game, and the first player in
N \ S starts making a proposal.
The coalition structure that results from the stationary equilibrium of the alternating
offer game is called an equilibrium coalition structure. If the agents are identical,
then the game exhibits two useful properties. The equilibrium coalition structure is
```
the same for all rules of order up to a permutation of the agent’s index i  → p(i) [2, pp.
```
107 – 108]. And the stationary equilibrium of the alternating offer bargaining game
is equivalent to the equilibrium of an extensive form game of choice of coalition size
[2, Prop. 4.2].
Assumption 1 The agents are identical.
Assumption 2 The rule of order is from 1 to n.
Under Assumptions 1 and 2 we can identify equilibrium coalition structures from
the equilibrium of an extensive form game
```
Λ(x) = 〈N , (Σi)i∈N , (gi(x, ·))i∈N , (Hi)i∈N \{1} 〉.
```
304 S. Hoof
```
Here Σi ⊂ IN = {0, 1, 2, . . .} is the action space, Σ = ×i∈N Σi the joint action
```
space, gi : X × Σ → IR the payoff function and Hi ⊂ ×j=i−1j=1 Σj the set of histories.
The rules are as follows:
• Starting with player 1, each player i ∈ N chooses a number σi ∈ IN of subsequent
players to form a coalition with. As a result, a player has no choice if she was
already integrated into a coalition by a previous player.
• Each player has to choose at least 1 player if still available.
• Each player moves exactly once.
• The game is with perfect information.
Given the rules of the game we can define the action space Σi. For the first agent
```
we simply fix Σ1 = N . For all i ∈ {2, . . . , n} let hi = (σ1, . . . , σi−1) denote a history
```
```
up to stage i ∈ {2, . . . , n}. Define the history dependent action space for all i ∈
```
```
{2, . . . , n} by
```
```
Σi(hi) =
```
⎧
⎪⎪⎨
⎪⎪⎩
```
{1, . . . , n − (i − 1)} if
```
i−1∑
```
j=1
```
σj < i,
```
{0} else.
```
The action profile σ ∈ Σ then induces the coalition structure π via the function
: Σ → Π with
```
π = (σ ) =
```
⋃
```
i∈{j∈N |σj >0}
```
```
{{i, . . . , i − 1 + σi}}.
```
For the extensive form game we further need to define an individual payoff function
```
gi(x, σ ) that maps the actions into the reals. Since the underlying game that defines
```
the worth of a coalition is a differential game, the individual payoff also depends
on the current state x. Here we consider the payoff agent i can expect in coalition
S under partition π. Due to the symmetric setup we fix an equal sharing rule of the
coalition worth. The individual worth of i ∈ S is then given by
```
gi(x, σ ) = V (x, S, (σ ))|S| .
```
```
We will define a state dependent stable coalition structure π(x) ∈ Π in terms of the
```
```
subgame perfect Nash equilibrium (SPNE) σ (x) of the game Λ(x).
```
```
Definition 3 The n-tuple σ (x) ∈ Σ is a SPNE of Λ(x) if for all agents i ∈ N , states
```
```
x ∈ X and histories (hi)ni=2 ∈ ×ni=2 Hi it holds that:
```
```
gi(x, σ (x)) ≥ gi(x, σi, σ −i(x)) ∀σi ∈ Σi(hi),
```
```
where σ −i(x) = (σ j(x))j∈N \{i} are the equilibrium actions of the opponents.
```
Equilibrium Coalition Structures of Differential Games … 305
```
Lemma 1 Since Λ(x) is a finite extensive form game with perfect information, there
```
always exists a SPNE for any state x ∈ X .
```
Definition 4 The coalition structure π(x) = (σ (x)) is stable at x ∈ X .
```
Note that, generally, the equilibrium coalition structure is state dependent. This may
lead to a time inconsistent equilibrium coalition structure in the sense that replay-
```
ing Λ(x0) at some time t > 0 may yield a different equilibrium coalition structure
```
```
π(x0) = π(x) for different states x0 = x.
```
```
Definition 5 The initial equilibrium structure π(x0) is strongly time consistent if it
```
```
does not change with respect to the game position, i.e., π(x0) = π(x) for all x ∈ X .
```
Next we turn to the classic cake eating application and show how to compute the
partition function as well as the equilibrium coalition structure for an arbitrary number
```
of agents n ∈ IN \ {0}.
```
3 Cake Eating
```
Consider n identical agents. The agents eat a cake over the time interval t ∈ [0, ∞).
```
```
We denote the size of the cake at time instant s ∈ [t, ∞) by x(s) ∈ X , with X = (0, x0]
```
being the state space and x0 > 0 the initial size of the cake. For technical reasons we
```
assume that the agents never eat the entire cake, and thus x(t) > 0 for all t ≥ 0. The
```
```
consumption rate of any agent i ∈ N is denoted by ui(s) ∈ U i = IR+. The size of the
```
cake evolves over time according to the following dynamic system:
⎧
⎨
⎩
```
˙x(s) = −
```
∑
i∈N
```
ui(t) (s ≥ t),
```
```
x(t) = x ∈ X .
```
```
(2)
```
We assume that each agent i derives instantaneous log payoffs from consumption
```
Fi(ui) = ln(ui). If the agents eat the entire cake such that there exists a time instant t =
```
```
inf{t > 0 | x(t) = 0}, then there is nothing left to consume, which implies ui(t) = 0
```
```
for all t ≥ t and i ∈ N . Since Fi(0) is undefined, we make the assumption x(t) > 0
```
for all t ≥ 0.
Proposition 1 For π ∈ Π there exists a Nash equilibrium for the cake eating game
```
characterized by the following strategies μ(x) and |π| value functions {vS (x)}S∈π :
```
```
μi(x) = r|S| x (i ∈ S)
```
```
vS (x) = |S|r (ln(rx) − ln(|S|) − |π|) .
```
306 S. Hoof
Proof Consider the maximizers of the right-hand side of the HJB equation
```
(
```
1
```
v′S (x) , . . . ,
```
1
```
v′S (x)
```
```
)
```
= arg max
u S ∈U S
⎧
⎨
⎩
∑
i∈S
```
ln(ui) − v′S (x)
```
⎛
⎝∑
i∈S
ui +
∑
```
C∈π\{S}
```
∑
j∈C
```
μj(x)
```
⎞
⎠
⎫
⎬
⎭ .
The maximized HJB equation then reads
```
rvS (x) = −|S| ln
```
```
(
```
```
v′S (x)
```
```
)
```
```
− |S| − v′S (x)
```
∑
```
C∈π\{S}
```
|C|
```
v′C (x) .
```
```
We guess the functional form of the value function vS (x) = αS ln(x) + βS , where
```
αS , βS ∈ IR denote some constants to be determined. The maximized HJB equation
then becomes
```
r S (αS ln(x) + βS ) = −|S| ln
```
```
( αS
```
x
```
)
```
− |S| − αSx
∑
```
C∈π\{S}
```
|C|x
αC.
This equation needs to hold for all x ∈ X . We thus collect the terms containing x and
rewrite the equation as follows:
```
ln(x) (rαS − |S|)
```
︸ ︷︷ ︸
=0
- rβS + |S|(ln(αS ) + 1) + αS
∑
```
C∈π\{S}
```
|C|
αC
︸ ︷︷ ︸
=0
= 0.
The equation is true for all x ∈ X if the constants satisfy
αS = |S|r and βS = − 1r
⎡
```
⎣|S|(ln(αS ) + 1) + αS∑
```
```
C∈π\{S}
```
|C|
αC
⎤
⎦ .
```
Substituting the coefficients (αS )S∈π yields for βS
```
βS = − 1r
⎡
⎣|S|
```
(
```
ln
```
( |S|
```
r
```
)
```
- 1
```
)
```
- |S|r
∑
```
C∈π\{S}
```
|C|r
|C|
⎤
⎦
```
= − |S|r (ln(|S|) − ln(r) + |π|).
```
```
Eventually, one derives the equilibrium strategies μi(x) for i ∈ S as well as value
```
```
functions vS (x) for S ∈ π
```
Equilibrium Coalition Structures of Differential Games … 307
```
μi(x) = 1v′
```
```
S (x)
```
= 1αS
x
= r|S| x,
```
vS (x) = αS ln(x) + βS = |S|r (ln(rx) − ln(|S|) − |π|) = V (x, S, π).
```

```
Now we can also compute the state trajectory by solving (2)
```
⎧
⎨
⎩
```
˙x(s) = −
```
∑
S∈π
∑
i∈S
```
μi(x(s)) = −
```
∑
S∈π
∑
i∈S
r
```
|S| x(s) = −x(s)r|π| (s ≥ t)
```
```
x(t) = x ∈ X
```
for
```
x(s) = xe−(s−t)r|π|.
```
It is noteworthy that the trajectory depends only on the number of coalitions |π| ∈ N ,
but not directly on the number of agents n. That is, we could end up in the odd
situation that n → ∞ agents consume less than n = 2 agents if the grand coalition
forms |π| = 1 for the first case, but the two agents split |π| = 2 in the latter case.
Next we show how to derive the equilibrium coalition structure of the cake eating
```
game. For any i ∈ S the payoff is given by (with π = (σ ))
```
```
gi(x, σ ) = V (x, S, (σ ))|S| = 1r (ln(rx) − ln(|S|) − | (σ )|) .
```
Now we need to distinguish two cases. If i has a turn, she determines the size of
the coalition σi = |S|. If she has no turn, her payoff depends on the size player
```
max{j ∈ N | σj > 0, j < i} has chosen.
```
```
gi(x, σ ) = 1r
```
⎧
⎪⎪⎨
⎪⎪⎩
```
(ln(rx) − ln(σi) − | (σ )|) if
```
i−1∑
```
j=1
```
σj < i,
```
(
```
```
ln(rx) − ln(σmax{j∈N |σj >0, j<i}) − | (σ )|
```
```
)
```
else.
Proposition 2 The equilibrium coalition structure is strongly time consistent.
Proof Generally, the equilibrium action is the payoff maximizer
```
σ i(x) ∈ arg max
```
```
σi ∈Σi (hi )
```
```
gi(x, σi, σ −i(x)).
```
For all agents i ∈ N , however, there is no interaction between the state x and the
action σi
308 S. Hoof
```
∂2 gi(x, σ )
```
∂x∂σi= 0 ∀i ∈ N .
```
The equilibrium action is thus state redundant, i.e., σ = σ (x) for all x ∈ X , and so is
```
```
the equilibrium coalition structure π = (σ ) = (σ (x)) = π(x) for all x ∈ X . 
```
```
We will thus drop x as an argument of σ (x) and Λ(x) and simply write σ for the
```
equilibrium profile of the game Λ. Before turning to the application again, we briefly
discuss why the order of coalition choice does not change the stable coalition struc-
ture up to a permutation of the agent’s indice i. Denote by p : N → N an arbitrary
permutation of the agents and by P the set of all permutations. In the game of choice
```
of coalition size, the order of choice is then from p(1) to p(n). Due to symmetry, the
```
```
identity of agents within a coalition is not important for stability; only the size of a
```
coalition is important. If pσ denotes the equilibrium profile under the rule of order
p, then σ = pσ for all p ∈ P.
Example 1 To get an idea of the previously introduced concepts let us first consider
```
the three-player case with N = {1, 2, 3}. Then we need to distinguish four strategy
```
profiles and associated partitions
```
σ 1 = (3, 0, 0)  → (σ 1) = {{1, 2, 3}}
```
```
σ 2 = (2, 0, 1)  → (σ 2) = {{1, 2}, {3}}
```
```
σ 3 = (1, 2, 0)  → (σ 3) = {{1}, {2, 3}}
```
```
σ 4 = (1, 1, 1)  → (σ 4) = {{1}, {2}, {3}}.
```
Now we consider Bloch’s game. Beginning with agent i = 3 we solve the game
backwards and maximize payoffs. Agent 3 only has a turn if the history is h3 ∈
```
{(1, 1), (2, 0)} and the strategy set is a singleton Σ3(h3) = {1}, since she is last in
```
the row:
1 = arg max
```
σ3∈{1}
```
```
g3(x, h3, σ3) = arg max
```
```
σ3∈{1}
```
```
{ 1
```
```
r [ln(rx) − ln(σ3) − 3]
```
```
}
```
.
```
In this case the number of coalitions equals | (1, 1, 1)| = 3. Agent 2 only has a turn
```
```
if the history is h2 = (1) and she has the option to become a single or to integrate
```
```
the last agent Σ2(h2) = {1, 2}. In the decision problem of agent 1 and 2 we further
```
need to employ an indicator function, because the number of coalitions changes with
```
respect to the decision of an agent. For example, σ2 = 1 yields | (1, 1, 1)| = 3 and
```
```
σ2 = 2 yields | (1, 2, 0)| = 2. Given agent 2 has a turn, it is optimal to integrate
```
the last agent.
2 = arg max
```
σ2 ∈{1,2}
```
```
g2(x, h2, σ2, 1) = arg max
```
```
σ2 ∈{1,2}
```
```
{ 1
```
r
[
```
ln(rx) − ln(σ2) −
```
```
(
```
```
2 + 1{1}(σ2)
```
```
)]}
```
.
Equilibrium Coalition Structures of Differential Games … 309
Fig. 1 Game Tree
Knowing the reaction of the followers, the first agent now chooses to become a
```
singleton:
```
1 = arg max
```
σ1∈{1,2,3}
```
```
g1(x, σ1, 2, 1) = arg max
```
```
σ1∈{1,2,3}
```
```
{ 1
```
r
[
```
ln(rx) − ln(σ1) −
```
```
(
```
```
1 + 1{1,2}(σ1)
```
```
)]}
```
.
```
The associated game tree with equilibrium path (bold red) is illustrated in Fig. 1.
```
```
The equilibrium actions are thus given by σ = (1, 2, 0), resulting in the equilibrium
```
```
structure π = {{1}, {2, 3}}. The grand coalition is not stable, because each agent has
```
an incentive to freeride on the remaining double coalition. The fully noncooperative
coalition structure is not stable either, because here either two or all three agents have
```
an incentive to form a coalition. Then we can readily deduce that π ∈ {π ∈ Π | |π| =
```
```
2} is stable, because no agent has an incentive to deviate. The single will not join
```
the double coalition, because her payoff decreases and the double coalition will not
split, because then three singles remain. It is noteworthy that we only consider myopic
deviations. One may argue that the double coalition in π splits, because then the grand
coalition is beneficial for all agents afterward. We abstract from this farsighted view,
because one ends up cycling. Reconsidering the order independence, we should note
```
that (1, 2, 0) is the equilibrium profile for all choice orders {p(1), p(2), p(3)}.
```
Next we are going to characterize the equilibrium coalition structures for any
```
number of agents n ∈ IN \ {0}. For an arbitrary history hi ∈ Hi let ρ<i(hi) denote the
```
number of coalitions already formed up to agent i. Further let
```
I (i | σ i+1, . . . , σ n) = 1 + I (i + σi | σ i+σi +1, . . . , σ n)
```
310 S. Hoof
denote the number of coalitions that follow agent i after she has chosen her action σi,
```
conditioned on the equilibrium actions of the agents that follow her (σ i+1, . . . , σ n).
```
On every stage i ∈ N the total number of coalitions is then defined recursively by
```
| (hi, σi, σ i+1, . . . , σ n)| = ρ<i(hi) + 1 + I (i + σi | σ i+σi +1, . . . , σ n),
```
and agent i ∈ N thus solves on stage i ∈ N
arg max
σi ∈Σi
```
gi(x, hi, σi, σ i+1, . . . , σ n)
```
= arg max
σi ∈Σi
```
{ 1
```
r
[
```
ln(rx) − ln(σi) − ρ<i(hi) − 1 − I (i + σi | σ i+σi +1, . . . , σ n)
```
```
]}
```
= arg max
σi ∈Σi
```
{
```
```
− ln(σi) − I (i + σi | σ i+σi +1, . . . , σ n)
```
```
}
```
```
=σ i(σ i+1, . . . , σ n).
```
```
With the terminal condition I (n + 1) = 0, the problem of finding a stable coalition
```
structure reduces to solve a simple recursive program. In Algorithm 1 one finds the
pseudocode to compute the equilibrium actions σ of the game Λ for an arbitrary n.
```
The equilibrium coalition structure is then simply π = (σ ).
```
Algorithm 1 Equilibrium profile σ of Λ
```
Require: n ∈ IN, I = (0, . . . , 0) (n+1)×1 , σ = (0, . . . , 0)n×1 , N = {1, 2, . . . , n}
```
for i = n to 1 do
```
Σi = {1, . . . , n − (i − 1)}
```
```
gi (σi ) = − ln(σi ) − I (i + σi )
```
σ i = arg maxσ
i ∈Σi
```
gi (σi )
```
```
{comment: if σ i > 1, then (σ i+1, . . . , σ i+σ i −1) = (0, . . . , 0)}
```
```
q = 0;
```
for k = i to n do
if q = 0 then
```
q = σ k − 1
```
else
σ k = 0
```
q = q − 1
```
end if
end for
```
I (i) = 1 + I (i + σ i )
```
end for
Equilibrium Coalition Structures of Differential Games … 311
4 Example
Since we are not able to solve for the equilibrium coalition structure in closed form,
we solve the problem via MATLAB. Without memory constraints, one could compute
the stable coalition structure for an arbitrary n. Here we are able to compute the stable
coalition structures for up to 800′000′000 agents. Table 1 contains the translation of
the pseudocode into runnable MATLAB code. Outputs are the equilibrium actions
σ ∈ INn as well as the significantly shorter vector of positive equilibrium actions
```
σ >0 = (σ i : σ i > 0, i ∈ N ) ∈ IN dim(σ >0 ).
```
Next we want to understand the formation of equilibrium coalition structures.
```
Therefore, consider first the number of agents (n’s) such that σ >0 = (n) and the
```
```
grand coalition is an equilibrium π = {N }.
```
Proposition 3 Define the set A as follows:
```
A = {1, 2, 4, 7, 13, 24, 44, 79, 146, 268, 482, 873, 1′580, 2′867, 5′191,
```
9′413, 17′057, 30′917, 56′029, 101′550, 184′049, 333′573, 604′568,
1′095′720, 1′985′887, 3′599′229, 6′523′256, 11′822′773, 21′427′636,
38′835′525, 70′385′646, 127′567′200, 231′203′255, 419′033′616,
```
759′458′042}.
```
```
For n ∈ A the grand coalition is stable, i.e., σ >0 = (n).
```
Proof Compute σ >0 for all n ∈ A via the program in Table 1. 
Reconsidering the state trajectory
```
x(t) = x0e−rt|π|
```
it is striking to note that n = 3 agents faster exploit the cake than, say, n =
759′458′042, because in the first case two coalitions form while in the latter only
one.
```
Denote an element of A by ak with k ∈ {1, . . . , 35}. When plotting ak+1/ak for
```
```
k ∈ {1, . . . , 34} one finds that the growth rate approaches 1.812403619 (cf. Fig. 2).
```
Hence the series becomes very sparse and the probability that the grand coalition
forms decreases monotonously in n. Put differently, the more agents, the less likely
the grand coalition is stable.
We should further note that the elements of A form a complete sequence: i.e., any
element of A larger than 4 can be expressed as a sum of values in the sequence, using
each value at most once.
312 S. Hoof
Table 1 MATLAB computation of positive equilibrium profile σ >0
% housekeeping
```
clear all; clc;
```
% initialization
```
n = 800000000; % number of agents
```
```
I = zeros(n+1,1); % storage index
```
```
s = zeros(n,1); % storage final actions
```
```
N = 1:n; % set of agents
```
% backward induction loop
```
for i=fliplr(N)
```
```
S = 1:n-i+1; % action set
```
```
g = -log(S)’-I(i+S); % payoffs
```
```
[g,j] = max(g); % max payoff
```
```
s(i) = S(j); % argmax payoff
```
% construction of vector with equilibrium actions
```
q = 0;
```
for k=i:n
if q == 0
```
q = s(k) - 1;
```
else
```
s(k) = 0;
```
```
q = q - 1;
```
end
end
```
I(i) = 1 + I(i+s(i)); % recursion
```
end
% collection of positive equilibrium actions
```
s_pos = s(s>0)
```
Equilibrium Coalition Structures of Differential Games … 313
0 5 10 15 20 25 30 351.7
1.8
1.9
2
k
ak+1
ak
Fig. 2 Growth rate ak+1/ak
```
Table 2 Positive equilibrium actions σ >0 = q(n) for n ∈ {1, . . . , 50}
```
```
n q(n)
```
```
1 (1)
```
```
2 (2)
```
```
3 (1, 2)
```
```
4 (4)
```
```
5 (1, 4)
```
```
6 (2, 4)
```
```
7 (7)
```
```
8 (1, 7)
```
```
9 (2, 7)
```
```
10 (1, 2, 7)
```
```
n q(n)
```
```
11 (4, 7)
```
```
12 (1, 4, 7)
```
```
13 (13)
```
```
14 (1, 13)
```
```
15 (2, 13)
```
```
16 (1, 2, 13)
```
```
17 (4, 13)
```
```
18 (1, 4, 13)
```
```
19 (2, 4, 13)
```
```
20 (7, 13)
```
```
n q(n)
```
```
21 (1, 7, 13)
```
```
22 (2, 7, 13)
```
```
23 (1, 2, 7, 13)
```
```
24 (24)
```
```
25 (1, 24)
```
```
26 (2, 24)
```
```
27 (1, 2, 24)
```
```
28 (4, 24)
```
```
29 (1, 4, 24)
```
```
30 (2, 4, 24)
```
```
n q(n)
```
```
31 (7, 24)
```
```
32 (1, 7, 24)
```
```
33 (2, 7, 24)
```
```
34 (1, 2, 7, 24)
```
```
35 (4, 7, 24)
```
```
36 (1, 4, 7, 24)
```
```
37 (13, 24)
```
```
38 (1, 13, 24)
```
```
39 (2, 13, 24)
```
```
40 (1, 2, 13, 24)
```
```
n q(n)
```
```
41 (4, 13, 24)
```
```
42 (1, 4, 13, 24)
```
```
43 (2, 4, 13, 24)
```
```
44 (44)
```
```
45 (1, 44)
```
```
46 (2, 44)
```
```
47 (1, 2, 44)
```
```
48 (4, 44)
```
```
49 (1, 4, 44)
```
```
50 (2, 4, 44)
```
7 = 1 + 2 + 4
13 = 2 + 4 + 7
24 = 4 + 7 + 13
44 = 7 + 13 + 24
79 = 4 + 7 + 24 + 44
...
One may conjecture that any equilibrium coalition structure can be constructed by
```
elements of A. In Table 2 we list the positive equilibrium actions σ >0 = q(n) for
```
```
n ∈ {1, . . . , 50}.
```
314 S. Hoof
```
It turns out that for all n ∈ {1, . . . , 50} the positive equilibrium actions are a
```
recursive concatenation of elements of A. For example, consider n = 40 and let
```
a(n) = max{a ∈ A | a ≤ n}. Then one computes σ >0 via
```
```
σ >0 = q(40) =(q(40 − a(40)), a(40))
```
```
=(q(16), 24)
```
```
=(q(16 − a(16)), a(16), 24)
```
```
=(q(3), 13, 24)
```
```
=(q(3 − a(3)), a(3), 13, 24)
```
```
=(q(1), 2, 13, 24)
```
```
=(1, 2, 13, 24).
```
This observation leads us to the following conjecture.
```
Conjecture 1 The positive equilibrium actions σ >0 for n ∈ {1, . . . , 800′000′000}
```
are given by the following recursive concatenation:
```
σ >0 = q(n) =
```
```
{
```
```
(q(n − a(n)), a(n)) if n /∈ A,
```
n else.
5 Conclusion
We introduced differential games in partition function form and a notion of endoge-
nous coalition formation for symmetric differential games. The method at hand is
generally applicable for any game. In fact, identifying equilibrium coalition struc-
tures boils down to solve a finite dynamic programming problem in which the number
of stages equals the number of agents. If the equilibrium actions are state dependent,
```
then one may discretize (a subset of) the state space and thus solves the recursive
```
problem on a restricted domain. Then the problem of time consistency may arise in
the sense that an initially stable coalition structure becomes unstable over time. This
topic remains for further study.
Acknowledgments I thank Florian Wagener and an anonymous referee for valuable comments.
The paper was presented at the 18th ISDG Symposium. This work was partially supported by
```
the German Research Foundation (DFG) within the Collaborative Research Center “On-The-Fly
```
```
Computing” (SFB 901) under the project number 160364472-SFB901 and the German Academic
```
```
Exchange Service (DAAD) under the “Kongressreisenprogramm”.
```
Equilibrium Coalition Structures of Differential Games … 315
References
1. Ba¸sar, T. and Olsder, G. J. (1999): Dynamic Noncooperative Game Theory, 2 edn, SIAM
2. Bloch, F. (1996): Sequential Formation of Coalitions in Games with Externalities and Fixed
Payoff Division, Games and Economic Behavior 14, 90–123
3. Calvo, E. and Rubio, S. J. (2013): Dynamic Models of International Environmental Agree-
```
ments: A Differential Game Approach, International Review of Environmental and Resource
```
```
Economics 6(4), 289–339
```
4. Caputo, M. R. (2005): Foundations of Dynamic Economic Analysis, Cambridge University
Press
5. Clemhout, S. and Wan, H. Y. (1989): On Games of Cake-Eating. In: van der Ploeg, F. and de
```
Zeeuw, A. (eds), Dynamic Policy Games in Economics, Vol. 181 of Contributions to Economic
```
Analysis, Elsevier, 121–155
6. de Zeeuw, A. (2018): Dynamic Games of International Pollution Control: A Selective Review.
```
In: Ba¸sar, T. and Zaccour, G. (eds), Handbook of Dynamic Game Theory, Springer, 703–728
```
7. Hoof, S. (2019): Linear-state differential games in partition function form, International Game
```
Theory Review 21(4)
```
8. Kóczy, L. Á. (2018): Partition Function Form Games, Springer
9. Parilina, E. and Sedakov, A. (2020): Stable Coalition Structures in Dynamic Competitve
```
Envirnoment. In: Pineau, P.-O., Sigué, S. and Taboubi, S. (eds), Games in Management Science,
```
Springer, 381–396
10. Petrosjan, L. and Zaccour, G. (2003): Time-consistent Shapley value allocation of pollution
cost reduction, Journal of Economic Dynamics ans Control 27, 381–398
11. Ray, D. and Vohra, R. (2015): Coalition Formation. In: Young, H. P. and Zamir, S. (eds), Vol.
4 of Handbook of Game Theory with Economic Applications, Elsevier, Chapter 5, 239–326
12. Thrall, R. M. and Lucas, W. F. (1963): N -person games in partition function form, Naval
```
Research Logistics Quarterly 10(4), 281–298
```
13. Dockner, E. and Wagener, F. (2014): Markov perfect Nash equilibria in models with a single
```
capital stock, Economic Theory 56(3), 585–625
```
14. Zaccour, G. (2003): Computation of Characteristic Function Values for Linear-State Differen-
```
tial Games, Journal of Optimization Theory and Applications 117(1), 183–194
```
15. Zhao, J. (1992): The hybrid solutions of an N-person game, Games and Economic Behavior
```
4(1), 145–160
```
A Model for Partial Kantian Cooperation
Ioannis Kordonis
1 Introduction
```
It is very well known that equilibrium solutions are often inefficient (e.g., [1]). Thus,
```
the description of cooperative behaviors has evolved as an important topic in Game
Theory. In the context of repeated games, there is a lot of work on the imposition of
```
cooperative outcomes, under the name “folk theorems” (e.g., [2]). In the context of
```
Evolutionary Game Theory, the evolution of cooperation is an important topic as well
```
(e.g., [3, 4]). Here is also empirical evidence that people indeed behave cooperatively,
```
```
for example, when they exploit a shared resource ([5]). Other examples include people
```
```
who buy low-emission cars (e.g., electric or hybrid), even if this may not make much
```
sense from a narrow economic perspective, or contribute anonymously to charity.
In many game situations, however, there is a great multitude of different possible
cooperative outcomes that can be supported by models of fully rational players or
evolutionary models. Thus, an important question is “which one of those solutions
could describe or predict the actual outcomes?”.
This work studies the behavior of the players in game situations, in the case where
their behavior is affected by ethical considerations. Particularly, we assume that they
```
are partially following Kant’s “categorical imperative” ([6]). The most common form
```
of the categorical imperative, stated first in the book Groundwork of the Metaphysics
of Morals in 1785, reads as follows:
Act only according to that maxim whereby you can, at the same time, will that it should
become a universal law.
```
Similar ideas have appeared much earlier (for example, the golden rules of various
```
```
religious texts and traditions), but Kant formulates this principle in a strict, almost
```
I. Kordonis (B)
CentraleSupélec, Avenue de la Boulaie, 35576 Cesson-Sévigné, France
e-mail: jkordonis1920@yahoo.com
```
© The Editor(s) (if applicable) and The Author(s), under exclusive license
```
to Springer Nature Switzerland AG 2020
D. M. Ramsey and J. Renault (eds.), Advances in Dynamic Games,
Annals of the International Society of Dynamic Games 17,
```
https://doi.org/10.1007/978-3-030-56534-3_13
```
317
318 I. Kordonis
mathematical way. Still, there can be various interpretations of the categorical imper-
ative, leading eventually to different possible models. Let us describe some of the
issues that may arise when interpreting the categorical imperative. First, the players
may have different action sets, their actions may have a different impact on the others,
or they may have different preferences. Hence, a “maxim” seems most appropriate
```
to be interpreted as a strategy of a player (i.e., a mapping from a state, preference, or
```
```
type to the action set) and not an action. Second, when a certain player optimizes for
```
the strategy, which she assumes that the others would also follow, it is not reasonable
to assume that all the other players having different states or preferences would coop-
erate to optimize the particular player’s cost.1 To overcome this difficulty, we use the
```
notion of the veil of ignorance. This notion was introduced by Rawls ([7]) to describe
```
a hypothetical situation where a person decides about the rules of a society. However,
during this decision, she doesn’t know her position in this society, her abilities, or
even her tastes. Harsanyi used a very similar idea in an earlier text, under the name
```
equi-partition ([8])). Another issue is that the use of a veil of ignorance requires inter-
```
personal comparisons of utility. However, the need for interpersonal comparisons of
utility does not create a problem in a descriptive model since players do not need to
agree on the scaling of the utilities of the other persons. What is important is how
each player perceives the utilities of the others. Finally, the players know that it is
not true that all the others will follow their strategy. Hence, it is interesting to study
how the players would behave if each one of them assumes that some of the others
would follow her strategy.
1.1 Contribution
The primary contribution of this work is the definition of a notion of a partially
```
Kantian cooperative outcome (the r-Kant-Nash equilibrium) and the study of its
```
existence and uniqueness properties. An important building block is to assign to
```
each player an imagined (virtual) group of players. The player assumes that within
```
her virtual group, all the players use the same strategy aiming to optimize an overall
goal of the group. Equivalently, the player decides her strategy before knowing her
place in the virtual group. The virtual group of a player belongs exclusively to her
```
imagination (perception or understanding of social identity). Thus, the players do not
```
need to agree on the construction of their virtual groups. The aim of the virtual group
reflects the idea of the veil of ignorance. Thus, the strategy of the group minimizes
1 Let us quote a part of a story in which Woody Allen makes fun of several philosophers. This passage
illustrates some issues arising when interpreting the categorical imperative. “No less misguided was
Kant, who proposed that we order lunch in such a manner that if everybody ordered the same thing
the world would function in a moral way. The problem Kant didn’t foresee is that if everyone orders
the same dish there will be squabbling in the kitchen over who gets the last branzino. “Order like
you are ordering for every human being on earth,” Kant advises, but what if the man next to you
doesn’t eat guacamole? In the end, of course, there are no moral foods-unless we count soft-boiled
eggs.” From Woody Allen “THUS ATE ZARATHUSTRA” New Yorker JULY 3, 2006.
A Model for Partial Kantian Cooperation 319
```
a (risk-sensitive) cost of a random member of the group. This formulation includes
```
```
the case of minimizing the average cost (or equivalently the total cost), inspired by
```
[8], and the minimization of the maximum cost, inspired by [7].
We use a model with a continuum of players. The reason for this choice is that
we would like to describe abstract anonymous groups of players. Each player has
an individual type and a social preference type. The individual type describes her
position, i.e., how her actions affect others and also her preferences. The social
preference type characterizes the way the player constructs her imagined group. A
set of strategies is an r-Kant-Nash equilibrium if the action of each player coincides
with the one she would choose by solving the problem of her virtual group. We then
study the existence, uniqueness, and computation of r-Kant-Nash equilibrium in the
case where there is a finite possible number of types. Then, we give a characterization
of the r-Kant-Nash equilibrium in the case of infinite, one-dimensional, number of
types. We use several examples, including a fishing game, a vaccination game, an
opinion game, and an electric vehicle charging game to illustrate the use of r-Kant-
Nash equilibrium and its properties compared to other notions.
1.2 Related Notions
This work is very much inspired by the work of Roemer. A very much related
notion is Kantian equilibrium, introduced in [9, 10]. A set of strategies constitutes a
multiplicative Kantian equilibrium if no player has a motivation to multiply her action
by any positive constant ρ assuming that the rest of the players would also multiply
their actions by the same constant ρ, as well. Similarly, he defines the additive Kantian
equilibrium. It turns out that under weak conditions, the Kantian equilibria belong
to the Pareto frontier and under some additional conditions it coincides with the
most efficient point. However, often Pareto frontier contains fundamentally unjust
solutions. It is probably not reasonable to expect that a player who is very much
disadvantaged by a solution in the Pareto frontier to be willing to cooperate with
the others, while she has the opportunity to improve her position by changing her
action unilaterally. Ghosh and Long [11] and Long [12] extended [9] in two distinct
directions. First, they consider dynamic games and second study games with mixed
```
Kantian and Nash players and introduce the notions of (inclusive and exclusive)
```
Kant-Nash equilibria. Furthermore, Long in [13] introduced the notion of virtual co-
movers equilibrium. In this model, each player considers a virtual co-movers group
and assumes that if she changes her strategy, then all the members of the virtual
co-movers group would change their strategy accordingly. The basic difference of
the current work with the ones mentioned above is the way the categorical imperative
is interpreted. Particularly, these works assume that the players “universalize” the
changes in their actions, while in this work, we assume that they “universalize” their
strategy.
320 I. Kordonis
Another related line of research is the theory of Belief Distorted Nash Equilibrium
[14, 15], due to Wiszniewska-Matyszkiel. These works describe the possibility of
cooperative outcomes in games, based on some misconceptions of the players, which
however lead to overall outcomes which are consistent with their observations.
2 The r-Kant-Nash Equilibrium
2.1 The Model
```
In this section, we describe a game theoretic model with a continuum of players (e.g.,
```
```
[16]) and then introduce the notion of r-Kant-Nash equilibrium. We assume that all
```
the sets and functions thereafter are measurable.
```
We consider a set of players I = [0, 1] distributed uniformly (according to the
```
```
Lebesgue measure λ). Let (I, B, λ) be the corresponding probability space, where B
```
is the Borel σ -algebra. Each player i ∈ I has an individual type x i describing both
the preferences of i and the effects of her actions on the costs of the others. Denote
by X the set of possible individual types and define the function x : I → X with
```
x(i) = x i . Assume also that each player i ∈ I has a social preference type θi and
```
denote by Θ the set of possible social preference types. Social preference types relate
to the notion of virtual groups which will be explained in detail later on. Similar to
```
x there is a function θ : I → Θ with θ(i) = θi .
```
Each player i ∈ I chooses an action u i from an action set U . We focus on sym-
metric action profiles, i.e., profiles where u i depends only on x i and θi . Particularly,
```
for the function u : I → U , with u(i) = u i , there is a function ¯γ : X × Θ → U such
```
```
that u(i) = ¯γ (x(i), θ(i)), for all i ∈ I .
```
The cost function of each player is given by
```
Ji = J (u i , ¯u, x i ), (1)
```
where ¯u is statistic of the players’ actions given by
¯u =
∫
I
```
g(u(i), x(i))λ(di), (2)
```
for a function g : U × X → Rm .
```
Let us then describe the idea of a virtual (imagined) group:
```
```
(i) Each player i ∈ I assumes that she is associated with a virtual group of players.
```
This group reflects the social considerations of player i. The virtual group of
```
player i is described by a sub-probability measure r i (·) on (I, B), i.e., a finite
```
```
measure with r i (I ) ≤ 1. For every A ∈ B, the sub-probability measure should
```
```
satisfy r i (A) ≤ λ(A). If r i (I )  = 0, let us denote by ¯r i (·) the probability measure
```
```
r i (·)/r i (I ). If r i (I ) = 0 then the virtual group of this player constitutes only of
```
A Model for Partial Kantian Cooperation 321
herself. We assume that type of the virtual group of player i depends only on x i
```
and θi . That is, if for i′ ∈ I , we have x i = x i′ and θi = θi′ imply r i (·) = r i′ (·).
```
```
(ii) Player i ∈ I assumes that all the members j ∈ I of her virtual group are bound
```
```
to use the same strategy ˜u i ( j). We again assume symmetry, i.e., there is a
```
```
function γ : X × θ × X → U with ˜u i ( j) = γ (x( j), x i , θi ). We use also the
```
```
notation ˜u i ( j) = γx i ,θi (x( j)).
```
```
(iii) The aim of the virtual group is to minimize a risk-sensitive aggregate cost of its
```
```
members. We denote by βθi ∈ (−∞, ∞) the risk factor of the virtual group. If
```
βθi = 0 the group is risk neutral, when βθi > 0 is risk averse, and for βθi < 0
```
risk loving. For a risk neutral virtual group (βθi = 0), if r i (I ) > 0, define the
```
cost of the virtual group of player i as
```
˜Ji (γ , ¯γ ) = E [J (γx i ,θi (x( j)), ¯u i , x( j))wx i ,θi (x( j))] , (3)
```
```
where j is a player selected randomly according to ¯r i (·) and the factor wx i ,θi (·) is
```
a weighting function indicating the relative importance of the several positions
in the group. The value of ¯u corresponds to the g-mean value of the actions
```
of all the players assuming that the members of the group are using ˜u i ( j) =
```
```
γx i ,θi (x( j)) and the strategy of the players not belonging to the group is given
```
```
by u( j) = ¯γ (x( j), θ( j)). Thus
```
```
¯u = Tx i ,θi (γ , ¯γ ) =
```
∫
```
Ig( ¯γ (x( j), θ( j)), x( j))(λ − ¯r i )(d j) +
```
∫
```
Ig(γx i ,θi ( j), x( j))r i (d j).
```
```
(4)
```
For θi  = 0 define
```
˜Ji (γ , ¯γ ) = 1
```
βθiln E
```
{
```
```
exp[βθi J (γx i ,θi (x( j)), ¯u i , x( j))wx i ,θi (x( j))]
```
```
}
```
```
. (5)
```
```
If r i (I ) = 0, then the cost of the virtual group of player i coincides with the
```
```
actual cost given by (1). A justification for this choice is given in Appendix.
```
```
(iv) For the case where X and Θ are finite we extend the definition of the virtual
```
group’s cost for the case βi = ∞. The cost is given by
```
˜Ji (γ , ¯γ ) = max
```
x′ ∈X i
```
{
```
```
J (γx i ,θi (x′), ¯u i , x′)wx i ,θi (x′)]
```
```
}
```
```
, (6)
```
```
where X i = {x′ ∈ X : r i ({ j ∈ I : x( j) = x′ }) > 0}.
```
```
Remark 1 (i) The virtual groups defined have many similarities with the virtual
```
co-movers model of [11, 13]. Specifically in the virtual co-movers model each
player assumes that if she changes her strategy, a subset of the others would
also change theirs accordingly.
```
(ii) The definition of the members of the virtual group of each player offers a
```
lot of flexibility. The two extreme cases are the case where r = 0 and the
```
group of each player consists only of herself and the case where r i (·) = λ(·).
```
322 I. Kordonis
```
In the intermediate cases, the quantity r i (·) may relate to some perceived social
```
identity, such as race, class, age, religion, gender, ethnicity, ideology, nationality,
sexual orientation, culture, or language.2
```
(iii) The virtual groups, the way they are defined, are purely imaginary. Thus, the
```
fact that a player i assumes that another player j is included in her virtual group
does not necessarily imply that the virtual group of player j includes i.
```
(iv) The expectation in models (3) and (5) corresponds to the random position of
```
the player in the virtual group. In other words, behind the veil of ignorance,
```
the player does not know at which place of the (imagined) society she is going
```
to end up. Probably, as Rawls suggested, she might be risk averse against this
uncertainty.
Based on the idea of a virtual group, we introduce the notion of the r-Kant-Nash
equilibrium.
```
Definition 1 A set of strategies u : I → U in the form u(i) = ¯γ (x(i), θ(i)) is an
```
```
r-Kant-Nash equilibrium, if for all possible combinations (x i , θi ) there is a solution
```
```
˜u i : I → U with ˜u i ( j) = γx i ,θi (x( j)) to the optimization problem:
```
minimizeγx
i ,θi
```
˜Ji (γ , ¯γ ), (7)
```
```
which satisfies γ (x i , x i , θi ) = ¯γ (x i , θi ).
```
```
Remark 2 (i) The r-Kant-Nash equilibrium is a situation where each player imple-
```
ments in the actual game an action that would be optimal for her virtual group,
assuming that all the members of the group implemented their optimal actions.
```
(ii) The weighting factor wx i ,θi may have two discrete roles. At first, Player i may
```
believe that in her virtual group, some subgroup of players should be favored
over the others. A second, and probably more important, role is to resolve the
so-called interpersonal comparison of utility problem, i.e., the fact that the
players may not agree on how to scale the utility functions of other players.
2.2 Special Cases and Relation to Other Concepts
The notion of r-Kant-Nash equilibrium has several interesting special cases.
```
(i) The Nash equilibrium. Assuming that r ≡ 0 and βθ = 0 each player uses her
```
best response to the actions of the other players. Hence, for these values the
r-Kant-Nash equilibrium coincides with the Nash equilibrium of the game with
```
a continuum of players (e.g., [17]).
```
2 From the identity politics article of Wikipedia.
A Model for Partial Kantian Cooperation 323
```
(ii) The (Bentham-) Harsanyi solution. Assume that βθ = 0 and r i (·) = λ(·).
```
```
Then, each player is risk neutral and optimizes for the mean cost (or equiv-
```
```
alently the sum of the costs) of all the players. This solution coincides with the
```
solution proposed in [8].
```
(iii) The Rawls solution. Assume that βθ = ∞ and r i (·) = λ(·) and that X and Θ
```
are finite. In this case, all the players minimize the cost function of the worst-
off participant, i.e., they use the minimax rule. This solution coincides with the
Rawls difference solution [7].
```
(iv) Efficient cooperation within coalitions. Consider the coalitions C1, . . . , C N ⊂
```
I and assume that C j , j = 1, . . . , N is a partition of I . Further, assume that
the virtual groups are the same with the coalitions. That is, for i ∈ C j it holds
```
r i (A) = λ(A ∩ C j )/λ(C j ). Finally, assume that for 1 ∈ C j it holds θi = j and
```
that within each coalition the players weight the others in the same way, i.e.,
```
w θi ,x i (x′) = gθi (x′). Then, within each coalition the players jointly optimize for
```
a weighted sum of their costs, and thus within each coalition there is an efficient
cooperation.
```
(v) The relation with the altruistic (other regarding) behavior is illustrated in the
```
following example.
```
Example 1 (The Fishing Game) We first compute the equilibrium to the game with
```
altruistic players. It is convenient to consider a game with a large number N of players
and then take the continuum limit. Let us note that the r-Kant-Nash equilibrium will
be computed directly for the game with a continuum of players. The cost function
of each one of the players is
```
Ji = u2i −
```
⎛
⎝1 − 1
N − 1
∑
j =i
u j
⎞
⎠ u i ,
where the first term corresponds to the effort of the fisher i and the second on the
revenues.
```
The altruistic (other regarding) cost for player i is
```
```
¯Ji = (1 − α/2)Ji + (α/2) ∑
```
j =i
```
J j = (1 − α/2)(u2i − u i ) + 1N − 1 u i
```
∑
j =i
```
u j + f (u−i ),
```
with α ∈ [0, 1].
The Nash equilibrium of the altruistic game is given by
u i = 2 − α6 − 2α .
Let us then consider the corresponding game with a continuum of players and
compute the partial Kantian strategy. The cost is given by
```
Ji = u2 − (1 − ¯u)u,
```
324 I. Kordonis
Fig. 1 Comparison of the actions and the costs of the players when they use a partially Kantian
versus an Altruistic criterion
where bar u =
∫
```
I u(i)λ(di). Assume that Θ = {θ} and X = {x} are singletons. Fur-
```
ther, assume that each player considers as her virtual group a fraction α of the other
players. Then, the r-Kant-Nash equilibrium in the form u = γ is characterized by
∂
```
∂γ J (u, ¯u) =
```
∂
```
∂u J (u, ¯u) +
```
∂
```
∂ ¯u J (u, ¯u)
```
∂ ¯u
∂γ = 0,
Hence,
2u − 1 + ¯u + αu = 0.
Due to symmetry:
```
u = 13 + α .
```
Figure 1 compares the actions and the costs of the players in the cases of an altruistic
versus a partially Kantian behavior. It turns out that, in this example, the Kantian
cooperation is more effective than the altruism. 
3 Finite Number of Individual and Social Types
In this section, we assume that the action set U is a subset of the m−dimensional
Euclidean space and that there is a finite set of possible individual-social-type
```
pairs (x1, θ1), . . . , (x N , θN ). The distribution of players is described by a vector
```
A Model for Partial Kantian Cooperation 325
```
p = [ p1 . . . p N ]. For the case of a finite number of types, we derive sufficient
```
conditions for the existence of an r-Kant-Nash equilibrium and characterize it in
terms of a variational inequality. To do so, let us first introduce some notation.
Denote by N ′ the number of different values of x k ’s and by ¯x1, . . . , ¯x N ′ their val-
```
ues. Denote also by σ the function such that σ (k) = k′ if x k = ¯x k′ . Consider the
```
virtual group of a player, having type k, and assume that this group has strategy γ .
```
Denote by ˜u k = [u k1, . . . , u k N ] the (imagined) action vector for the members of the
```
```
group, where u kk′ = γ (x k′ , x k , θk ). The form of the strategy implies that u kk′ = u kk′′
```
if x k′ = x k′′ . Thus, the vector ˜u k may be viewed as a member of the set U N ′. We will
```
use also the notation r kk′ = r i ({ j ∈ I : x( j) = x k′ , θ( j) = θk′ }) for an i ∈ I which
```
```
x(i) = x k and θ(i) = θk . Assume that all the player types have βθi < ∞.
```
A vector of actions u = [u 1, . . . , u N ] is an r-Kant-Nash equilibrium if there
exists a matrix u = [u kk′ ] such that, for every k, it holds u k = u kk and the strategy
˜u k = [u k1 . . . u k N ] is optimal for the virtual group of a player with type k, under
```
the constraint u kk′ = u kk′′ if σ (k′) = σ (k′′). The cost of a virtual group with action
```
vector ˜u k , assuming that the others are playing u , is given by
```
˜Jk ( ˜u k , u ) =
```
```
{ 1
```
βθiln
∑N
```
k′ =1 r kk′ exp[βθi wk (k′) ¯Jk,k′ ( ˜u k , u )], i f β  = 0, ∞∑
```
```
Nk′ =1 r kk′ wk (k′) ¯Jk,k′ ( ˜u k , u ), if β = 0 (8)
```
```
where ¯Jk,k′ ( ˜u k , u ) is the cost that a player who belongs to the virtual group and has
```
type k′ would have if the players of the group were using ˜u k and the rest u . Thus,
```
¯Jk,k′ ( ˜u k , u ) is given by
```
```
¯Jk,k′ ( ˜u k , u ) = J
```
```
(
```
˜u kk′ ,
N∑
k′′ =1
```
[g(u k′′ , x k′′ )( p k′′ − r kk′′ ) + g( ˜u kk′′ , x k′′ )r kk′′ ], x k′
```
```
)
```
```
. (9)
```
The following proposition adapts some standard results for the existence of a Nash
```
equilibrium (e.g., [18]) to the case of r-kant-Nash equilibrium. Before stating the
```
proposition let us recall the notions of quasi-convexity and pseudo-convexity [19].
```
A function f (u) defined on a convex set U is quasi-convex if for any real number
```
```
¯f the set {u ∈ U : f (u) ≤ ¯f } is convex. The function f is pseudo-convex if it is
```
```
differentiable and for any pair of points u1, u2 ∈ U such that ∇ f (u1)T (u2 − u1) ≥ 0
```
```
it holds f (u2) ≥ f (u1).
```
```
Proposition 1 Assume that U ⊂ Rm is compact and convex, that ˜Jk given by (8) is
```
```
continuous, and that ˜Jk (·, u ) is quasi-convex for every fixed u and every k. Then,
```
there exists an r-Kant-Nash equilibrium.
Proof Consider the set ¯U = U N ×N ′. For each type k = 1, . . . , N , consider the
correspondence Tk : ¯U ⇒ U N ′defined as follows. For a given a u ∈ ¯U , define
```
u = [u1σ (1) . . . u N σ (N )] ∈ U N . Then define:
```
326 I. Kordonis
```
Tk (u) = πU N ′
```
[
arg min
˜u k ∈Z
```
˜Jk ( ˜u k , u )
```
]
,
```
where πU N ′ denotes the projection to U N ′and Z = { ˜u ∈ U N : ˜u k′ =
```
```
˜u k′′ whenever x k′ = x k′′ }. Maximum theorem [20] implies that Tk is compact-
```
valued upper semi-continuous. Quasi-convexity implies that Tk is convex valued.
```
Thus, the correspondence T : ¯U ⇒ ¯U with T : u → T1(u) × · · · × T N (u) satis-
```
fies the conditions of Kakutani fixed point theorem. Therefore, there exists an
r-Kant-Nash equilibrium. 
A very simple sufficient condition for the existence of a Kant-Nash equilibrium is
given in the following corollary.
```
Corollary 1 Assume that U ⊂ Rm is compact and convex, and J (·, ·, x) is convex
```
for every fixed x, the function g is linear in u and βθk ≥ 0, for all k. Then there exists
an r-Kant-Nash equilibrium.
```
Proof The function ¯Jk,k′ (·, u ) defined in (9) is convex with respect to ˜u k . Indeed, in
```
```
the right-hand side of (9), the first two arguments of J , particularly, ∑Nk′′ =1[g(u k′′ , x k′′ )
```
```
( p k′′ − r kk′′ ) + g(u kk′′ , x k′′ )r kk′′ ] and ˜u kk′ are affine functions of ˜u k . Thus, convexity
```
```
of J implies that Ju k′ is convex. Now, the fact that exp(·) is increasing and convex
```
implies that the function,
N∑
k′ =1
```
r kk′ exp[βθi Ju ,k′ ( ˜u k ))],
```
```
is convex in ˜u k as well. Now, βθk ≥ 0 and the fact that the function ln(·) is increasing
```
imply that the quasi-convexity assumption of Proposition 1 is satisfied and the proof
of the corollary is complete. 
If the quasi-convexity assumption is strengthened to a pseudo-convexity, then the
r-Kant-Nash equilibrium can be characterized by a variational inequality.
```
Proposition 2 Assume that U ⊂ Rm is convex, that ˜Jk given by (8) is continuous,
```
```
and that ˜Jk (·, u ) is pseudo-convex and for every fixed u and every k. Consider also
```
```
the vector function F : U N 2 +N → Rm(N 2 +N ) given by
```
```
F( ˜u, u ) =
```
⎡
⎢⎢
⎢⎢
⎢⎢
⎢⎢
⎣
```
∇T˜u1˜J1( ˜u1, u )
```
...
```
∇T˜u N˜J1( ˜u N , u )
```
u 1 − ˜u11
...
u N − ˜u N N
⎤
⎥⎥
⎥⎥
⎥⎥
⎥⎥
⎦
```
. (10)
```
```
Then:
```
A Model for Partial Kantian Cooperation 327
```
(i) There is an r-Kant-Nash equilibrium if and only if there is a solution ( ˜u, u ) ∈
```
U N 2 +N to the variational inequality:
```
F T ( ˜u, u )
```
[ ˜u′ − ˜u,
```
(u )′ − u
```
]
```
≥ 0, for all ˜u′ ∈ U N 2, (u )′ ∈ U N . (11)
```
```
(ii) Assume that F is strictly monotone, i.e.,
```
```
(F( ˜u′, (u )′) − F( ˜u, u ))T
```
[ ˜u′ − ˜u,
```
(u )′ − u
```
]
```
> 0, (12)
```
```
for every pair ( ˜u, u )  = ( ˜u′, (u )′). Then, there is at most one r-Kant-Nash equi-
```
librium.
```
Proof (i) Consider a pair ( ˜u, u ) satisfying (11). Choosing ˜u′ = ˜u and (u 2)′ =
```
```
u 2, . . . , (u N )′ = u N we conclude that u 1 = ˜u11 . Similarly, u k = ˜u kk , for all k. Choos-
```
ing ˜u′i = ˜u i , for k = 1, . . . , k − 1, k + 1, . . . , N we conclude that ˜u k is optimal in
```
(8). Thus, ( ˜u, u ) corresponds to an r-Kant-Nash equilibrium. The proof of the con-
```
verse is similar.
```
(ii) It is a direct consequence of part (i) and Theorem 2.3.3 of [21]. 
```
Remark 3 For βθi  = 0, Proposition 2 holds true if instead of ˜Jk we use
N∑
k′ =1
```
r kk′ exp[βθi wk (k′) ¯Jk,k′ ( ˜u k , u )].
```
4 Examples of r-Kant-Nash Equilibrium
In this section, we investigate some properties of the r-Kant-Nash equilibrium using
some examples, namely, a vaccination game, static and dynamic fishing games,
an opinion game, and an electric vehicle charging game. We also compare it with
Roemer’s Kantian equilibrium. In all cases, we use examples with at most two types
of players in order to make the visualization of the results easier.
4.1 A Vaccination Game
We describe a simplified model for the spread of a disease, where all members of a
society may choose to vaccinate or not. The model is a slight modification of the one
presented in [22]. The spread of the disease depends on the percentage of people ¯u
having a vaccination. The cost for each player i is given by
328 I. Kordonis
```
Ji = u i + (1 − Au i ) f ( ¯u)x i , (13)
```
```
where u i = 1 if player i is vaccinated and 0 otherwise, (1 − Au i ) f ( ¯u) stands for the
```
probability that player i is infected, 0 < A < 1 is a positive constant representing
```
the effectiveness of the vaccination, f ( ¯u) is a strictly decreasing function, and x i
```
corresponds to the expected dis-utility player i experiences if she gets sick. A fraction
```
B of the population consists of vulnerable persons (e.g., older people) and a fraction
```
1 − B of non-vulnerable.3 The constant x i takes accordingly two values, i.e., Cv
```
and C n with Cv > C n . The first term in (13) stands for the cost of vaccination (e.g.,
```
```
time, money, pain, potential side effects, etc.) and the second term to the expected
```
cost from the disease. Finally, we allow for mixed strategies and thus u i ∈ [0, 1]
```
and thus the value of ¯u is given by Buv + (1 − B)u n , where uv is the probability of
```
vaccination for vulnerable and u n for the non-vulnerable persons.
Let us first compute the Nash equilibrium of the game. It is not difficult to see
that the Nash equilibrium is
```
(uv , u n ) =
```
⎧
⎪⎪⎪
⎪⎨
⎪⎪⎪
⎪⎩
```
(0, 0) if ACv f (0) ≤ 1
```
```
(B−1 f −1((ACv )−1), 0 if ACv f (B) ≤ 1 < ACv f (0)
```
```
(1, 0), if AC n f (B) ≤ 1 < ACv f (B)
```
```
(1, (1 − B)−1( f −1((AC n )−1) − B), if AC n f (B) ≤ 1 < AC n f (1)
```
```
(1, 1), if AC n f (1) ≥ 1
```
```
(14)
```
In what follows, we assume that the parameters are such that all the vulnerable
```
agents are vaccinated, i.e., it holds ACv f (B) > 1.
```
Assume that the parameters are given by A = 0.8, B = 0.3, Cv = 500, C n = 15
```
and the function f (z) is given by 0.2z2 − 0.4z + 0.21. The virtual group of each
```
player consists of a fraction α of the other players 4 and the risk sensitivity β is 0 for
all the players. The Nash equilibrium, the r-Kant-Nash equilibrium, and the Roemer’s
multiplicative Kantian equilibrium are illustrated in Fig. 2. The computation of the
equilibria is not difficult, since we need only to solve optimization or fixed point
problems in dimension 1.
Observe that already from α = 0.2 the r-Kant-Nash equilibrium belongs to the
Pareto frontier. It seems that this result is not general but has to do with the spe-
cific structure of the game, i.e., the vaccination is a positive externality, but creates
strategic substitutes. Furthermore, vulnerable people play always uv = 1, and thus
their behavior does not depend on α. As α approaches 1, the r-Kant-Nash equilib-
rium approaches the point with the minimum total cost. Let us further note that in
order to compute Roemer’s multiplicative Kantian equilibrium, we have to extend
```
the feasible region on u i ∈ [0, ∞) and write the cost of player i as
```
3 In this section, we do not refer to the interval I , since it seems more convenient to refer to
percentages of players. To connect with previous sections, let us note that in the unit interval, the
```
set of vulnerable players is [0, B) ⊂ I and the set of the non-vulnerable is [B, 1].
```
```
4 With the notation of Sect. 2, r i (A) = αλ(A).
```
A Model for Partial Kantian Cooperation 329
Cost for Vulnerable Players
Equal total cost line
2 3 4 5 6 7 8 9
Cost for non-Vulnerable Players0.8
0.9
1
1.1
1.2
1.3
Pareto Frontierr-Kant Nash equilibria
Most efficient pointNash Equilibrium
Roemer'sα=0.1α=0.2
Fig. 2 The expected costs for vulnerable and non-vulnerable players for the several solution con-
cepts
```
Ji = u i + (1 − Au i ) f ( ¯u)x i + 1u i ≤1,
```
where 1u i ≤1 = 0 if u i ≤ 1 and +∞ otherwise.
4.2 A Static Fishing Game with Two Types of Players
In this section, we study a fishing game where there are two kinds of players and
compare the several solution concepts with respect to efficiency and fairness.
The cost for a player i is
```
Ji = x i u2i − (1 − ¯u)u i . (15)
```
The possible values for x i are 1 and 2. Let us denote by u1 and u2 the corresponding
actions and assume that 50% of the fishers have x i = 1 and 50% have x i = 2.
Assume that the virtual group of each player consists of a fraction α of the others.
We then investigate the properties of the r-Kant-Nash equilibrium for various values
of the risk factor β. The r-Kant-Nash equilibrium is characterized by
```
(u1, u2) ∈ arg minu′
```
1,u′2
```
{
```
exp
[
β
```
(
```
```
(u′1)2 −
```
```
(
```
1 − α u
′1 + u′2
```
2 + (1 − α)
```
u1 + u2
2
```
)
```
u′1
```
)]
```
+
- exp
[
β
```
(
```
```
2(u′2)2 −
```
```
(
```
1 − α u
′1 + u′2
```
2 + (1 − α)
```
u1 + u2
2
```
)
```
u′2
```
)]}
```
.
```
If u1, u2 ∈ (0, 1) the last equation implies
```
330 I. Kordonis
Cost for players of type 1
-0.18 -0.16 -0.14 -0.12 -0.1 -0.08 -0.06 -0.04 -0.02 0
Cost for players of type 2
-0.1
-0.09
-0.08
-0.07
-0.06
-0.05
-0.04
-0.03
-0.02
-0.01
0
Pareto FrontierNash Equilibrium
Roemer'sr-Kant Nash, β=0
r-Kant Nash, β=30r-Kant Nash, β=100
Equal distribution line
α=0.2
α=1
Equal total cost line
Fig. 3 The costs for the fishers of both types, for the several solution concepts
```
e V1 (u1,u2 ) ((5 + α)u1 + u2 − 2) + αe V2 (u1,u2 )u2 = 0,
```
```
αe V1 (u1,u2 )u1 + αe V2 (u1,u2 ) (u1 + (9 + α)u2 − 2) = 0, (16)
```
```
where V1(u1, u2) = β(u21 − (1 − (u1 + u2)/2)u1) and V2(u1, u2) = β(2u22 − (1 −
```
```
(u1 + u2)/2)u2). The system (16) is solved numerically to obtain r-Kant-Nash equi-
```
librium.
Figure 3 illustrates the Nash equilibrium, the Roemer’s multiplicative Kantian
equilibrium, and the r-Kant-Nash equilibria for various values of α and β. The r-
Kant-Nash equilibrium for α = 1, β = 0 and the Roemer’s multiplicative Kantian
equilibrium, as expected, coincide with the most efficient point, i.e., the point where
the total cost is minimized. However, this point does not distribute the outcome
evenly. For β > 0 we observe that the r-Kant-Nash equilibria produce fairer results
as α approaches 1.
4.3 A Dynamic Resource Game
This example studies a dynamic model for exploiting a shared resource, where the
players live only for a single time step. A similar model was analyzed in Sect. 3.10
```
of [10] (dynamic fishing game). We compare the r-Kant-Nash equilibria for the case
```
where the virtual group of each player consists of players participating in the game
simultaneously with her and the case where virtual groups contain players acting on
various time steps. For simplicity, we do not analyze the full dynamic game, but only
its steady state.
Let us denote by y total stock of the resource. Assume that the dynamics is given
by
```
yk+1 = 3yk (1 − yk ) − yk ¯u k , (17)
```
A Model for Partial Kantian Cooperation 331
where ¯u k is the mean effort of the players at time step k. For a fixed ¯u k = ¯u, the
stationary value of yk is
```
y = 2 − ¯u3 . (18)
```
We assume further that all the players participate in the game for a single time
step. The cost for a player i who participates in the game at time step k is given by
```
Ji = (u i )2 − ρ ¯u k yk − (1 − ρ)u i yk , (19)
```
```
where ρ ∈ (0, 1). The cost (19) can be interpreted as follows. Player i produces a
```
```
quantity u i x, she holds a portion (1 − ρ) of it, and the rest is redistributed equally
```
among the players.
The Nash equilibrium is given by
```
u = (1 − ρ)yk2 .
```
```
The steady-state effort under the Nash equilibrium (using (18)) is
```
```
u = 2(1 − ρ)7 − ρ .
```
We then study r-Kant-Nash equilibrium under two different assumptions.
Case 1: The virtual group of a player participating at time step k is a fraction α
of the other players who participate in the game at the same time step. Under this
assumption, the players of the virtual group do not affect yk . Then, the r-Kant-Nash
equilibrium is characterized by
```
u ∈ arg minu′ {(u′)2 − ρ(αu′ + (1 − α)u)yk − (1 − ρ)u′ yk },
```
which implies
```
u = 1 − ρ + ρα2 yk .
```
```
The steady-state effort, (using (18)) is
```
```
u = 2(1 + ρα − ρ)7 + ρα − ρ .
```
Case 2: The virtual group of each player i consists of a fraction α of all the other
players, including players existing before or after player i. Then, the r-Kant-Nash
equilibrium is characterized by
```
u ∈ arg minu′ {(u′)2 − ρ(αu′ + (1 − α)u) ¯y(u, u′) − (1 − ρ)u′ ¯y(u, u′)},
```
332 I. Kordonis
Fig. 4 The costs and the actions for various values of α and ρ = 0.1, ρ = 0.5. Local KN describes
the actions and costs computed in Case 1 above and Global KN represents Case 2
where
```
¯y(u, u′) = 2 − αu
```
```
′ − (1 − α)u
```
3 .
The last equation implies
```
u = 2(1 − ρ + ρα)7 + α + ρα − ρ .
```
Figure 4 shows the Nash equilibrium, the r-Kant-Nash solutions for cases 1 and
2.
Remark 4 An increase in Player i’s effort increases her production, a part of which
is redistributed, but such an increase leaves next generations of players with fewer
resources. Therefore, if players identify themselves only with other players playing
```
at the same time (Case 1), it is always more cooperative to increase their actions
```
compared to the Nash equilibrium. On the other hand, a smaller action favors future
generations of players. Thus, for low values of the redistribution coefficient ρ, under
```
“global” cooperation (Case 2), the actions are reduced compared to the Nash equi-
```
librium.
An interesting feature is that for ρ = 0.1, under “local” cooperation the overall
cost in steady state is worse-off compared to the Nash equilibrium.
A Model for Partial Kantian Cooperation 333
4.4 An Opinion Game
This example considers an opinion game where each player wants to express an
opinion which is close to the expressed opinions of the others, but also close to her
intrinsic opinion. The model used is a special case of [23]. The interesting feature of
this example is to illustrate that local cooperation could be harmful.
The cost for a player i is given by
```
Ji = (u i − x i )2 + (u i − ¯u)2. (20)
```
For simplicity, we assume that there are only two types of players: 50% of the
players have intrinsic opinion x i = 0 and 50% intrinsic opinion x i = 1. Under these
```
assumptions ¯u = (u0 + u1)/2, where u0 and u1 are the actions of players of type
```
x i = 0 and x i = 1, respectively.
It is not difficult to see that the Nash equilibrium is
```
(u0, u1) =
```
```
( 1
```
4 ,
3
4
```
)
```
```
. (21)
```
We then consider two scenarios of partial Kantian cooperation:
Case 1: In this case, the virtual group of each player consists only of players of the
same type. Particularly, players i with type x i = 0 have virtual groups consisting of
a fraction α0 of the players j with x j = 0. Similarly, players i with type x i = 1 have
virtual groups consisting of a fraction α1 of the players j with x j = 0.
The r-Kant-Nash equilibrium satisfies
u0 ∈ arg minu′
0
```
{
```
```
(u′0)2 +
```
```
(
```
```
u′0 − 0.5(α0u′0 + (1 − α0)u0) − 0.5u1
```
```
)2}
```
u1 ∈ arg minu′
1
```
{
```
```
(u′1 − 1)2 +
```
```
(
```
```
u′1 − 0.5u0 − 0.5(α1u′1 + (1 − α1)u1)
```
```
)2}
```
which is equivalent to the system:
```
(6 − α0)u0 − (2 − α0)u1 = 0,
```
```
−(2 − α1)u0 + (6 − α1)u1 = 4.
```
Case 2: Each player has a virtual group of players consisting of a fraction α of all
the other players. That is, a player i with type x i = 0 has a virtual group consisting
```
of players j of both categories x j = 0 and x j = 1. A pair (u0, u1) constitutes an
```
r-Kant-Nash equilibrium if it solves the problem:
334 I. Kordonis
Fig. 5 The costs for both types of players for the Nash, Pareto, and the r-Kant-Nash solutions
minimizeu′
0 ,u′1
```
{
```
```
(u′0)2 +
```
```
(
```
```
u′0 − 0.5(αu′0 + (1 − α)u0) − (1 − 0.5)(αu′1 + (1 − α)u1)
```
```
)2
```
+
```
+(u′1 − 1)2 +
```
```
(
```
```
u′1 − 0.5(αu′0 + (1 − α)u0) − 0.5(αu′1 + (1 − α)u1)
```
```
)2}
```
.
```
Long but straightforward computations show that the Nash equilibrium (21) solves
```
the minimization problem and thus it is the r-Kant-Nash equilibrium.
Figure 5 illustrates the costs for the two types of players for the several solution
concepts.
Remark 5 Observe that in this example, the Nash equilibrium is on the Pareto
frontier and coincides with the r-Kant-Nash equilibrium of Case 2. Furthermore, it
minimizes the total cost. On the other hand, if a type, say x = 1 has local cooperation
```
(Case 1), this leads to improved results for that group, but worse results for the other
```
```
group (the group x = 0). This behavior corresponds, in the opinion game setting, to
```
the case where a group of players takes a more radical opinion to affect the overall
result. When both groups cooperate only locally, the situation is worse for both. Thus,
the situation in Fig. 5 is very much like Prisoner’s dilemma.
4.5 A Fishing Game with Overlapping Virtual Groups
In the previous examples, the virtual groups of players are either identical or disjoint.
This fact facilitated the analysis. In this example, we study the fishing game of Sect.
4.2, assuming that the virtual groups of the players of different types are different but
overlapping. Particularly, the virtual group of a player with type x = 1 consists of a
fraction r11 of players with type x = 1 and r12 of players with type x = 2. Similarly,
A Model for Partial Kantian Cooperation 335
Fig. 6 The costs for both types of players for the Nash, Pareto, and the r-Kant-Nash solutions for
the case of overlapping virtual groups. All the lines represent a combination of r11, . . . , r22 where
three of them are fixed and the other moves between 0 and 0.5
the virtual group of a player with type x = 1 consists of a fraction r21 of players with
type x = 1 and r22 of players with type x = 2.
Let us focus on internal r-Kant-Nash equilibria, i.e., all the actions belong to the
```
interior of the interval [0, 1]. Then, a pair (u1, u2) is an r-Kant-Nash equilibrium
```
```
(see (11)) if there exist ˜u1 and ˜u2 such that
```
```
(u1, ˜u2) ∈ arg minu′
```
1,u′2
```
{
```
r11
[
```
(u′1)2 − (1 − r11u′1 − r12u′2 − r′11u1 − r′12u2) u′1
```
]
+
- r12
[
```
2(u′2)2 − (1 − r11u′1 − r12u′2 − r′11u1 − r′12u2) u′2
```
```
]}
```
,
```
( ˜u1, u2) ∈ arg minu′
```
1,u′2
```
{
```
r21
[
```
(u′1)2 − (1 − r21u′1 − r22u′2 − r′21u1 − r′22u2) u′1
```
]
+
- r22
[
```
2(u′2)2 − (1 − r21u′1 − r22u′2 − r′21u1 − r′22u2) u′2
```
```
]}
```
,
```
where r′11 = (0.5 − r11), r′12 = (0.5 − r12), r′21 = (0.5 − r21), r′22 = (0.5 − r22). The
```
last equation is equivalent to the system:
```
(2.5 + r11)u1 + 0 ˜u1 + r′12u2 + 2r12 ˜u2 = 1
```
```
(0.5 + r11)u1 + 0 ˜u2 + r′12u2 + (4 + 2r12) ˜u2 = 1
```
```
r′21u1 + (2 + 2r21) ˜u1 + (0.5 + r22)u2 + 0 ˜u1 = 1
```
```
r′21u1 + 2r21 ˜u1 + (4.5 + r22)u2 + 0 ˜u2 = 1.
```
The r-Kant-Nash equilibria for several combinations of r11, . . . , r22 are shown in
Fig. 6.
336 I. Kordonis
Remark 6 Observe that we need to solve a system of four equations to find the r-
Kant-Nash equilibrium. That is because each virtual group contains players of both
categories. Since the virtual groups are different, the values computed for players
having types different, compared to the player who constructs the virtual group, are
never applied. For example, in a virtual group of a player of type 1, there are players
of type 2. Thus, the values of ˜u2 , computed in the virtual group of players of type 1,
are not necessarily equal to the actual value of u2 .
4.6 Electric Vehicle Charging with Uniform Pricing
This example studies a simplified model of the interaction of the Electric Vehicle
```
(EVs) owners, inspired by [24]. There is a fleet of EVs which should charge within
```
the next N hours. Each vehicle is going to absorb a total amount of energy denoted
by E. The cost of energy production depends on total consumption. Let us denote
```
by p k ( ¯u k ) the price per unit of energy when the mean charging rate for the vehicles
```
is ¯u k . The price p k depends on the time of the day k because the demand of the other
```
(non-EV) users and renewable energy production are not constant during the day.
```
For simplicity, assume that the prices are written as
```
p k (z) = ck z + dk .
```
We further assume that the EV owners pay at a uniform price, which depends on the
total cost of energy production.
The cost for an EV owner is
```
Ji = (E
```
```
non-EV1 + ¯u1) p1( ¯u1) + · · · + (Enon-EVN + ¯u N ) p N ( ¯u N )
```
Etot E +
N∑
```
k=1
```
```
R(u ik )2,
```
```
(22)
```
where Etot is the total energy consumption and Enon-EVk the total energy consumption
```
for excluding E V charging at time step k. The first term of (22) corresponds to the
```
money EV owner pays to the electricity company and the second term to the losses
```
during the charging (battery degradation cost can be incorporated in this term). The
```
feasible set U is given by
```
U =
```
```
{
```
```
(u1, . . . , u N ) ∈ RN : u k ≥ 0,
```
N∑
```
k=1
```
u k = E
```
}
```
.
The Nash equilibrium of the game is to use a constant charging rate:
u ik = E/N ,
to minimize the cost of the losses.
A Model for Partial Kantian Cooperation 337
Fig. 7 The total cost of a player for charging her vehicle, for various values of α
Consider the case where the virtual group of each player is a fraction α of the
```
other players. Then, (11) simplifies to
```
```
[(u′
```
```
1 − u1) . . . (u′N − u N )
```
]
⎡
⎢⎣
```
C1(α)u1 + D1(α)
```
...
```
C N (α)u N + D N (α)
```
⎤
⎥⎦ ≥ 0, for all u′ ∈ U,
```
where C k (α) = 2ck Eα/Etot + 2R and D k (α) = E(Enon-EVk ck + dk )α/Etot . This
```
problem is equivalent to the following minimization problem:
```
minimize(u1,...,u n )∈U
```
N∑
```
k=1
```
```
C k (α)u2k /2 + D k (α)u k .
```
Example 2 Assume that N = 12, E = 10, R = 0.02, ck = 1 for all k, dk = 1 +
Enon-EVk and the vector of consumption excluding the EV charging is Enon-EV =
[7 5 2 1 0.5 0.5 1.2 2 3 4 5 5]T .
The cost of a player under the r-Kant-Nash equilibrium for various values of α is
shown in Fig. 7. It is interesting that already from α = 0.1 the players obtain more
than 96% of the full cooperation benefit.
Figures 8 and 9 show the charging actions and the production cost. At the Nash
equilibrium, we have uniform charging. However, as α increases, charging moves
to time instants where the production cost is lower. At the same time at those time
instants the production cost increases whereas for the other time instants it decreases.
Remark 7 In the example, due to the low value of R, there is an almost flat region
```
of production cost (from k = 3 to k = 9) for α = 1. This situation is very similar
```
338 I. Kordonis
Fig. 8 The charging action u k for the different times of the day and for various values of α
Fig. 9 The energy production cost for the different times of the day and for various values of α.
The purple dashed line corresponds to the production cost if there was no EV charging
with the “valley-filling” behavior described in [24]. The difference is that in [24] the
electricity company charges the EV owners at a non-constant price, while in Example
2 the price is fixed within the day.
Remark 8 For this example, it seems that it is not possible to define Roemer’s
multiplicative or additive Kantian equilibrium, because any multiplicative or additive
deviation of a feasible point is infeasible.
A Model for Partial Kantian Cooperation 339
5 Infinite Number of Types
5.1 Reformulation as Optimal Control Problems
In this section, we characterize r-Kant-Nash equilibria under the assumption that
Θ is a singleton, β = 0, and that all the measures are absolutely continuous with
respect to the Lebesgue measure. Assuming that the players that do not belong to i’s
```
virtual group follow a strategy u j = ¯γ (x j ), the optimization problem (3) is written
```
as
minim.γ
```
{∫ 1
```
0
J
```
(
```
```
γ (x′), ¯u−x i +
```
∫ 1
0
```
g(γ (z), z)r i (z)dz, x′
```
```
)
```
```
w(x i , x′)r i (x′)dx′
```
```
}
```
,
```
(23)
```
where
¯u−x i =
∫ 1
0
```
g( ¯γ (z), z)(1 − r i (z))dz, (24)
```
```
and (with a slight abuse of notation) r i denotes the density of the measure r i (·).
```
```
The optimization problem (23), assuming ¯u−x i as given, can be reformulated as an
```
optimal control problem using the state x′ as a virtual time. To do so, we consider a
couple auxiliary state variables χ x i1 and χ x i2 , and then apply the Pontryagin’s minimum
principle.
```
Proposition 3 The optimization problem (23) is equivalent to the optimal control
```
```
problem:
```
```
minimizeu xi (t)
```
∫ 1
0
```
L x i (u x i , ¯u−x i + χ x i2 , t)dt
```
```
subject to ˙χ x i1 = g(u x i , t)r(t, x i ), χ1(0) = 0
```
```
˙χ x i2 = 0, χ x i2 (0) : free
```
```
χ x i1 (1) = χ x i2 (1),
```
```
(25)
```
where
```
L x i (u, v, t) = J (u, v, t) w(x i , t)r(t, x i ).
```
Proof Observe that:
∫ 1
0
```
g(u x i , t)r(t, x i )dt = χ x i1 (1) = χ x i2 (1) = χ x i2 (t).
```
Thus, the problems are equivalent. 
```
We then derive necessary conditions using Pontryagin’s minimum principle (the
```
```
appropriate form of minimum principle can be found in Chap. 15 of [25]). It turns out
```
340 I. Kordonis
that the problem has a special structure and the optimal control law is characterized
by a pair of algebraic equations instead of a two-point boundary value problem. The
Hamiltonian is given by
```
H x i = L x i (u x i , ¯u−x i + χ x i2 , t) + p x i1 g(u x i , t)r(t, x i ).
```
The costate equations are given by
˙p x i1 = 0, ˙p x i2 = − ∂ L
x i
```
∂v (u
```
```
x i , ¯u−x i + χ x i2 , t),
```
```
(where v is the second argument of L x i ) and the boundary conditions by
```
```
p x i2 (0) = 0, p x i1 (1) + p x i2 (1) = 0.
```
```
Let us assume that there is a unique minimizer u x i = l(t, χ2, p1, ¯u−x i , x i ) of H x i
```
with respect to u x i . In order to characterize the optimal controller it remains to
determine the constants p x i1 and χ x i2 . A pair of algebraic equations will be derived.
```
Combining ˙p x i1 = 0, p x i2 (0) = 0 and p x i1 (1) = − p x i2 (1), we get
```
```
p x i1 = − p x i2 (1) =
```
∫ 1
0
```
∂ L x i (l(t, χ x i2 , p x i1 , ¯u−x i , x i ), χ x i2 + ¯u−x i , t)
```
```
∂v dt. (26)
```
```
The right-hand side of (26) is a known function of χ x i2 , p x i1 , and ¯u−x i .
```
```
The second algebraic equation is obtained combining ˙χ x i2 = 0, χ x i1 (0) = 0, and
```
```
χ x i1 (1) = χ x i2 (1):
```
χ x i2 =
∫ 1
0
```
g(l(t, χ x i2 , p x i1 , ¯u−x i , t, x i ))r(t, x i )dt, (27)
```
```
where the right-hand side of (27) is again a known function of χ x i2 , p x i1 , and ¯u−x i .
```
```
Both (26) and (27) are algebraic and not integral equations, due to the fact that all
```
the functions of time are known and we have only unknown constants. 
```
Proposition 4 Assume that ¯γ (x) is an r-Kant-Nash equilibrium. Further, assume
```
that there is a unique minimizer l of H x i for any x i ∈ X. Then, there exist functions
```
χ·2 : X → R, p·1 : X → R and ¯u−· : X → R satisfying (26), (27), and
```
¯u−x i =
∫ 1
0
```
g((l(t, χt2, p t1, ¯u−t , x i ), t)( p(t) − r(t, x i ))dt, (28)
```
```
such that ¯γ (x i ) = l(x i , χ2, p1, ¯u−x i , x i ) for any x i ∈ X.
```
Proof The proof follows immediately from the analysis above. 
Thus, an r-Kant-Nash equilibrium is characterized by a couple of algebraic equa-
tions and an integral equation.
A Model for Partial Kantian Cooperation 341
5.2 Equilibrium in a Quadratic Game
Let us consider again the fishing game example assuming players with different
```
efficiencies (for example, a fisher is more experienced than another or has better
```
```
equipment). We assume that Θ is a singleton, X = [0, 1], and the players have a
```
uniform distribution. The cost function for each player is given by
```
Ji = u2i − (1 − ¯u)ξ(x i )u i , (29)
```
where u i is the effort of player i, the total effort ¯u is given by
¯u =
∫ 1
0
```
u(x)ξ(x)dx, (30)
```
```
and ξ(x) > 0 represents the efficiency of a player with state x.
```
```
We shall compute the r-Kant-Nash equilibrium assuming that r(x′, x) = 0 implies
```
```
w(x′, x) = 0, i.e., that if a player with state x considers another player with state x′
```
to belong to his virtual group, she does not assign her a zero weight.
Recall that Proposition 3 reduces the optimization problem of each virtual group
to an optimal control problem. In this example, the optimal control problems are
LQ and thus the minimum principle necessary conditions are also sufficient. The
Hamiltonian is given by
H x i =
[
```
u2 − (1 − ¯u−x i − χ x i2 )ξ(t)u
```
]
```
w(t, x i )r(t, x i ) + p x i1 ξ(t)r(t, x i )u.
```
Thus, the optimal control u is given by
```
u = l(t, χ x i2 , p x i1 , u−x i ) = 12 (1 − ¯u−x i − χ x i2 − p x i1 /w(t, x i ))ξ(t).
```
```
Equation (27) is written as
```
χ x i2 = 12
∫ 1
0
```
(1 − ¯u−x i − χ x i2 − p x i1 /w(t, x i ))ξ 2(t)r(t, x i )dt,
```
or equivalently:
```
χ x i2 = (1 − ¯u
```
```
−x i )C x i1 − p1C x i2
```
```
2 + C x i1, (31)
```
where
C x i1 =
∫ 1
0
```
ξ 2(t)r(t, x i )dt and C x i2 =
```
∫ 1
0
```
ξ 2(t)r(t, x i )/w(t, x i )dt.
```
```
Equation (26) is written as
```
342 I. Kordonis
p x i1 = 12
∫ 1
0
```
((1 − ¯u−x i − χ x i2 )w(t, x i ) − p1)ξ 2(t)r(t, x i )dt.
```
```
Equivalently:
```
```
2 p x i1 = (1 − ¯u−x i )C x i3 − χ x i2 C x i3 − p x i1 C x i1 , (32)
```
where
C x i3 =
∫ 1
0
```
ξ 2(t)r(t, x i )w(t, x i )dt.
```
```
Solving (31), (32) for χ x i2 , p x i1 , we obtain
```
```
χ x i2 = (C
```
```
x i1 )2 + 2C x i1 − C x i2 C x i3
```
```
(C x i1 )2 + 2C x i1 − C x i2 C x i3 + 4 (1 − ¯u
```
```
−x i ),
```
p x i1 = 2C
x i3
```
(C x i1 )2 + 2C x i1 − C x i2 C x i3 + 4 (1 − ¯u
```
```
−x i ).
```
```
In what follows, in order to simplify the computations we assume that w(x, x′) =
```
1. Under this assumption, it holds C x i1 = C x i2 = C x i3 = C(x i ) and
```
χ x i2 = p x i1 = C(x i )2C(x
```
```
i ) + 2
```
```
(1 − ¯u−x i ).
```
Furthermore,
```
u x i (t) = 12 (1 − ¯u−x i ) ξ(t)C(x
```
```
i ) + 1
```
.
```
Equation (28) becomes
```
¯u−x i =
∫ 1
0
1
```
2 (1 − ¯u
```
```
−t ) ξ 2(t)
```
```
C(t) + 1 (1 − r(t, x i ))dt, (33)
```
which is a linear Fredholm integral equation of second kind.
```
Example 3 In this example, we assume that r(x, x′) = α (a uniform (sub)-
```
```
distribution). Equation (33) implies that ¯u−x i is independent of x i . Thus, denoting
```
by ¯u− this constant, we obtain
```
¯u− = (1 − ¯u−) 1 − α2
```
∫ 1
0
```
ξ 2(t)
```
```
C(t) + 1 dt.
```
Thus,
A Model for Partial Kantian Cooperation 343
Fig. 10 The actions of the several players for different values of α, as a function of their state
Fig. 11 The cost for the several players for different values of α, as a function of their state
```
u x i (x i ) = 1
```
```
2 + (1 − α)
```
∫ 1
0ξ
```
2 (t)
```
```
C(t)+1 dt
```
```
ξ(x i )
```
```
C(x i ) + 1 .
```
Hence, the actions of the players scale down uniformly as α increases. 
Example 4 In this example, we assume that
```
r(x, x′) =
```
```
{
```
α if |x − x′ | ≤ 0.3 and x ≤ 0.9
0 otherwise
```
The solution of the integral equation (33) can be approximated using a linear system
```
with a high order. The actions of the players as well as the cost for the participants
of the game are illustrated in Figs. 10, 11. 
344 I. Kordonis
6 Conclusion and Future Directions
```
This work studies (partially) cooperative outcomes in games with a continuum of
```
players, assuming that the participants follow Kant’s categorical imperative partially.
We introduced the notion of r-Kant-Nash equilibrium and compared it with other
```
notions from the literature. It turns out that, Nash equilibrium, (Bentham-) Harsanyi,
```
and Rawls difference solutions are special cases of r-Kant-Nash equilibrium. Further-
more, we compared r-Kant-Nash equilibrium with Roemer’s Kantian equilibrium
using several examples. For the case where there is a finite number of possible player
types, we provided sufficient conditions for the existence and the uniqueness of the
r-Kant-Nash equilibrium. Necessary conditions, based on a reduction to a set of opti-
mal control problems, can be derived for cases of games where the possible states
admit an one-dimensional representation. Some examples of r-Kant-Nash equilib-
rium in quadratic games with a finite number of types were analyzed. It turns out that
r-Kant-Nash equilibria may provide reasonable solutions in terms of performance
or fairness. On the other hand, local cooperation could be harmful.
A possible extension of this work is to study games with a finite number of
players. In this case, we may assume that the virtual group of each player is stochastic
and that each player determines her action before she learns the realization of her
virtual group. Another direction for future research is to extend the current model
to dynamic games. A special case involving symmetric players was presented in
[26]. An interesting question for the case of a dynamic game with a finite number
of players would be whether or not the virtual group of a player should be constant
during the game.
7 Appendix
```
The following lemma shows that if we consider a “small” virtual group (the value of
```
```
r i (I ) is small), then the policy where each player ignores the group and simply best
```
responses is approximately optimal for the group.
Lemma 1 Assume that U is a compact subset of the Euclidean space, and the
functions J and g are continuous functions on the arguments u i and ¯u. Fix a reference
```
strategy u0 : I → U with u0(i) = ¯γ 0(x(i), θ(i)) and assume that βθi = 0. If all the
```
```
players implement this strategy, denote by ¯u0 the mean action computed using (2).
```
We then construct the best response, i.e., another strategy ˜u : I → U with
```
˜u BR( j) = γ BR( j) ∈ arg minu jJ (u j , ¯u0, x j ). (34)
```
A Model for Partial Kantian Cooperation 345
```
Then if r i (I ) < δ then ˜u BR is ε-optimal, i.e., for any ε > 0 there is a δ > 0 such that
```
```
if r i (I ) < δ then
```
```
˜Ji (γ BR, ¯γ ) ≤ ˜Ji (γ , ¯γ ) + ε,
```
```
where γ is the policy minimizing ˜Ji (γ , ¯γ ) with respect to γ .
```
Proof Since, U is compact, and the functions involved are continuous for any ε there
```
is a δ > 0 such that r i (I ) < δ1 implies
```
E
[
```
J (γ x i ,θi (x( j)), ¯u0, x( j))wx i ,θi (x( j))
```
]
```
≤ ˜Ji (γ , ¯γ ) + ε.
```
```
On the other hand, since wx i ,θi (x( j)) > 0, we have
```
```
˜Ji (γ BR, ¯γ ) = E[J (γ BR( j), ¯u0, x( j))wx i ,θi (x( j))]≤ E[J (γ x i ,θi (x( j)), ¯u0, x( j))wx i ,θi (x( j))],
```
```
where the inequality holds true due to (34).
```
References
1. G. Hardin, “The tragedy of the commons,” Science, vol. 162, no. 3859, pp. 1243–1248, 1968.
2. D. Fudenberg and J. Tirole, Game Theory. MIT Press, 1991.
3. R. Axelrod and W. D. Hamilton, “The evolution of cooperation,” Science, vol. 211, no. 4489,
pp. 1390–1396, 1981.
4. M. A. Nowak, “Five rules for the evolution of cooperation,” Science, vol. 314, no. 5805, pp.
1560–1563, 2006.
5. E. Ostrom, Governing the commons. Cambridge university press, 2015.
6. I. Kant, Groundwork for the Metaphysics of Morals, 1785.
7. J. Rawls, A theory of justice. Harvard university press, 2009.
8. J. C. Harsanyi, Cardinal welfare, individualistic ethics, and interpersonal comparisons of
utility. Springer, 1980.
9. J. E. Roemer, “Kantian optimization: A microfoundation for cooperation,” Journal of Public
Economics, vol. 127, pp. 45–57, 2015.
10. J. E. Roemer, “How we (do and could) cooperate.”
11. A. Ghosh and N. Van Long, “Kant’s rule of behavior and Kant-Nash equilibria in games of
contributions to public goods,” 2015.
12. N. Van Long, “Kant-Nash equilibrium in a dynamic game of climate change mitigations,” 2015.
13. N. Van Long, “Games with a virtual co-mover structure: Applications to the theory of private
contributions to a public good,” 2015.
14. A. Wiszniewska-Matyszkiel, “Redefinition of belief distorted Nash equilibria for the envi-
ronment of dynamic games with probabilistic beliefs,” Journal of Optimization Theory and
Applications, vol. 172, no. 3, pp. 984–1007, 2017.
15. A. Wiszniewska-Matyszkiel, “Belief distorted Nash equilibria: introduction of a new kind of
equilibrium in dynamic games with distorted information,” Annals of Operations Research,
vol. 243, no. 1-2, pp. 147–177, 2016.
16. D. Schmeidler, “Equilibrium points of nonatomic games,” Journal of statistical Physics, vol. 7,
no. 4, pp. 295–300, 1973.
17. A. Wiszniewska-Matyszkiel, “Static and dynamic equilibria in games with continuum of play-
ers,” Positivity, vol. 6, no. 4, pp. 433–453, 2002.
346 I. Kordonis
18. G. Debreu, “A social equilibrium existence theorem,” Proceedings of the National Academy of
Sciences, vol. 38, no. 10, pp. 886–893, 1952.
19. O. Mangasarian, Nonlinear Programming. Society for Industrial and Applied Mathematics,
1994. [Online]. Available: http://epubs.siam.org/doi/abs/10.1137/1.9781611971255
20. C. Berge, Topological Spaces: including a treatment of multi-valued functions, vector spaces,
and convexity. Courier Corporation, 1963.
21. F. Facchinei and J.-S. Pang, Finite-dimensional variational inequalities and complementarity
problems. Springer Science & Business Media, 2007.
22. C. T. Bauch and D. J. Earn, “Vaccination and the theory of games,” Proceedings of the National
Academy of Sciences, vol. 101, no. 36, pp. 13 391–13 394, 2004.
23. J. Ghaderi and R. Srikant, “Opinion dynamics in social networks: A local interaction game
with stubborn agents,” in 2013 American Control Conference. IEEE, 2013, pp. 1982–1987.
24. F. Parise, M. Colombino, S. Grammatico, and J. Lygeros, “Mean field constrained charging
policy for large populations of plug-in electric vehicles,” in 53rd IEEE Conference on Decision
and Control. IEEE, 2014, pp. 5101–5106.
25. D. G. Hull, Optimal control theory for applications. Springer Science & Business Media, 2013.
26. I. Kordonis and G. P. Papavassilopoulos, “Effects of players’ random participation to the stabil-
ity in LQ games,” in Advances in Dynamic and Mean Field Games. ISDG 2016. Annals of the
International Society of Dynamic Games, vol 15, J. Apaloo and B. Viscolani, Eds. Birkhauser,
2017.