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
attribute
	craft: blue
	understanding: cyan
	empathy: red
	community: yellow
	growth: green
	????: magenta
projectLifeCycle:
	init: red
	plan: magenta
	doing: blue
	test: green
	judgement: cyan
	goal: yellow
maturity
	familiar: dark gray
	independent: light gray
	expert: white
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
*/
var DB_valueCategory = {
	"craft": {
		description: "demonstrated capacity to create or perform",
		related:["productivity","skill"],
		opposed:["wastefulness","ignorance"],
		avatar:["every master crafts-person"]
	},
	"understanding": {
		description:"ability to predict through recognition of patterns", 
		related:["thinking","thoughtfulness","problem-solving","learning"],
		opposed:["ignorance","prejudice"],
		avatar:["Sherlock Holmes"]
	},
	"empathy": {
		description:"recognition and shared-experience of peoples' feelings",
		related:["love","thoughtfulness","kindness","humility"],
		opposed:["hate","prejudice","arrogance"],
		avatar:["Dalai Lama"]
	},
	"community": {
		description:"communication-with and organization-of people",
		related:["community","empathy","communication"],
		opposed:["slavery","isolation"],
		avatar:["Abe Lincoln"]
	},
	"growth": {
		description:"evolution through trial and error",
		related:["creativity", "persistence"],
		opposed:["avoidance","compulsion","addiction"],
		avatar:["Tony Robbins"]
	},
	"initiative": {
//init - what starts the project?
//plan - what shapes the project?
//doing - how does the project get done?
//test - how do you check if the project was a success?
//judgement - how to respond once test results are in?
//goal - what was the point of all of the project?
		description:"what starts a person working on a project?",
		related:["motivation","faith","vision"],
		opposed:["laziness"],
	},
	"planning": {
		description:"what shaped a project?",
	},
	"doing": {
		description:"how effort applied to get a project done?",
	},
	"test": {
		description:"how is the project tested for success?",
	},
	"judgement": {
		description:"how are results of the project considered?",
	},
	"achievement": {
		description:"what are the goals of a project?",
	},

	"familiar": {
		description:"reactive, easy to recognize with superficial tests",
	},
	"independent": {
		description:"pro-active, require thoughtful observation to test",
	},
	"expert": {
		description:"clear examples of this demand recognition and encourage personal introspection",
	},
};

/* all submissions have an e-mail identifier and text box for providing rational: 
	endorse/denounce category
	endorse/denounce evaluation-pair
	downvote category
	downvote evaluation-pair
	suggest new pair, with Ptext, Ntext, and Categories
	suggest replacing pair Ptext, Ntext, or Categories
	suggest new category, including description, related list, and opposed list
*/

var allCategoryListing = [
	["growth","understanding","empathy","community","craft"],
	["initiative","planning","doing","test","judgement","achievement"],
	["familiar","independent","expert"],
];
var allCategoryIcons = {
	growth:"icons/growth.png",
	understanding:"icons/understanding.png",
	empathy:"icons/empathy.png",
	community:"icons/community.png",
	craft:"icons/working.png",
	initiative:"icons/initiative.png",
	planning:"icons/planning.png",
	doing:"icons/implementation.png",
	test:"icons/test.png",
	judgement:"icons/judgement.png",
	achievement:"icons/achieve.png",
	familiar:"icons/tier1.png",
	independent:"icons/tier2.png",
	expert:"icons/tier3.png"
};
var defaultCategoryListing = [
	["growth","understanding","empathy","community","craft"],
	["initiative","planning","doing","test","judgement","achievement"],
	["familiar"],
];
var fastCategoryListing = [
	[],
	[],
	["familiar","independent","expert"],
];

var iconsForListing = function(scope, listing, iconHeight=32) {
	var output = "";
	if(listing && listing.length && listing.length > 0) {
		for(var i = 0; i < listing.length; ++i) {
			var img = allCategoryIcons[listing[i]];
			if(img) { output += "<img src='"+img+"' height="+iconHeight+" alt='"+listing[i]+"'>"; }
		}
	}
	return output;
}
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
//"growth":[
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
//test - how do you check if the process was a success?
	["identified and admitted problems",
	 "hid or denied their problems",
		["growth","test","familiar"]],
	["tried to solve problems right as they showed up",
	 "let problems grow in size",
		["growth","test","independent"]],
	["examined themselves, with meditation or journaling", // TODO
	 "confined themselves, with stereotypes or labels",
		["growth","test","expert"]],
//judgement - how to respond once test results are in?
	["learned from mistakes, planned to fix them, and kept going",
	 "justified mistakes, avoided effort after difficulty",
		["growth","judgement","familiar"]],
	["redeveloped goals after finding setbacks or limitations",
	 "ignored reality of results and deceived others",
		["growth","judgement","independent"]],
	["found long-term value even in failure or loss",
	 "vengefully brooded over pain from failure or loss",
		["growth","judgement","expert"]],
