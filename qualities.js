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
	"community": {
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
		philisophicalContext:{
			expectationStates:"performance expectations"
		}
	},
	"planning": {
		description:"what shaped a project?",
		icon:"icons/plan.png",
		color:"#00ffff",
		iconStyle:"filter: invert(1) brightness(50%) sepia(200%) saturate(10000%) hue-rotate(180deg) brightness(300%);",
		philisophicalContext:{
			expectationStates:"identify action opportunity"
		}
	},
	"doing": {
		description:"how effort applied to get a project done?",
		icon:"icons/implement.png",
		color:"#0000ff",
		iconStyle:"filter: invert(1) brightness(50%) sepia(200%) saturate(10000%) hue-rotate(240deg)",
		philisophicalContext:{
			expectationStates:"performance output"
		}
	},
	"testing": {
		description:"how is the project tested for success?",
		icon:"icons/test.png",
		color:"#ff00ff",
		iconStyle:"filter: invert(1) brightness(50%) sepia(200%) saturate(10000%) hue-rotate(300deg)",
		philisophicalContext:{
			expectationStates:"unit evaluations"
		}
	},
	"review": {
		description:"how are results of the project considered?",
		icon:"icons/judgement.png",
		color:"#00ff00",
		iconStyle:"filter: invert(1) brightness(50%) sepia(200%) saturate(10000%) hue-rotate(120deg) brightness(300%);",
		philisophicalContext:{
			expectationStates:"agreement/disagreement resolution -> influence and expectaitons"
		}
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
	["empathy","knowledge","craft","faithfulness","growth","community"],
	["initiative","planning","doing","testing","review","achievement"],
	["familiar","independent","expert"],
];

