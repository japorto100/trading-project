

Network Games: Learning and
## Dynamics
## Asu Ozdaglar
Conference on Decision and Control (CDC)
## December 2008
Department of Electrical Engineering & Computer Science
Massachusetts Institute of Technology, USA
## 1

## Introduction
•Central Question in Today’s and Future Networks:Systematic analysis and
design of network architectures and development of network control schemes
•Traditional Network Optimization:Single administrative domain with a single
control objective and obedient users.
•New Challenges:
–Large-scale and interconnection of heterogeneous autonomous entities
∗Control in the presence of selfish incentives and private information of users
–Continuous upgrades and investments in new technologies
∗Economic incentives of service and content providers more paramount
–Newsituation-awarewireless technologies to deal with inherent dynamics
∗Autonomous decisions based on current network conditions
–Analysis ofsocial and economic networks
∗Learning, information aggregation, control, endogenous network formation
•These challenges makegame theory and economic market mechanisms
natural tools for the analysis of large-scale networked systems
## 2

Issues in Network Games
•Game theory has traditionally been used in economics and social sciences with
focus on fully rational interactions
–Theory developed for small scale sophisticated interactions
–Strong assumptions:common knowledge, common prior, forward-looking
behavior
•In (engineering or social) networked systems, not necessarily a good framework
for two reasons:
–Large-scale systems consisting of individuals with partial information
–Most focus on dynamic interactions and in particularlearning dynamics
## 3

Learning Dynamics in Games
•Bayesian Learning:
–Update beliefs (about an underlying state or opponent strategies) based on
new information optimally (i.e., in a Bayesian manner)
•Adaptive Learning:
–Myopic, simple and rule-of-thumb
–Example:Fictitious play
∗Play optimally against the empirical distribution of past play of opponent
•Evolutionary Dynamics:
–Selection of strategies according to performance against aggregates and
random mutations
## Rationality
## Evolutionary
dynamics
## Adaptive
learning
## Bayesian
learning
This talk
## 4

## This Tutorial
•Strategic form games and Nash equilibrium
•Adaptive learning in games
–Fictitious play and shortcomings
•Special classes of games:
–Supermodular games and dynamics
–Potential and congestion games and dynamics
•Bayesian learning in games
–Information aggregation in social networks
## 5

## Strategic Form Games
•A strategic (form) game is a model for a game in which all of the participants
act simultaneously and without knowledge of other players’ actions.
Definition (Strategic Game):Astrategic gameis a triplet〈I,(S
i
## )
i∈I
## ,(u
i
## )
i∈I
## 〉:
•Iis a finite set of players,I={1, . . . , I}.
## •S
i
is the set of available actions for playeri
## –s
i
## ∈S
i
is an action for playeri
## –s
## −i
## = [s
j
## ]
j6=i
is a vector of actions for all playersexcepti.
## –(s
i
, s
## −i
)∈Sis anaction profile, oroutcome.
## –S=
## ∏
i
## S
i
is the set of all action profiles
## –S
## −i
## =
## ∏
j6=i
## S
j
is the set of all action profiles for all playersexcepti
## •u
i
:S→Ris the payoff (utility) function of playeri
•We will use the termsactionandpure strategyinterchangeably.
## 6

## Example
•Example:Cournot competition.
–Two firms producing the same good.
–The action of a playeriis a quantity,s
i
∈[0,∞](amount of good he
produces).
–The utility for each player is its total revenue minus its total cost,
u
i
## (s
## 1
, s
## 2
## ) =s
i
p(s
## 1
## +s
## 2
## )−cs
i
wherep(q)is the price of the good (as a function of the total amount), andc
is unit cost (same for both firms).
•Assume for simplicity thatc= 1andp(q) = max{0,2−q}
•Consider thebest-response correspondencesfor each of the firms, i.e., for eachi,
the mappingB
i
## (s
## −i
## ) :S
## −i
## →S
i
such that
## B
i
## (s
## −i
## )∈argmax
s
i
## ∈S
i
u
i
## (s
i
, s
## −i
## ).
## 7

Example–Continued
•By using the first order optimality conditions,
we have
## B
i
## (s
## −i
)  =  argmax
s
i
## ≥0
## (s
i
## (2−s
i
## −s
## −i
## )−s
i
## )
## =
## 
## 
## 
## 1−s
## −i
## 2
ifs
## −i
## ≤1,
## 0otherwise.
•The figure illustrates the best response func-
tions as a function ofs
## 1
ands
## 2
## .
## 1/2
## 1
## 1/2
## 1
## B
## 1
## (s
## 2
## )
## B
## 2
## (s
## 1
## )
s
## 1
s
## 2
•Assuming that players arerational and fully knowledgable about the structure of
the game and each other’s rationality, what should the outcome of the game be?
## 8