//goal - what was the point of all of this?
	["improved themselves with new experiences",
	 "avoided new experiences",
		["growth","achievement","familiar"]],
	["acknowledged others' help and took ownership of failures",
	 "took-credit-for and blamed-failure-on other circumstances",
		["growth","achievement","independent"]],
	["acheived rare or new things",
	 "was unwilling to make mistakes while trying new things",
		["growth","achievement","expert"]],
//],"understanding":[
//init - what starts the process?
	["questioned things out of curiosity",
	 "only did as directed by authority",
		["understanding","initiative","familiar"]],
	["brainstormed, researched, or looked-for-inspiration",
	 "plagarized, took credit for work without understanding it",
		["understanding","initiative","independent"]],
	["was motivated consistently, by passion or purpose",
	 "lost motivation and never renewed it",
		["understanding","initiative","expert"]],
//plan - what shapes the process?
	["wrote ideas down as lists to do or notes consider",
	 "assumed their idea was complete and didn't write it out",
		["understanding","planning","familiar"]],
	["prepared for risks and coordinated for success",
	 "forgot commitments, ignored risks",
		["understanding","planning","independent"]],
	["made accurate predictions with detail-oriented analysis",
	 "ignored details and avoided verifying assumptions",
		["understanding","planning","expert"]],
//doing - how does the process get done?
	["shared truth and used facts to make decisions",
	 "promoted untruth, or used opinions as fact",
		["understanding","doing","familiar"]],
	["was engaged by problem solving and learning",
	 "was bored and constantly distracted",
		["understanding","doing","independent"]],
	["validated knowledge in a way that simplifed problems",
	 "over-complicated things",
		["understanding","doing","expert"]],
//test - how do you check if the process was a success?
	["had expectations that could be tested",
	 "acted without expectations",
		["understanding","test","familiar"]],
	["validated understanding with experiments and data",
	 "avoided thinking hard or recognizing results",
		["understanding","test","independent"]],
	["improved public knowledge with experience",
	 "accepted unproven mental-models", // TODO
		["understanding","test","expert"]],
//judgement - how to respond once test results are in?
	["considered cause and effect",
	 "reacted impulsively, without examining consequences",
		["understanding","judgement","familiar"]],
	["found patterns in problems to organize and simplify them",
	 "let every problem be unique and hard to fix",
		   ["understanding","judgement","independent"]],
	["used outside-the-box perspectives to discover new solutions",
	 "discounted, disbelieved, or feared unconventional ideas",
		["understanding","judgement","expert"]],
//goal - what was the point of all of this?
	["developed knowledge to solve problems",
	 "avoided the mental-effort of learning and problem solving",
		["understanding","achievement","familiar"]],
	["understood and explained things beyond requirements",
	 "argued for recognition without understanding",
		["understanding","achievement","independent"]],
	["realized confidence from a repeated sense of mastery",
	 "was content to \'get lucky\' and not find out why",
		["understanding","achievement","expert"]],
//],"empathy":[
//init - what starts the process?
	["offered-help or accepted-help",
	 "let others (or self) suffer alone, despite help nearby",
		["empathy","initiative","familiar"]],
	["listened for how others struggle, to help them",
	 "ignored or justified others' suffering",
		["empathy","initiative","independent"]],
	["searched-for and planned to help the hopeless",
	 "made excuses-for or greedily-allowed others' suffering",
		["empathy","initiative","expert"]],
//plan - what shapes the process?
	["planned to address the needs and requests of others",
	 "dismissed other people without listening",
		["empathy","planning","familiar"]],
	["asked mirroring (do you mean?) questions to understand others",
	 "was self-focused, ignored others' needs",
		["empathy","planning","independent"]],
	["uncovered real needs by trusting and empowering others",
	 "deceived others to pacify them",
		["empathy","planning","expert"]],
//doing - how does the process get done?
	["acted fairly, responsibly, politely, and honestly",
	 "was rude, exaggerated, or withheld information",
		["empathy","doing","familiar"]],
	["communicated and acted to improve others' feelings",
	 "was inconsiderate of other's feelings",
		["empathy","doing","independent"]],
	["encouraged others even while being critical",
	 "acted or said things in discouraging ways",
		["empathy","doing","expert"]],
//test - how do you check if the process was a success? how to get datapoints?
	["listened-to feedback from others, even critical feedback",
	 "avoided or ignored feedback, except for praise",
		["empathy","test","familiar"]],
	["empathized with feedback from others, validating them",
	 "dismissed, insulted, or intimidated critics defensively",
		["empathy","test","independent"]],
	["radically examined results, with intentional reflection",
	 "confined themselves, or others, with stereotypes or labels",
		["empathy","test","expert"]],
