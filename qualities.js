// Unlicense: this is submitted as Public Domain by it's author Michael Vaganov
/*
each category must:
	identify important values for productive humans
	provide concise descriptions
each category should:
	provide a list of component traits/values
	provide a list of opposed traits/values

visualization TODO:
timeline that scales from earliest record to today
each record has a dot.
dot radius is equal to the number of votes at that score for that 'position'
positions determines color of the dot
dots that were suggested by others are dotted
labeled rectangles show the boundaries of where specitic project records are
UI allows show/hide records of each dimension, including project name

records: [{
	position: [
		attribute{string},
		projectLifeCycle{string},
		maturity{string},
		projectName{string}
	],
	score:{Number},
	timestamp:{unixTime},
	type:{string:["self","suggested"]}
}]

Sophrosyne (Greek: σωφροσύνη) is an ancient Greek concept of an ideal of excellence of character and soundness of mind, which when combined in one well-balanced individual leads to other qualities, such as temperance, moderation, prudence, purity, and self-control.
*/
var DB_valueCategory = {
	"empathy": {
		description:"recognition and shared-experience of peoples' feelings",
		icon:"icons/empathy.png",
		color:"#ff0000",
		iconStyle:"filter: invert(1) brightness(50%) sepia(200%) saturate(10000%) hue-rotate(0deg)",
		avatar:["Dalai Lama","Pope Francis"],
		philisophicalContext:{
			big5:"agreeableness",aristotle:"eunoia - self awareness",
		},
		tooLittle:["apathy","hatred","greed","prejudice","fear"],
		tooMuch:["guilt","social impotence","paralysis"],
		justRight:["love","kindness","humility","second order thinking"],
	},
	"knowledge": {
		description:"ability to predict through recognition of patterns", 
		icon:"icons/understanding.png",
		color:"#00ffff",
		iconStyle:"filter: invert(1) brightness(50%) sepia(200%) saturate(10000%) hue-rotate(180deg) brightness(300%);",
		avatar:["Sherlock Holmes","Socrates"],
		philisophicalContext:{
			big5:"stable neuroticism",aristotle:"pronesis - wisdom",
		},
		tooLittle:["ignorance","prejudice","fear","foolishness","illiteracy"],
		tooMuch:["neuroticism","paranoia","nihilism"],
		justRight:["understanding","thoughtfulness","problem-solving","knowledge","literacy","abstract thinking"],
	},
	"craft": {
		description: "demonstrated capacity to create or perform",
		icon:"icons/work.png",
		color:"#0000ff",
		iconStyle:"filter: invert(1) brightness(50%) sepia(200%) saturate(10000%) hue-rotate(240deg)",
		avatar:["Amadeus Mozart","Nikola Tesla"],
		philisophicalContext:{
			big5:"conscientiousness",aristotle:"pronesis - skill",
		},
		tooMuch:["obsession","compulsion","perfectionism"],
		tooLittle:["laziness","counter productivity","wastefulness"],
		justRight:["productivity","skill","flow state"],
	},
	"faithfulness": {
		description:"willingness to expect a future that is unsupported by facts in the present",
		icon:"icons/faithful.png",
		color:"#ff00ff",
		iconStyle:"filter: invert(1) brightness(50%) sepia(200%) saturate(10000%) hue-rotate(300deg)",
		avatar:["the centurion","Ghandi"],
		philisophicalContext:{
			big5:"conscientiousness",aristotle:"arete - virtue",
		},
		tooLittle:["nihilism","greed","hedonism","foolishness"],
		tooMuch:["magical thinking","slavery","conspiracy-theory-ism","blind obedience"],
		justRight:["trust","faith","confidence","purity","cleanliness","morality","discipline"]
	},
	"growth": {
		description:"evolution through trial and error",
		icon:"icons/growth.png",
		color:"#00ff00",
		iconStyle:"filter: invert(1) brightness(50%) sepia(200%) saturate(10000%) hue-rotate(120deg) brightness(300%);",
		avatar:["Tony Robbins", "Sal Khan"],
		philisophicalContext:{
			big5:"openness to experience",aristotle:"arete - goodwill",
		},
		tooLittle:["boredom","retardation","gullibility","immaturity","slavery","avoidance"],
		tooMuch:["hedonism","chaos","addiction","self deception"],
		justRight:["creativity", "persistence","metacognition","self transcendence","repentance"],
	},
	"solidarity": {
		description:"communication-with and organization-of people",
		icon:"icons/community.png",
		color:"#ffff00",
		iconStyle:"filter: invert(1) brightness(50%) sepia(200%) saturate(10000%) hue-rotate(60deg) brightness(300%);",
		avatar:["Abe Lincoln", "George Washington"],
		philisophicalContext:{
			big5:"extraversion",aristotle:"eunoia - audience awareness",
		},
		tooLittle:["depression","disconnection","lack of support","isolation","violence"],
		tooMuch:["tyranny","arrogance","chaotic instigation","cultism"],
		justRight:["community building","connectedness","communication","participation"],
	},
	"initiative": {
		description:"what starts a person working on a project?",
		icon:"icons/initiative.png",
		color:"#ff0000",
		iconStyle:"filter: invert(1) brightness(50%) sepia(200%) saturate(10000%) hue-rotate(0deg)",
	},
	"planning": {
		description:"what shaped a project?",
		icon:"icons/plan.png",
		color:"#00ffff",
		iconStyle:"filter: invert(1) brightness(50%) sepia(200%) saturate(10000%) hue-rotate(180deg) brightness(300%);",
	},
	"doing": {
		description:"how effort applied to get a project done?",
		icon:"icons/implement.png",
		color:"#0000ff",
		iconStyle:"filter: invert(1) brightness(50%) sepia(200%) saturate(10000%) hue-rotate(240deg)",
	},
	"testing": {
		description:"how is the project tested for success?",
		icon:"icons/test.png",
		color:"#ff00ff",
		iconStyle:"filter: invert(1) brightness(50%) sepia(200%) saturate(10000%) hue-rotate(300deg)",
	},
	"review": {
		description:"how are results of the project considered?",
		icon:"icons/judgement.png",
		color:"#00ff00",
		iconStyle:"filter: invert(1) brightness(50%) sepia(200%) saturate(10000%) hue-rotate(120deg) brightness(300%);",
	},
	"achievement": {
		description:"what are the goals of a project?",
		icon:"icons/achieve.png",
		color:"#ffff00",
		iconStyle:"filter: invert(1) brightness(50%) sepia(200%) saturate(10000%) hue-rotate(60deg) brightness(300%);",
	},

	"familiar": {
		description:"Reactive, easy to recognize with superficial tests or observation.",
		icon:"icons/tier1.png",
		color:"#444444",
		iconStyle:"brightness(50%) ",
	},
	"independent": {
		description:"Pro-active, require thoughtful observation to test.",
		icon:"icons/tier2.png",
		color:"#888888",
		iconStyle:"brightness(25%) ",
	},
	"expert": {
		description:"Can be very hard to evaluate with certainty. Clear examples of this indicate leadership, demand recognition, and encourage personal introspection",
		icon:"icons/tier3.png",
		color:"#ffffff",
		iconStyle:"brightness(0%) ",
	},
};