Pure and Mixed Strategy Nash Equilibrium
Definition (Nash equilibrium):A (pure strategy) Nash Equilibrium of a strategic
game〈I,(S
i
## )
i∈I
## ,(u
i
## )
i∈I
〉is a strategy profiles
## ∗
∈Ssuch that for alli∈I
u
i
## (s
## ∗
i
, s
## ∗
## −i
## )≥u
i
## (s
i
, s
## ∗
## −i
)for alls
i
## ∈S
i
## .
•No player can profitably deviate given the strategies of the other players
•An action profiles
## ∗
is a Nash equilibrium if and only if
s
## ∗
i
## ∈B
i
## (s
## ∗
## −i
)for alli∈I,
•LetΣ
i
denote the set of probability measures over the pure strategy setS
i
## .
•We useσ
i
## ∈Σ
i
to denote themixed strategy of playeri, andσ∈Σ =
## ∏
i∈I
## Σ
i
to denote amixed strategy profile(similarly defineσ
## −i
## ∈Σ
## −i
## =
## ∏
j6=i
## Σ
j
## )
•Following Von Neumann-Morgenstern expected utility theory, we extend the
payoff functionsu
i
fromStoΣby
u
i
## (σ) =
## ∫
## S
u
i
## (s)dσ(s).
Definition (Mixed Nash Equilibrium):A mixed strategy profileσ
## ∗
is a (mixed
strategy) Nash Equilibrium if for each playeri,
u
i
## (σ
## ∗
i
, σ
## ∗
## −i
## )≥u
i
## (σ
i
, σ
## ∗
## −i
)for allσ
i
## ∈Σ
i
## .
## 9