//judgement - how to respond once test results are in?
	["applied consistent standards to themselves and everyone",
	 "judged others based on favors instead of objective quality",
		["empathy","judgement","familiar"]],
	["recognized others' circustances, with compassion and patience",
	 "reduced people to their results, ignoring circumstances",
		["empathy","judgement","independent"]],
	["reworked systems to create safe spaces for others",
	 "accepted or encouraged exploitative or unfair systems",
		["empathy","judgement","expert"]],
//goal - what was the point of all of this?
	["acknowleded results with gratitude and appreciation",
	 "claimed glory or accused blame (sore winner/loser)",
		["empathy","achievement","familiar"]],
	["supported others, even despite personal disagreement",
	 "didn't respect people who weren't \'useful\'",
		["empathy","achievement","independent"]],
	["enjoyed others' success as-much-as or more-than their own",
	 "claimed others' credit as their own",
		["empathy","achievement","expert"]],
//],"community":[
//init - what starts the process?
	["talked about what is important to people",
	 "would not hold a meaningful conversation",
		["community","initiative","familiar"]],
	["started acting as an example, so others would follow",
	 "waited for others to demand action before acting",
		["community","initiative","independent"]],
	["connected with and inspired people to be their best-selves",
	 "avoided social investment and discussion with others",
		["community","initiative","expert"]],
//plan - what shapes the process?
	["found a way to participate as a member of a group",
	 "refused goals that did not serve them exactly",
		["community","planning","familiar"]],
	["recognized and helped organize people suited for roles",
	 "gossiped or stereotyped",
		["community","planning","independent"]],
	["delegated and empowered others to plan for themselves",
	 "micromanaged or intimidated",
		["community","planning","expert"]],
//doing - how does the process get done?
	["found guides to help them get their independent work done",
	 "was counter-productive to other problem solvers",
		["community","doing","familiar"]],
	["gave tutorials or examples showing how to do things",
	 "didn't share helpful knowledge",
		["community","doing","independent"]],
	["guided others toward their independent success",
	 "sabatoged others",
		["community","doing","expert"]],
//test - how do you check if the process was a success?
	["explained expectations to others",
	 "assumed everyone thinks the same thing",
		["community","test","familiar"]],
	["kept others accountable to their commitments",
	 "distracted others from their commitments",
		["community","test","independent"]],
	["held everyone accountable to future generations",
	 "failed to consider consequences to future communities",
		["community","test","expert"]],
//judgement - how to respond once test results are in?
	["assisted others in brainstorming and problem solving",
	 "demanded or threatened to get their way",
		["community","judgement","familiar"]],
	["shared resources, with fairness and justice in mind",
	 "lied or self-victimized for favors or personal gain",
		["community","judgement","independent"]],
	["encouraged shared ownership of resources and results",
	 "resisted or denied people's input for more attention",
		["community","judgement","expert"]],
//goal - what was the point of all of this?
	["promoted trust with kept-promises and participation",
	 "betrayed trust with laziness unkept-promises",
		["community","achievement","familiar"]],
	["brought value to outsiders, even to opponents",
	 "divided people, especially \'with us\' and \'against us\'",
		["community","achievement","independent"]],
	["improved the environment beyond their community",
	 "ignored or denied impacts of actions they participated in",
		["community","achievement","expert"]],
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
	["practiced skills and focused to get results",
	 "neglected work and looked for distractions",
		["craft","doing","familiar"]],
	["worked safely and/or with good technique",
	 "ignored best-practices and/or safety",
		["craft","doing","independent"]],
	["made very difficult work look easy, after practice",
	 "was distracted by failure and limitations",
		["craft","doing","expert"]],
//test - how do you check if the process was a success?
	["tested results properly to determine quality",
	 "gave people results without proper testing",
		["craft","test","familiar"]],
	["regularly tested to find faults early",
	 "didn't test often, hoping it \'just works\' at the end",
		["craft","test","independent"]],
	["tested rigorously with fine-grained and novel experiments",
	 "didn't consider inconsitent or new circumstances when testing",
		["craft","test","expert"]],
//judgement - how to respond once test results are in?
	["accepted guidance and advice when considering next steps",
	 "ignored others' guidance and advice",
		["craft","judgement","familiar"]],
	["found better outside sources for standards and techniques",
	 "didn't get second opinions or discover best-practices",
		["craft","judgement","independent"]],
	["held self accountable to a higher standard than anyone else",
	 "used shortcuts and accepted a loss in quality",
		["craft","judgement","expert"]],
//goal - what was the point of all of this?
	["improved specific things",
	 "left a mess to clean up",
		["craft","achievement","familiar"]],
	["performed well, with notable quality",
	 "neglected the quality of their work",
		["craft","achievement","independent"]],
	["achieved an elegant quality, transcending initial goals",
	 "was unable to get past \'good enough\'",
		["craft","achievement","expert"]],
//],
];