/* all submissions have an e-mail identifier and text box for providing rational: 
	endorse/denounce category
	endorse/denounce evaluation-pair
	suggest new pair, with Ptext, Ntext, and Categories
	suggest replacing pair Ptext, Ntext, or Categories
	suggest new category, including description, and opposed list
*/

var allCategoryListing = [
	["empathy","knowledge","craft","faithfulness","growth","solidarity"],
	["initiative","planning","doing","testing","review","achievement"],
	["familiar","independent","expert"],
];

var defaultCategoryListing = [
	["empathy","knowledge","craft","faithfulness","growth","solidarity"],
	["initiative","planning","doing","testing","review","achievement"],
	["familiar"],
];
var fastCategoryListing = [
	[],
	[],
	["familiar","independent","expert"],
];

// positive/negative pairs = ["I want to be someone who", "Not someone who", ["categories"]]
var qualityValues = 
/*
each categorized pair must:
	be concise
	identify clear extremes for behavior, in a way children can evaluate
each pair should:
	encourage or convict a person to self-reflect
	overlap as little as possible with other pairs
	positive should pairs should be as-mutually-exclusive-as-possible to negative pairs, but both should be reasonable enough that a person could do both
*/
[
//[
//],"empathy":[
//init - what starts the process?
	["offered-help or accepted-help",
	 "let others (or self) suffer alone, despite help nearby",
		["empathy","initiative","familiar"]],
	["listened to how others struggle, to help them",
	 "ignored or justified others' suffering",
		["empathy","initiative","independent"]],
	["searched-for and aligned-with the hopeless and traumatized",
	 "made excuses-for or greedily-allowed others' suffering",
		["empathy","initiative","expert"]],
//plan - what shapes the process?
	["planned to address the needs and requests of others",
	 "was self-focused, ignored others' needs",
		["empathy","planning","familiar"]],
	["asked mirroring (do you mean?) questions to understand others",
	 "dismissed other people without listening",
		["empathy","planning","independent"]],
	["uncovered real needs by trusting and empowering others",
	 "deceived others to pacify them",
		["empathy","planning","expert"]],
//doing - how does the process get done?
	["acted and spoke politely and honestly",
	 "was rude, exaggerated, or withheld information",
		["empathy","doing","familiar"]],
	["communicated and acted to improve others' feelings",
	 "was inconsiderate of other's feelings",
		["empathy","doing","independent"]],
	["encouraged others even while being critical",
	 "acted or said things in discouraging ways",
		["empathy","doing","expert"]],
//testing - how do you check if the process was a success? how to get datapoints?
	["listened-to feedback from others, even critical feedback",
	 "avoided or ignored feedback, except for praise",
		["empathy","testing","familiar"]],
	["empathized with feedback from others, validating them",
	 "dismissed, insulted, or intimidated critics defensively",
		["empathy","testing","independent"]],
	["radically reframed their perspective to understand results",
	 "confined themselves, or others, with stereotypes or labels",
		["empathy","testing","expert"]],
//review - a response once test results are in?
	["accepted others circumstances and opinions as valid",
	 "reduced people to their results, ignoring their circumstances",
		["empathy","review","familiar"]],
	["recognized others with compassion and patience",
	 "divided people competitively, holding grudges",
		["empathy","review","independent"]],
	["validated others as being just-as or more important than self",
	 "ignored others value and claimed others' credit as their own",
		["empathy","review","expert"]],
//goal - what was the point of all of this?
	["acknowleded results with gratitude and appreciation",
	 "claimed glory or redirected blame (sore winner/loser)",
		["empathy","achievement","familiar"]],
	["supported others, even despite personal disagreement",
	 "didn't respect people who weren't \'useful\'",
		["empathy","achievement","independent"]],
	["created a safe space for truth and reconciliation to emerge",
	 "accepted or encouraged unfair treatment of people",
		["empathy","achievement","expert"]],
//],"knowledge":[
//init - what starts the process?
	["questioned things out of curiosity",
	 "only did as directed by authority",
		["knowledge","initiative","familiar"]],
	["brainstormed, researched, or looked-for-inspiration",
	 "plagarized, took credit for work without understanding it",
		["knowledge","initiative","independent"]],
	["was motivated consistently, by passion, purpose, or vision",
	 "lost motivation and never renewed it",
		["knowledge","initiative","expert"]],
//plan - what shapes the process?
	["wrote-down-lists-of (or remembered) ideas to consider later",
	 "assumed their ideas were complete and didn't follow up on them",
		["knowledge","planning","familiar"]],
	["planned for risks and coordinated for success",
	 "forgot commitments, oblivious to circumstance, ignored risks",
		["knowledge","planning","independent"]],
	["made accurate predictions with detail-oriented analysis",
	 "ignored details and avoided verifying assumptions",
		["knowledge","planning","expert"]],
//doing - how does the process get done?
	["shared truth and used facts to make decisions",
	 "promoted untruth, or used opinions as fact",
		["knowledge","doing","familiar"]],
	["was engaged by problem solving and learning",
	 "was bored and constantly distracted",
		["knowledge","doing","independent"]],
	["improved knowledge in a way that simplifed problems",
	 "over-complicated things",
		["knowledge","doing","expert"]],
//testing - how do you check if the process was a success?
	["had expectations that could be tested",
	 "acted without expectations",
		["knowledge","testing","familiar"]],
	["validated understanding with experiments and data",
	 "avoided thinking hard or recognizing results",
		["knowledge","testing","independent"]],
	["improved knowledge with good questions that expose ignorance",
	 "accepted unproven mental-models",
		["knowledge","testing","expert"]],
//review - a response once test results are in?
	["considered cause and effect",
	 "reacted impulsively, without examining consequences",
		["knowledge","review","familiar"]],
	["found patterns in problems to organize and simplify them",
	 "let every problem be unique and hard to fix",
		["knowledge","review","independent"]],
	["used outside-the-box perspectives to discover new solutions",
	 "discounted, disbelieved, or feared unconventional ideas",
		["knowledge","review","expert"]],
//goal - what was the point of all of this?
	["developed knowledge to solve problems",
	 "avoided the mental-effort of learning and problem solving",
		["knowledge","achievement","familiar"]],
	["understood and explained things beyond requirements",
	 "argued for recognition without understanding",
		["knowledge","achievement","independent"]],
	["exposed new questions after a confident display of mastery",
	 "was content to \'get lucky\' and not find out why",
		["knowledge","achievement","expert"]],
//],"craft":[
//init - what starts the process?
	["tried to do work or solve problems",
	 "avoided work or problem solving",
		["craft","initiative","familiar"]],
	["tried to be just as good as anyone else at a job",
	 "needed management by authority to get work done",
		["craft","initiative","independent"]],
	["was inspired to surpass requirements, risking effort",
	 "avoided working without immediate benefits",
		["craft","initiative","expert"]],
//plan - what shapes the process?
	["followed directions or examples",
	 "couldn't follow directions or copy an example",
		["craft","planning","familiar"]],
	["set their own acheivable goals without instructions",
	 "didn't seriously plan for their achievement",
		["craft","planning","independent"]],
	["found room in their plan to do more than was expected",
	 "never expected to apply effort beyond expectations",
		["craft","planning","expert"]],
//doing - how does the process get done?
	["practiced skills and focused on work to get results",
	 "neglected work and looked for distractions",
		["craft","doing","familiar"]],
	["worked with good technique and safety",
	 "ignored best-practices and/or safety",
		["craft","doing","independent"]],
	["made very difficult work look easy, after practice",
	 "was distracted by failure and limitations",
		["craft","doing","expert"]],
//testing - how do you check if the process was a success?
	["tested results to determine quality",
	 "gave people results without testing for quality",
		["craft","testing","familiar"]],
	["regularly tested to find faults early",
	 "didn't test often, hoping it \'just works\' at the end",
		["craft","testing","independent"]],
	["tested rigorously with fine-grained and novel experiments",
	 "didn't consider inconsitent or new circumstances when testing",
		["craft","testing","expert"]],
//review - a response once test results are in? TODO these sound like Faithfulness
	["accepted guidance and advice when considering next steps",
	 "ignored others' guidance and advice",
		["craft","review","familiar"]],
	["improved their own tools or techniques to improve quality",
	 "didn't change their tools or practices to improve quality",
		["craft","review","independent"]],
	["held self accountable to a finer precision than anyone else",
	 "used shortcuts and accepted a loss in quality",
		["craft","review","expert"]],
//goal - what was the point of all of this?
	["created or improved a specific thing",
	 "left a mess to clean up",
		["craft","achievement","familiar"]],
	["performed well, with notable quality",
	 "neglected the quality of their work",
		["craft","achievement","independent"]],
	["achieved an elegant quality, transcending initial goals",
	 "was unable to get past \'good enough\'",
		["craft","achievement","expert"]],
//],"faithfulness":[
//init - what starts the process?
	["obeyed their better nature and did the right thing",
	 "gave in to urges to sabatoge or prank others",
		["faithfulness","initiative","familiar"]],
	["had personal virtues to publicly be an example of",
	 "had to be blackmailed or coerced into service",
		["faithfulness","initiative","independent"]],
	["felt personally called by something greater than themselves",
	 "was driven by personal gain at the expense of moral virtues",
		["faithfulness","initiative","expert"]],
//plan - what shapes the process?
	["adopted traditional approaches that seemed to work before",
	 "avoided trandition or did not apply lessons from the past",
		["faithfulness","planning","familiar"]],
	["organized their plan around what is most important",
	 "only expected to do 'the fun part'",
		["faithfulness","planning","independent"]],
	["sacrificed their own desires to achieve their values",
	 "pursued their desires, at great cost to themselves or others",
		["faithfulness","planning","expert"]],
//doing - how does the process get done?
	["kept themselves honest and clean, consistent with values",
	 "cut corners wherever possible",
		["faithfulness","doing","familiar"]],
	["kept others honest and clean, consistent with values",
	 "avoided bringing up others' ideals or better nature",
		["faithfulness","doing","independent"]],
	["became a servant, accepting difficult unglamourous work",
	 "only worked on high-profile or glamourous jobs",
		["faithfulness","doing","expert"]],
//testing - how do you check if the process was a success?
	["used fair standards to judge others and themselves",
	 "picked-and-chose the easy options, to minimize effort",
		["faithfulness","testing","familiar"]],
	["used the highest standards that a majority agreess on",
	 "judged others based on favors instead of standards",
		["faithfulness","testing","independent"]],
	["held systems and cultures accountable to moral standards",
	 "accepted or ignored immorality in cultures, laws, or machines",
		["faithfulness","testing","expert"]],
//review - a response once test results are in?
	["made fair decisions with their own values",
	 "ignored their own values to make convenient decisions",
		["faithfulness","review","familiar"]],
	["applied values consistently despite pressure or inconvenience",
	 "avoided tough choices, hoping someone else would do it",
		["faithfulness","review","independent"]],
	["accepted (even harsh) judgement on behalf of others",
	 "made deals to avoid persecution or prosecution",
		["faithfulness","review","expert"]],
//goal - what was the point of all of this?
	["kept promises and acted according to their own values",
	 "was undisciplined, a hypocrite, a liar, or a betrayer",
		["faithfulness","achievement","familiar"]],
	["acted virtuously and blamelessly in success and failure",
	 "accused others to justify their own failures",
		["faithfulness","achievement","independent"]],
	["became a light in a dark place, inspiring hope to others",
	 "exploited others' ignorance or weakness",
		["faithfulness","achievement","expert"]],
//],"growth":[
//init - what starts the process?
	["decided to try solving a problem on their own",
	 "waited for someone else to solve their problems",
		["growth","initiative","familiar"]],
	["picked attainable goals requiring practice or improvement",
	 "avoided struggle with laziness or unrealistic expectations",
		["growth","initiative","independent"]],
	["was inspired to exceed limits set by others",
	 "had unproductive or self-destructive goals",
		["growth","initiative","expert"]],
//plan - what shapes the process?
	["discovered next-steps on their own",
	 "was idle and helpless without directions",
		["growth","planning","familiar"]],
	["broke down big problems into smaller problems",
	 "was overwhelmed and paralyzed by the size of problems",
		["growth","planning","independent"]],
	["changed their habits to attain specific goals",
	 "required specific circumstances to get work done",
		["growth","planning","expert"]],
//doing - how does the process get done?
	["improved at things that seemed difficult at first",
	 "avoided trying difficult things",
		["growth","doing","familiar"]],
	["asked questions and made attempts even when unsure",
	 "avoided tasks that could reveal failure or insecurity",
		["growth","doing","independent"]],
	["derived satisfaction from practice, not just success",
	 "only worked for recognition or to avoid being hassled",
		["growth","doing","expert"]],
//testing - how do you check if the process was a success?
	["identified and admitted problems",
	 "hid or denied their problems",
		["growth","testing","familiar"]],
	["tried to solve problems right as they showed up",
	 "let problems grow in size",
		["growth","testing","independent"]],
	["examined themselves, with meditation or journaling",
	 "confined themselves, with stereotypes or labels",
		["growth","testing","expert"]],
//review - a response once test results are in?
	["learned from mistakes, expected to fix them, and kept going",
	 "justified mistakes, avoided effort after difficulty",
		["growth","review","familiar"]],
	["redeveloped goals after finding setbacks or opportunities",
	 "ignored or deceived-others-about reality to justify actions",
		["growth","review","independent"]],
	["gave up things that kept them from changing-for-the-better",
	 "held on to counter-productive habits and ideas",
		["growth","review","expert"]],
//goal - what was the point of all of this?
	["improved themselves with new experiences",
	 "avoided new experiences, even despite evidence of benefits",
		["growth","achievement","familiar"]],
	["took ownership of failures and acknowledged others' help",
	 "took-credit-for and blamed-failure-on other circumstances",
		["growth","achievement","independent"]],
	["acheived rare or new things",
	 "was unwilling to make mistakes while trying new things",
		["growth","achievement","expert"]],
//],"solidarity":[
//init - what starts the process?
	["talked to people about what is important",
	 "would not hold a meaningful conversation",
		["solidarity","initiative","familiar"]],
	["started acting as an example, so others would follow",
	 "waited for others to demand action before acting",
		["solidarity","initiative","independent"]],
	["connected with and inspired people to be their best-selves",
	 "avoided social investment and discussion with others",
		["solidarity","initiative","expert"]],
//plan - what shapes the process?
	["found a way to participate as a member of a group",
	 "refused goals that did not serve them exactly",
		["solidarity","planning","familiar"]],
	["recognized and helped organize people suited for roles",
	 "gossiped or stereotyped",
		["solidarity","planning","independent"]],
	["delegated and empowered others to plan for the group",
	 "micromanaged or intimidated",
		["solidarity","planning","expert"]],
//doing - how does the process get done?
	["found guides to help them get their independent work done",
	 "was counter-productive to other problem solvers",
		["solidarity","doing","familiar"]],
	["gave tutorials or examples showing how to do things",
	 "didn't share helpful knowledge",
		["solidarity","doing","independent"]],
	["guided others to their independent success, at cost to self",
	 "sabatoged others to maintain power",
		["solidarity","doing","expert"]],
//testing - how do you check if the process was a success?
	["explained expectations to others",
	 "assumed everyone thinks the same thing",
		["solidarity","testing","familiar"]],
	["kept others accountable to their commitments",
	 "distracted others from their commitments",
		["solidarity","testing","independent"]],
	["held everyone accountable to future generations",
	 "failed to consider consequences to future communities",
		["solidarity","testing","expert"]],
//review - a response once test results are in?
	["assisted others in brainstorming and problem solving", // TODO plan?
	 "demanded or threatened to get their way",
		["solidarity","review","familiar"]],
	["shared resources, with fairness and justice in mind",
	 "lied or self-victimized for favors or personal gain",
		["solidarity","review","independent"]],
	["gave away ownership so others would better understand results",
	 "resisted or denied peoples' input for their own ego",
		["solidarity","review","expert"]],
//goal - what was the point of all of this?
	["successfully participated in working with or for other people",
	 "avoided trustworthy people who needed or wanted-to help",
		["solidarity","achievement","familiar"]],
	["created value for others, even including opponents",
	 "hoarded value by using \'with us\' and \'against us\'",
		["solidarity","achievement","independent"]],
	["improved a future environment beyond their community",
	 "ignored or denied impacts of actions they participated in",
		["solidarity","achievement","expert"]],
//],
];