Existence of Nash Equilibria
Theorem:[Nash 50]Every finite game has a mixed strategy Nash equilibrium.
## Proof Outline:
## •σ
## ∗
mixed Nash equilibrium if and only ifσ
## ∗
i
## ∈B
i
## (σ
## ∗
## −i
)for alli∈I, where
## B
i
## (σ
## ∗
## −i
)∈arg max
σ
i
## ∈Σ
i
u
i
## (σ
i
, σ
## ∗
## −i
## ).
•This can be written compactly asσ
## ∗
∈B(σ
## ∗
), whereB(σ) = [B
i
## (σ
## −i
## )]
i∈I
, i.e.,
σ
## ∗
is afixed point of the best-response correspondence.
•Use Kakutani’s fixed point theorem to establish the existence of a fixed point.
Linearity of expectation in probabilities play a key role; extends to(quasi)-concave
payoffs in infinite games
Theorem:[Debreu, Glicksberg, Fan 52]Assume that theS
i
are nonempty compact
convex subsets of an Euclidean space. Assume that the payoff functionsu
i
## (s
i
, s
## −i
## )
are quasi-concave ins
i
and continuous ins, then there exists a pure strategy Nash
equilibrium.
•Existence of mixed strategy equilibria for continuous games[Glicksberg 52]and
some discontinuous games[Dasgupta and Maskin 86]
## 10

Adaptive Learning in Finite Games
•Most economic theory relies on equilibrium analysis based on Nash equilibrium or
its refinements.
•Traditional explanation for when and why equilibrium arises:
–Results from analysis and introspection by sophisticated players when the
structure of the game and the rationality of the players are all common
knowledge.
•Alternative justification more relevant for networked-systems:
–Arises as the limit point of a repeated play in which less than fully rational
players myopically update their behavior
–Agents behave as if facing a stationary, but unknown, distribution of
opponents’ strategies
## 11

## Fictitious Play
•A natural and widely used model of learning isfictitious play[Brown 51]
–Players form beliefs about opponent play and myopically optimize their
action with respect to these beliefs
•Agentiforms theempirical frequency distribution of his opponentj’s past play
according to
μ
t
j
## ( ̃s
j
## ) =
## 1
t
t−1
## ∑
τ=0
## I(s
t
j
## =  ̃s
j
## ),
letμ
t
## −i
## =
## ∏
j6=i
μ
t
j
for allt.
•He then chooses his action at timetto maximize his payoff, i.e.,
s
t
i
∈arg max
s
i
## ∈S
i
u
i
## (s
i
, μ
t
## −i
## ).
–This choice ismyopic, i.e., players are trying to maximize current payoff
without considering their future payoffs.
–Players only need to know their own utility function.
## 12

Basic Properties of Fictitious Play
•Let{s
t
}be a sequence of strategy profiles generated by fictitious play.
•We say that{s
t
}converges toσ∈Σin the time-average senseif the empirical
frequencies converge toσ, i.e.,μ
t
i
## →σ
i
for alli.
Proposition:Suppose a fictitious play sequence{s
t
}converges toσin the
time-average sense. Thenσis a Nash equilibrium of the stage game.
•Is convergence in the time-average sense a natural notion of convergence?
## 13

Shortcomings of Fictitious Play
Mis-coordination example [Fudenberg, Kreps 88]: Consider the FP of the game:
## AB
## A1,10,0
## B0,01,1
Note that this game had a unique mixed Nash equilibrium
## (
## (1/2,1/2),(1/2,1/2)
## )
## .
Consider the following sequence of play:
η
t
## 1
η
t
## 2
## Play
## 0(0,1/2)(1/2,0)(A,B)
## 1(1,1/2)(1/2,1)(B,A)
## 2(1,3/2)(3/2,1)(A,B)
## 3······(B,A)
•Play continues as (A,B), (B,A),. . .- a deterministic cycle.
•The time average converges to
## (
## (1/2,1/2),(1/2,1/2)
## )
, which is a mixed
strategy equilibrium of the game.
•But players never successfully coordinate!
## 14

## Alternative Focus
•Various convergence problems present for adaptive learning rules
–Uncoupled dynamics do not lead to Nash equilibrium![Hart, Mas-Colell 03]
•Rather than seeking learning dynamics that converge to reasonable behavior in all
games, focus on relevant classes games that arise in engineering and economics
•In particular, this talk:
–Supermodular Games
–Potential Games
•Advantages:
–Tractable and elegant characterization of equilibria, sensitivity analysis
–Most reasonable adaptive learning rules converge to Nash equilibria
## 15

## Supermodular Games
•Supermodular games are those characterized bystrategic complementarities
•Informally, this means that themarginal utility of increasing a player’s
strategy raises with increases in the other players’ strategies.
•Why interesting?
–They arise in many models.
–Existence of a pure strategy equilibrium without requiring the quasi-concavity
of the payoff functions.
–Many solution concepts yield the same predictions.
–The equilibrium set has a smallest and a largest element.
–They have nice sensitivity (or comparative statics) properties and behave well
under a variety of distributed dynamic rules.
•The machinery needed to study supermodular games is lattice theory and
monotonicity results in lattice programming
–Methods used arenon-topological and they exploit order properties
## 16

## Increasing Differences
•We first study the monotonicity properties of optimal solutions of parametric
optimization problems:
x(t)∈arg max
x∈X
f(x, t),
wheref:X×T→R,X⊂R, andTis some partially ordered set.
Definition:LetX⊆RandTbe some partially ordered set. A function
f:X×T→Rhasincreasing differencesin(x, t)if for allx
## ′
## ≥xandt
## ′
≥t, we
have
f(x
## ′
, t
## ′
)−f(x, t
## ′
## )≥f(x
## ′
, t)−f(x, t).
•incremental gain to choosing a higherx(i.e.,x
## ′
rather thanx) is greater whent
is higher, i.e.,f(x
## ′
, t)−f(x, t)is nondecreasing int.
Lemma:LetX⊆RandT⊂R
k
for somek, a partially ordered set with the usual
vector order. Letf:X×T→Rbe a twice continuously differentiable function.
Then, the following statements are equivalent:
(a)The functionfhas increasing differences in(x, t).
(b)For allx∈X,t∈T, and alli= 1, . . . , k, we have
## ∂
## 2
f(x, t)
## ∂x∂t
i
## ≥0.
## 17

Examples–I
Example:Network effects (positive externalities).
•A setIof users can use one of two technologiesXandY(e.g., Blu-ray and HD
## DVD)
## •B
i
(J, k)denotes payoff toiwhen a subsetJof users use technologykandi∈J
•There exists anetwork effect or positive externalityif
## B
i
(J, k)≤B
i
## (J
## ′
, k),whenJ⊂J
## ′
## ,
i.e., playeribetter off if more users use the same technology as him.
•Leads naturally to a strategic form game with actionsS
i
## ={X, Y}
•Define the orderY∫X, which induces a lattice structure
•Givens∈S, letX(s) ={i∈I |s
i
=X},Y(s) ={i∈I |s
i
## =Y}.
•Define the payoffs as
u
i
## (s
i
, s
## −i
## ) =
## 
## 
## 
## B
i
(X(s), X)ifs
i
## =X,
## B
i
(Y(s), Y)ifs
i
## =Y
•Show that the payoff functions of this game feature increasing differences.
## 18

Examples –II
Example:Cournot duopoly model.
•Two firms choose the quantity they produceq
i
## ∈[0,∞).
•LetP(Q)withQ=q
i
## +q
j
denote the inverse demand (price) function. Payoff
function of each firm isu
i
## (q
i
, q
j
## ) =q
i
## P(q
i
## +q
j
## )−cq
i
## .
•AssumeP
## ′
(Q) +q
i
## P
## ′′
(Q)≤0(firmi’s marginal revenue decreasing inq
j
## ).
•Show that the payoff functions of the transformed game defined bys
## 1
## =q
## 1
## ,
s
## 2
## =−q
## 2
has increasing differences in(s
## 1
, s
## 2
## ).
## 19

Monotonicity of Optimal Solutions
Theorem:[Topkis 79]LetX⊂Rbe a compact set andTbe some partially ordered
set. Assume that the functionf:X×T→Ris upper semicontinuous inxfor all
t∈Tand has increasing differences in(x, t). Definex(t) = arg max
x∈X
f(x, t).
Then, we have:
1.For allt∈T,x(t)is nonempty and has a greatest and least element, denoted by
## ̄x(t)andx(t)respectively.
2.For allt
## ′
≥t, we have ̄x(t
## ′
## )≥ ̄x(t)andx(t
## ′
## )≥x(t).
•Iffhas increasing differences, the set of optimal solutionsx(t)is non-decreasing
in the sense that the largest and the smallest selections are non-decreasing.
## 20

## Supermodular Games
Definition:The strategic game〈I,(S
i
## ),(u
i
)〉is a supermodular game if for alli:
## 1.S
i
is a compact subset ofR(or more generallyS
i
is a complete lattice inR
m
i
## ),
## 2.u
i
is upper semicontinuous ins
i
, continuous ins
## −i
## ,
## 3.u
i
has increasing differences in(s
i
, s
## −i
)[or more generallyu
i
is supermodular in
## (s
i
, s
## −i
), which is an extension of the property of increasing differences to games
with multi-dimensional strategy spaces].
•Apply Topkis’ Theorem to best response correspondences
Corollary:Assume〈I,(S
i
## ),(u
i
)〉is a supermodular game. Let
## B
i
## (s
## −i
) = arg max
s
i
## ∈S
i
u
i
## (s
i
, s
## −i
## ).
## Then:
## 1.B
i
## (s
## −i
)has a greatest and least element, denoted by
## ̄
## B
i
## (s
## −i
)andB
i
## (s
## −i
## ).
2.Ifs
## ′
## −i
## ≥s
## −i
, then
## ̄
## B
i
## (s
## ′
## −i
## )≥
## ̄
## B
i
## (s
## −i
)andB
i
## (s
## ′
## −i
## )≥B
i
## (s
## −i
## ).
## 21

Existence of a Pure Nash Equilibrium
•Follows from Tarski’s fixed point theorem
Theorem:[Tarski 55]LetSbe a compact sublattice ofR
k
andf:S→Sbe an
increasing function (i.e.,f(x)≤f(y)ifx≤y). Then, the set of fixed points off,
denoted byE, is nonempty.
s
f(s)
s
f(s)
•Apply Tarski’s fixed point theorem to best response correspondences
•Nash equilibrium set has a largest and a smallest element, and easy sensitivity
results (e.g., quantity supplied increases with demand in Cournot game)
## 22

Dynamics in Supermodular Games
Theorem:[Milgrom, Roberts 90]LetG=〈I,(S
i
## ),(u
i
)〉be a supermodular game.
## Let{s
t
}be a sequence of strategy profiles generated byreasonable adaptive
learning rules. Then,
lim inf
t→∞
s
t
≥sandlim sup
t→∞
s
t
## ≤ ̄s,
wheresand ̄sare smallest and largest Nash equilibria ofG.
Reasonable adaptive learning rules:Best-response, fictitious play ...
## Remarks:
•Implies convergence for games with unique Nash equilibrium.
•Fictitious play converges for general supermodular games[Krishna 92], [Berger
03, 07], [Hahn 08]
Example:Apply best-response dynamics to Cournot game
## 23