var defaultCategoryListing = [
	["empathy","knowledge","craft","faithfulness","growth","community"],
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
	["listened to how someone (even self) struggles, to help them",
	 "ignored or denied someone's suffering",
		["empathy","initiative","independent"]],
	["searched-for and aligned-with people in need",
	 "made excuses-for or greedily-allowed others' suffering",
		["empathy","initiative","expert"]],
//plan - what shapes the process?
	["planned to address the needs and requests of others",
	 "was short-term and self-focused, ignored others' needs",
		["empathy","planning","familiar"]],
	["asked mirroring (do you mean?) questions to understand others",
	 "dismissed other people without listening",
		["empathy","planning","independent"]],
	["empowering people closest to problems to discovered real needs",
	 "make your own choices and pacify actual stakeholders",
		["empathy","planning","expert"]],
//doing - how does the process get done?
	["acted and spoke politely and honestly",
	 "was rude, exaggerated, or withheld needed information",
		["empathy","doing","familiar"]],
	["communicated and acted to improve others' feelings",
	 "was inconsiderate of other's feelings",
		["empathy","doing","independent"]],
	["encouraged others with good words, even while being critical",
	 "acted or said things thoughtlessly, or in discouraging ways",
		["empathy","doing","expert"]],
//testing - how do you check if the process was a success? how to get datapoints?
	["listened-to feedback from others, even critical feedback",
	 "avoided or ignored feedback, except for praise",
		["empathy","testing","familiar"]],
	["accept and repeat feedback from others, validating them",
	 "dismissed, insulted, or intimidated critics defensively",
		["empathy","testing","independent"]],
	["empathized: saw from their perspective, felt what they felt",
	 "confined themselves, or others, with stereotypes or labels",
		["empathy","testing","expert"]],
//review - a response once test results are in?
	["accepted others criticism, circumstance, and opinion as valid",
	 "reduced people to their results, denying their complexity",
		["empathy","review","familiar"]],
	["recognized others with compassion and patience",
	 "divided people competitively, holding grudges",
		["empathy","review","independent"]],
	["validated others as being just-as or more important than self",
	 "ignored others value and claimed others' credit as their own",
		["empathy","review","expert"]],
//goal - what was the point of all of this?
	["recognized others results, even despite personal disagreement",
	 "ignored or disrespected others' results",
		["empathy","achievement","familiar"]],
	["acknowleded results with praise, gratitude, and appreciation",
	 "claimed glory or redirected blame (sore winner/loser)",
		["empathy","achievement","independent"]],
	["created a safe space for truth and reconciliation to emerge",
	 "accepted unfair treatment of people",
		["empathy","achievement","expert"]],
//],"knowledge":[
//init - what starts the process?
	["questioned things out of curiosity",
	 "only did as directed by authority",
		["knowledge","initiative","familiar"]],
	["brainstormed, researched, or looked-for-inspiration",
	 "avoided thinking about problems or solutions",
		["knowledge","initiative","independent"]],
	["was motivated with purpose and vision",
	 "lost motivation and never renewed it",
		["knowledge","initiative","expert"]],
//plan - what shapes the process?
	["wrote-down-lists-of (or remembered) ideas to consider later",
	 "assumed their ideas were complete and didn't follow up on them",
		["knowledge","planning","familiar"]],
	["planned for risks and coordinated for success",
	 "forgot commitments, oblivious to circumstance, ignored risks",
		["knowledge","planning","independent"]],
	["made predictions with detail-oriented analysis",
	 "ignored details and avoided verifying assumptions",
		["knowledge","planning","expert"]],
//doing - how does the process get done?
	["accepted truth and facts based on evidence",
	 "decided to believe something despite evidence against it",
		["knowledge","doing","familiar"]],
	["focused on truth, facts, and evidence to make decisions",
	 "promoted untruth, or used unprovable opinions as fact",
		["knowledge","doing","independent"]],
	["was focused and engaged by learning and problem solving",
	 "was bored and constantly distracted, unable to concentrate",
		["knowledge","doing","expert"]],
//testing - how do you check if the process was a success?
	["had expectations that could be tested",
	 "acted without expectations",
		["knowledge","testing","familiar"]],
	["validated understanding with experiments and data",
	 "plagarized, took credit for work without understanding it",
		["knowledge","testing","independent"]],
	["improved knowledge with good questions that expose ignorance",
	 "accepted unproven mental-models, gave value to ignorance",
		["knowledge","testing","expert"]],
//review - a response once test results are in?
	["considered cause-and-effect, shared observations",
	 "reacted impulsively, without examining consequences",
		["knowledge","review","familiar"]],
	["used different perspectives to discover new solutions",
	 "discounted, disbelieved, or feared unconventional ideas",
		["knowledge","review","independent"]],
	["organized & simplified problems with patterns in the details",
	 "let every problem be unique and hard to fix",
		["knowledge","review","expert"]],
//goal - what was the point of all of this?
	["developed knowledge to solve problems",
	 "avoided the mental-effort of learning and problem solving",
		["knowledge","achievement","familiar"]],
	["understood and explained things beyond requirements",
	 "argued for recognition or acceptance without understanding",
		["knowledge","achievement","independent"]],
	["identified new questions after finding answers",
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
	["was inspired to surpass requirements, for love-of-craft",
	 "avoided working without immediate benefits",
		["craft","initiative","expert"]],
//plan - what shapes the process?
	["followed directions or examples",
	 "couldn't follow directions or copy an example",
		["craft","planning","familiar"]],
	["set their own acheivable goals without instructions",
	 "didn't seriously plan for their achievement",
		["craft","planning","independent"]],
	["left room in their plan to do more than was expected",
	 "never expected to apply effort beyond expectations",
		["craft","planning","expert"]],
//doing - how does the process get done?
	["practiced skills and focused on work to get results",
	 "neglected work and looked for distractions",
		["craft","doing","familiar"]],
	["worked with good technique and safety",
	 "ignored best-practices and/or safety",
		["craft","doing","independent"]],
	["made difficult work look easy, because of committed practice",
	 "was distracted by fear of failure or limitations",
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
	["held self accountable to a finer precision than peers",
	 "used shortcuts and accepted a loss in quality",
		["craft","review","expert"]],
//goal - what was the point of all of this?
	["created or improved a specific thing",
	 "left a mess to clean up",
		["craft","achievement","familiar"]],
	["performed well, with notable quality",
	 "neglected the quality of their work",
		["craft","achievement","independent"]],
	["achieved an elegant quality of work transcending expectations",
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
	 "didn't expect lessons from the past to apply to the present",
		["faithfulness","planning","familiar"]],
	["made sure they planned to finish what is most important",
	 "only expected to do 'the fun part'",
		["faithfulness","planning","independent"]],
	["sacrificed their own desires to achieve their stated values",
	 "pursued their desires, at great cost to themselves or others",
		["faithfulness","planning","expert"]],
//doing - how does the process get done?
	["knew what the right thing to do was, and tried to do it",
	 "decided not to do the right thing",
		["faithfulness","doing","familiar"]],
	["kept themselves honest and clean, consistent with values",
	 "cut corners wherever possible",
		["faithfulness","doing","independent"]],
	["did unglamourous work enviably, with poise and confidence",
	 "only worked on high-profile or glamourous jobs",
		["faithfulness","doing","expert"]],
//testing - how do you check if the process was a success?
	["used fair standards to judge others and themselves",
	 "picked-and-chose the easy options, to minimize effort",
		["faithfulness","testing","familiar"]],
	["used the highest standards that a majority can agree on",
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
	["accepted (even harsh) judgement on principle, or others behalf",
	 "made deals to avoid persecution or prosecution",
		["faithfulness","review","expert"]],
//goal - what was the point of all of this?
	["kept promises and acted according to their own values",
	 "was undisciplined, a hypocrite, a liar, or a betrayer",
		["faithfulness","achievement","familiar"]],
	["acted virtuously and blamelessly in success and failure",
	 "accused others to justify their own failures",
		["faithfulness","achievement","independent"]],
	["shined as a light in a dark place, inspiring hope to others",
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
	["changed their habits to attain ambitious goals",
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
	["tried to solve problems right as they were discovered up",
	 "let problems grow in size",
		["growth","testing","independent"]],
	["thoughtfully examined ugly details that could show problems",
	 "confined their own problem-solving with labels or assumptions",
		["growth","testing","expert"]],
//review - a response once test results are in?
	["learned from mistakes, fixed them, and kept going",
	 "suffered with anxiety and avoided effort after difficulty",
		["growth","review","familiar"]],
	["redeveloped goals after finding setbacks or opportunities",
	 "ignored or deceived-others-about reality to justify mistakes",
		["growth","review","independent"]],
	["reprioritized or pivoted to achieve new opportunities",
	 "held on to counter-productive habits, stereotypes, and ideas",
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
//],"community":[
//init - what starts the process?
	["talked to people about what is important",
	 "would not hold a meaningful conversation",
		["community","initiative","familiar"]],
	["started acting as an example, so others would follow",
	 "waited for others to demand action before acting",
		["community","initiative","independent"]],
	["connected with and inspired people to be their best-selves",
	 "labeled people to 'put them in their place'",
		["community","initiative","expert"]],
//plan - what shapes the process?
	["found or asked-for (and took) opportunities to participate",
	 "avoided or rejected goals that did not serve them exactly",
		["community","planning","familiar"]],
	["recognized or suggested roles to organize people",
	 "gossiped or stereotyped",
		["community","planning","independent"]],
	["delegated and prepared others to succeed without you",
	 "held on to power, and micromanaged or intimidated",
		["community","planning","expert"]],
//doing - how does the process get done?
	["participated in a group's common culture, working with them",
	 "witheld help or was counter-productive to others",
		["community","doing","familiar"]],
	["communicated plans and common goals to reduce confusion",
	 "antagonized people with harsh words or passive-aggression",
		["community","doing","independent"]],
	["taught others and worked with feedback to develop consensus",
	 "sabatoged or denied others to maintain power or status",
		["community","doing","expert"]],
//testing - how do you check if the process was a success?
	["explained expectation, agreement, and disagreement to others",
	 "assumed everyone thinks the same thing",
		["community","testing","familiar"]],
	["kept others accountable to their commitments",
	 "distracted others from their commitments",
		["community","testing","independent"]],
	["held self and others accountable to future generations",
	 "failed to consider consequences to others",
		["community","testing","expert"]],
//review - a response once test results are in?
	["shared feedback with others to develop common understanding",
	 "lied or self-victimized for favors or personal gain",
		["community","review","familiar"]],
	["shared resources, with fairness and justice in mind",
	 "demanded or threatened, to try to get their way",
		["community","review","independent"]],
	["gave ownership to the under-representated to fortify engagement",
	 "resisted others' input, for the sake of their own ego",
		["community","review","expert"]],
//goal - what was the point of all of this?
	["successfully participated in working with or for other people",
	 "avoided trustworthy people who needed or wanted-to help",
		["community","achievement","familiar"]],
	["celebrated the success and values of other people",
	 "ignored communal success or emphasized divisive values",
		["community","achievement","independent"]],
	["created culture by celebrating and embodying values",
	 "weakened culture by distracting people from what's important",
		["community","achievement","expert"]],
//],
];