## Wireless Power Control Game
•Power control in cellular CDMA wireless networks[Alpcan, Basar, Srikant,
Altman 02], [Gunturi, Paganini 03]
•It has been recognized that in the presence of interference, the strategic
interactions between the users is that ofstrategic complementarities[Saraydar,
Mandayam, Goodman 02], [Altman and Altman 03]
## Model:
•LetL={1,2, ..., n}denote the set of users (nodes) andP=
## ∏
i∈L
## [P
min
i
## , P
max
i
## ]
denote the set of power vectorsp= [p
## 1
, . . . , p
n
## ].
•Each user is endowed with a utility functionf
i
## (γ
i
)as a function of its SINRγ
i
## .
## –f
i
## (γ
i
)depends on details of transmission: modulation, coding, packet size
–In most practical cases,f(γ)is strictly increasing and has a sigmoidal shape.
•The payoff function of each user represents a tradeoff between the payoff
obtained by the received SINR and the power expenditure, and takes the form
u
i
## (p
i
, p
## −i
## ) =f
i
## (γ
i
## )−cp
i
## .
## 24

## Increasing Differences
•Assume that each utility function satisfies the following assumption regarding its
coefficient of relative risk aversion:
## −γ
i
f
## ′′
i
## (γ
i
## )
f
## ′
i
## (γ
i
## )
≥1,for allγ
i
## ≥0.
–Satisfied byα-fair functionsf(γ) =
γ
## 1−α
## 1−α
, α >1[Mo, Walrand 00], and the
efficiency functions introduced earlier
•Show that for alli, the functionu
i
## (p
i
, p
## −i
)has increasing differences in(p
i
, p
## −i
## ).
## Implications:
•Power control game has a pure Nash equilibrium.
•The Nash equilibrium set has a largest and a smallest element, and there are
distributed algorithmsthat will converge to any of these equilibria.
•These algorithms involve each user updating their power level locally (based on
total received power at the base station).
## 25

## Potential Games
Definition [Monderer and Shapley 96]:
(i)A functionΦ :S→Ris called anordinal potential functionfor the gameGif
for alliand alls
## −i
## ∈S
## −i
## ,
u
i
(x, s
## −i
## )−u
i
(z, s
## −i
)>0iffΦ(x, s
## −i
)−Φ(z, s
## −i
)>0,for allx, z∈S
i
## .
(ii)A functionΦ :S→Ris called apotential functionfor the gameGif for alli
and alls
## −i
## ∈S
## −i
## ,
u
i
(x, s
## −i
## )−u
i
(z, s
## −i
) = Φ(x, s
## −i
)−Φ(z, s
## −i
),for allx, z∈S
i
## .
Gis called an ordinal (exact) potential game if it admits an ordinal (exact) potential.
## 26

Properties of Potential Games
•A global maximum of an ordinal potential function is a pure Nash equilibrium
(there may be other pure NE, which are local maxima)
–Every finite ordinal potential game has a pure Nash equilibrium.
•Many adaptive learning dynamics “converge” to a pure Nash equilibrium
[Monderer and Shapley 96], [Young 98, 05], [Hart, Mas-Colell 00,03], [Marden,
## Arslan, Shamma 06, 07]
–Examples:Fictitious play, better reply with inertia, spatial adaptive play,
regret matching (for 2 player potential games)
## 27

## Congestion Games
•Congestion games arise when users need to share resources in order to complete
certain tasks
–For example, drivers share roads, each seeking a minimal cost path.
–The cost of each road segment adversely affected by the number of other
drivers using it.
•Congestion Model:C=〈N, M,(S
i
## )
i∈N
## ,(c
j
## )
j∈M
## 〉where
–N={1,2,···, n}is the set of players,
–M={1,2,···, m}is the set of resources,
## –S
i
consists of sets of resources (e.g., paths) that playerican take.
## –c
j
(k)is the cost to each user who uses resourcejifkusers are using it.
•Define congestion game〈N,(S
i
## ),(u
i
)〉with utilitiesu
i
## (s
i
, s
## −i
## ) =
## ∑
j∈s
i
c
j
## (k
j
## ),
wherek
j
is the number of users of resourcejunder strategiess.
Theorem:[Rosenthal 73]Every congestion game is a potential game.
Proof idea:Verify that the following is a potential function for the congestion game:
## Φ(s) =
## ∑
j∈∪s
i
## (
k
j
## ∑
k=1
c
j
## (k)
## )
## 28

## Network Design
•Sharing the cost of a designed network among participants[Anshelevich et al. 05]
## Model:
•Directed graphN= (V, E)with edge cost
c
e
## ≥0,kplayers
•Each playerihas a set of nodesT
i
he wants
to connect
•A strategy of playeriset of edgesS
i
## ⊂E
such thatS
i
connects to all nodes inT
i
s
t1t2tk-1tk
## ...
## 11/2
## 1/(k-1)
## 1/k
## 1+İ
## 0
## 000
Optimum cost:  1+İ
Unique NE cost:
•Cost sharing mechanism:All players using an edge split the cost equally
•Given a vector of player’s strategiesS= (S
## 1
## , . . . , S
k
), the cost to agentiis
## C
i
## (S) =
## ∑
e∈S
i
## (c
e
## /x
e
), wherex
e
is the number of agents whose strategy
contains edgee
This game is acongestion game, implying existence of a pure Nash equilibrium and
convergence of learning dynamics.
## 29

## Other Examples
Game Theory for Nonconvex Distributed Optimization:
•Distributed Power Control for Wireless Adhoc Networks[Huang,Berry,Honig 05]
–Two models: Single channel spread spectrum, Multi-channel orthogonal
frequency division multiplexing
–Asynchronous distributed algorithm for optimizing total network performance
–Convergence analysis in the presence of nonconvexities usingsupermodular
game theory
•Distributed Cooperative Control–“Constrained Consensus”[Marden, Arslan,
## Shamma 07]
–Distributed algorithms to reach consensus in the “values of multiple agents”
(e.g. averaging and rendezvous problems)
–Nonconvex constraints in agent values
–Design a game (i.e., utility functions of players) such that
∗The resulting game is apotential gameand the Nash equilibrium
“coincides” with the social optimum
∗Use learning dynamics for potential games to design distributed algorithms
with favorable convergence properties
## 30

Bayesian Learning in Games
•So far focus on adaptive learning
•Individuals do not update their model even tough they repeatedly observe the
strategies of their opponents changing dynamically
•Alternative paradigm:Individuals engage in Bayesian updating with (some)
understanding of the strategy profiles of others
–Similar to Bayesian learning in decision-theoretic problems, though richer
because of strategic interactions
## 31

Model of Bayesian Learning
•Illustrate main issues with a simple model in which learning is about payoff
relevant state of the world
•Relevance to networks:Model society, information flows as asocial network
•Dynamic game with sequential decisions based on private signals and observation
of past actions
•Payoffs conditional on the (unknown) state of the world
•Measure of information aggregation:whether there will be convergence to
correct beliefs and decisions in large networks—
asymptotic learning
•Question:Under what conditions—structure of signals, network/communication
structure, heterogeneity of preferences—do individuals learn the state as the
social network grows bigger?
## 32

Difficulties of Bayesian Learning in Games
•Model for Bayesian learning on a line[Bikchandani, Hirschleifer, Welch (92),
## Banerjee (92)]
•Two possible states of the worldθ∈{0,1}, both equally likely
•A sequence of agents(n= 1,2, ...)making decisionsx
n
## ∈{0,1}
•Agentnobtains utility 1 ifx
n
=θand utility 0 otherwise
•Each agent has iid private binary signalss
n
, wheres
n
=θwith probability>1/2
•Agentnknows his signals
n
and the decisions of previous agentsx
## 1
, x
## 2
, ..., x
n−1
•Agentnchooses action 1 if
## P(θ= 1|s
n
, x
## 1
, x
## 2
, ..., x
n−1
)>P(θ= 0|s
n
, x
## 1
, x
## 2
, ..., x
n−1
## )
•Ifs
## 1
## =s
## 2
6=θ, then all agentsherdandx
n
6=θfor all agents,
lim
n→∞
## P(x
n
## =θ)<1
## 33

Bayesian Learning in Networks
•Model of learning on networks[Acemoglu, Dahleh, Lobel, Ozdaglar 08]
•Two possible states of the worldθ∈{0,1}, both equally likely,
•A sequence of agents(n= 1,2, ...)making decisionsx
n
## ∈{0,1}.
•Agentnobtains utility 1 ifx
n
=θand utility 0 otherwise
•Each agent has an iid private signals
n
inS. The signal is generated according
to distributionF
θ
## ,F
## 0
andF
## 1
absolutely continuous with respect to each other
## •(F
## 0
## ,F
## 1
)is thesignal structure
•Agentnhas a neighborhoodB(n)⊆{1,2, ..., n−1}and observes the decisions
x
k
for allk∈B(n). The setB(n)is private information.
•The neighborhoodB(n)is generated according to an arbitrary distributionQ
n
## •{Q
n
## }
n∈N
is thenetwork topologyand is common knowledge
•Asocial networkconsists of the signal structure and network topology
•Asymptotic Learning:Under what conditions doeslim
n→∞
## P(x
n
## =θ) = 1?
## 34

## Perfect Bayesian Equilibria
•Agentn’s information set isI
n
## ={s
n
, B(n), x
k
for allk∈B(n)}
•A strategy for individualnisσ
n
## :I
n
## →{0,1}
•A strategy profile is a sequence of strategiesσ={σ
n
## }
n∈N
## .
–A strategy profileσinduces a probability measureP
σ
over{x
n
## }
n∈N
## .
Definition:A strategy profileσ
## ∗
is a pure-strategyPerfect Bayesian Equilibriumif
for eachn∈N
σ
## ∗
n
## (I
n
## )∈argmax
y∈{0,1}
## P
## (y,σ
## ∗
## −n
## )
(y=θ|I
n
## )
•A pure strategy PBE exists. Denote the set of PBEs byΣ
## ∗
## .
Definition:Given a signal structure(F
## 0
## ,F
## 1
)and a network topology{Q
n
## }
n∈N
, we
say that
asymptotic learning occurs in equilibriumσifx
n
converges toθin
probability (according to measureP
σ
), that is,
lim
n→∞
## P
σ
## (x
n
## =θ) = 1
## 35

## Equilibrium Decision Rule
Lemma:The decision of agentn,x
n
=σ(I
n
), satisfies
x
n
## =
## 
## 
## 
1,ifP
σ
## (θ= 1|s
n
## ) +P
σ
## (
θ= 1|B(n), x
k
for allk∈B(n)
## )
## >1,
0,ifP
σ
## (θ= 1|s
n
## ) +P
σ
## (
θ= 1|B(n), x
k
for allk∈B(n)
## )
## <1,
andx
n
## ∈{0,1}otherwise.
•Implication:The belief about the state decomposes into two parts:
–thePrivate Belief:P
σ
## (θ= 1|s
n
## );
–theSocial Belief:P
σ
(θ= 1|B(n), x
k
for allk∈ω
n
## ).
## 36

## Private Beliefs
Lemma:The private belief of agentnis
p
n
## (s
n
## ) =P
σ
## (θ= 1|s
n
## ) =
## (
## 1 +
dF
## 0
## (s
n
## )
dF
## 1
## (s
n
## )
## )
## −1
## .
Definition:The signal structure hasbounded private beliefsif there exists some
0< m, M <∞such that the Radon-Nikodym derivatedF
## 0
/dF
## 1
satisfies
m <
dF
## 0
dF
## 1
## (s)< M,
for almost alls∈Sunder measure(F
## 0
## +F
## 1
)/2. The signal structure hasunbounded
private beliefsif
inf
s∈S
dF
## 0
dF
## 1
## (s) = 0andsup
s∈S
dF
## 0
dF
## 1
## (s) =∞.
•Bounded private beliefs⇔bounded likelihood ratio
•If the private beliefs are unbounded, then there exist some agents withbeliefs
arbitrarily close to 0and other agents withbeliefs arbitrarily close to 1.
## 37

Properties of Network Topology
Definition:A network topology{Q
n
## }
n∈N
hasexpanding observationsif for allK,
lim
n→∞
## Q
n
## (
max
b∈B(n)
b < K
## )
## = 0.
Otherwise, it hasnonexpanding observations
•Expanding observations do not imply connected graph
•Nonexpanding observations equivalently : There exists someK,≤ >0and an
infinite subsetN ∈Nsuch that
## Q
n
## (
max
b∈B(n)
b < K
## )
≥≤for alln∈N.
•A finite group of agents isexcessively influentialif there exists an infinite
number of agents who, with probability uniformly bounded away from 0, observe
only the actions of a subset of this group.
–For example, a group is excessively influential if it is the source ofall
informationfor an infinitely large component of the network
•Nonexpanding observations⇔excessively influential agents
## 38

## Main Results - I
Theorem 1:Assume that the network topology{Q
n
## }
n∈N
has nonexpanding
observations. Then, there exists no equilibriumσ∈Σ
## ∗
with asymptotic learning.
Theorem 2:Assume that the signal structure(F
## 0
## ,F
## 1
)has unbounded private beliefs
and the network topology{Q
n
## }
n∈N
has expanding observations. Then, asymptotic
learning occurs in every equilibriumσ∈Σ
## ∗
## .
•Implication:Influential, butnotexcessively influential, individuals (observed by
disproportionately more agents in the future) do not prevent learning.
•This contrasts with results in models of myopic learning
•Intuition:because the weight given to the information of influential individuals
is reduced according to Bayesian updating.
## 39

Main Results - II
Theorem 3:If the private beliefs are bounded and the network topology satisfies one
of the following conditions,
(a)B(n) ={1, ..., n−1}for allnor|B(n)|≤1for alln,
(b)there exists some constantMsuch that|B(n)|≤Mfor allnand
lim
n→∞
max
b∈B(n)
b=∞with probability 1,
then asymptotic learning does not occur.
•Implication:
No learning with random sampling and bounded beliefs
Theorem 4:There exist network topologies where asymptotic learning occurs for any
signal structure(F
## 0
## ,F
## 1
## ).
Example:For alln,
## B(n) =
## 
## 
## 
{1, ..., n−1},with probability1−r(n);
∅,with probabilityr(n),
for some sequence{r(n)}wherelim
n→∞
r(n) = 0and
## ∑
## ∞
n=1
r(n) =∞.
In this case, asymptotic learning occurs for an arbitrary signal structure(F
## 0
## ,F
## 1
## )and
at any equilibrium.
## 40

## Concluding Remarks
•Game theory increasingly used for the analysis and control of networked systems
•Many applications:
–Sensor networks, mobile ad hoc networks
–Large-scale data networks, Internet
–Social and economic networks
–Electricity and energy markets
•Future Challenges
–Models for understanding when equilibrium behavior yields efficient outcomes
–Dynamics of agent interactions over large-scale networks
–Endogenous network formation: dynamics of decisions and graphs
–Interactions of heterogeneous interlayered networks (e.g., social and
communication networks)
## 41