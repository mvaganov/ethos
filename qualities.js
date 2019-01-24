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
	"craft": {
		description: "demonstrated capacity to create or perform",
		icon:"icons/working.png",
		color:"#0000ff",
		avatar:["Amadeus Mozart","Nikola Tesla"],
		philisophicalContext:{
			big5:"conscientiousness",aristotle:"pronesis - skill",
		},
		tooMuch:["obsession","compulsion","perfectionism"],
		tooLittle:["laziness","counter productivity","wastefulness"],
		justRight:["productivity","skill"],
	},
	"understanding": {
		description:"ability to predict through recognition of patterns", 
		icon:"icons/understanding.png",
		color:"#00ffff",
		avatar:["Sherlock Holmes","Socrates"],
		philisophicalContext:{
			big5:"stable neuroticism",aristotle:"pronesis - wisdom",
		},
		tooMuch:["neuroticism","paranoia","nihilism"],
		tooLittle:["ignorance","prejudice","fear","foolishness"],
		justRight:["thoughtfulness","problem-solving","knowledge"],
	},
	"empathy": {
		description:"recognition and shared-experience of peoples' feelings",
		icon:"icons/empathy.png",
		color:"#ff0000",
		avatar:["Dalai Lama","Pope Francis"],
		philisophicalContext:{
			big5:"agreeableness",aristotle:"eunoia - self awareness",
		},
		tooMuch:["social impotence","paralysis","guilt"],
		tooLittle:["hatred","greed","prejudice","fear"],
		justRight:["love","kindness","humility"],
	},
	"community": {
		description:"communication-with and organization-of people",
		icon:"icons/community.png",
		color:"#ffff00",
		avatar:["Abe Lincoln", "George Washington"],
		philisophicalContext:{
			big5:"extraversion",aristotle:"eunoia - audience awareness",
		},
		tooMuch:["tyranny","arrogance"],
		tooLittle:["depression","disconnection","lack of support","isolation"],
		justRight:["connectedness","communication"],
	},
	"growth": {
		description:"evolution through trial and error",
		icon:"icons/growth.png",
		color:"#00ff00",
		avatar:["Tony Robbins", "Sal Khan"],
		philisophicalContext:{
			big5:"openness to experience",aristotle:"arete - goodwill",
		},
		tooMuch:["hedonism","chaos","addiction"],
		tooLittle:["boredom","retardation","gullibility","immaturity","slavery","avoidance"],
		justRight:["creativity", "persistence"],
	},
	"faithfulness": {
		description:"willingness to expect a future that is unsupported by facts in the present",
		icon:"icons/faith.png",
		color:"#ff00ff",
		related:"hope, faith, expectation, confidence, trust, discipline, assurance, obedience, repentence",
		avatar:["the centurion","Ghandi"],
		philisophicalContext:{
			big5:"conscientiousness",aristotle:"arete - virtue",
		},
		tooMuch:["magical thinking","slavery","conspiracy-theory-ism"],
		tooLittle:["nihilism","greed","hedonism","foolishness"],
		justRight:["purity","cleanliness","morality"]
	},
	"initiative": {
		description:"what starts a person working on a project?",
		icon:"icons/initiative.png",
		color:"#ff0000",
	},
	"planning": {
		description:"what shaped a project?",
		icon:"icons/planning.png",
		color:"#00ffff",
	},
	"doing": {
		description:"how effort applied to get a project done?",
		icon:"icons/implementation.png",
		color:"#0000ff",
	},
	"test": {
		description:"how is the project tested for success?",
		icon:"icons/test.png",
		color:"#ff00ff",
	},
	"judgement": {
		description:"how are results of the project considered?",
		icon:"icons/judgement.png",
		color:"#00ff00",
	},
	"achievement": {
		description:"what are the goals of a project?",
		icon:"icons/achieve.png",
		color:"#ffff00",
	},

	"familiar": {
		description:"Reactive, easy to recognize with superficial tests or observation.",
		icon:"icons/tier1.png",
		color:"#ffffff",
	},
	"independent": {
		description:"Pro-active, require thoughtful observation to test.",
		icon:"icons/tier2.png",
		color:"#888888",
	},
	"expert": {
		description:"Can be very hard to evaluate with certainty. Clear examples of this indicate leadership, demand recognition, and encourage personal introspection",
		icon:"icons/tier3.png",
		color:"#444444",
	},
};

/* all submissions have an e-mail identifier and text box for providing rational: 
	endorse/denounce category
	endorse/denounce evaluation-pair
	suggest new pair, with Ptext, Ntext, and Categories
	suggest replacing pair Ptext, Ntext, or Categories
	suggest new category, including description, related list, and opposed list
*/

var allCategoryListing = [
	["growth","understanding","empathy","community","craft","faithfulness"],
	["initiative","planning","doing","test","judgement","achievement"],
	["familiar","independent","expert"],
];

var defaultCategoryListing = [
	["growth","understanding","empathy","community","craft","faithfulness"],
	["initiative","planning","doing","test","judgement","achievement"],
	["familiar"],
];
var fastCategoryListing = [
	[],
	[],
	["familiar","independent","expert"],
];

var colorForCategory = function(scope, name) {
	return DB_valueCategory[name].color;
}

// Converts a #ffffff hex string into an [r,g,b] array
var h2r = function(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? [
		parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)
	] : null;
};

// Inverse of the above
var r2h = function(rgb) {
	return "#" + ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1);
};

// Interpolates two [r,g,b] colors and returns an [r,g,b] of the result
// Taken from the awesome ROT.js roguelike dev library at
// https://github.com/ondras/rot.js
var _interpolateColor = function(color1, color2, factor) {
	if (arguments.length < 3) { factor = 0.5; }
	var result = color1.slice();
	for (var i=0;i<3;i++) {
		result[i] = Math.round(result[i] + factor*(color2[i]-color1[i]));
	}
	return result;
};

// TODO
var colorForListing = function(scope, listing) {
	// pick-apart the RGB values
	var rgb = [];
	for(var i = 0; i < listing.length; ++i) {
		var colorString = colorForCategory(scope, listing[i]);
		rgb[i] = h2r(colorString);
	}
	// average the colors
	var avg = [0,0,0];
	for(var c = 0; c < avg.length; ++c) {
		for(var i = 0; i < rgb.length; ++i) {
			avg[c] += rgb[i][c];
		}
		avg[c] /= rgb.length;
		avg[c] = (avg[c]) | 0; // force number to integer
	}
	return r2h(avg);
}

var iconForListing = function(scope, name, style, iconHeight = undefined) {
	var output = "";
	var img = DB_valueCategory[name].icon;
	if(img) { output += "<img src='"+img+"'";
		if(style) { output += " style='"+style+"'"; }
		if(iconHeight != undefined) { output += " height="+iconHeight; }
		output += " alt='"+name+"'>";
	}
	return output;
}

var iconsForListing = function(scope, listing, iconHeight=32) {
	var output = "";
	if(listing && listing.length && listing.length > 0) {
		for(var i = 0; i < listing.length; ++i) {
			output += iconForListing(scope, listing[i], null, iconHeight);
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
	["examined themselves, with meditation or journaling",
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
	 "avoided new experiences, even despite evidence of benefits",
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
	["was motivated consistently, by passion, purpose, or vision",
	 "lost motivation and never renewed it",
		["understanding","initiative","expert"]],
//plan - what shapes the process?
	["wrote-down-lists-of (or remembered) ideas to consider later",
	 "assumed their ideas were complete and didn't follow up on them",
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
	["improved knowledge in a way that simplifed problems",
	 "over-complicated things",
		["understanding","doing","expert"]],
//test - how do you check if the process was a success?
	["had expectations that could be tested",
	 "acted without expectations",
		["understanding","test","familiar"]],
	["validated understanding with experiments and data",
	 "avoided thinking hard or recognizing results",
		["understanding","test","independent"]],
	["improved knowledge with good questions that expose ignorance",
	 "accepted unproven mental-models",
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
	["exposed new questions after a confident display of mastery",
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
	 "was self-focused, ignored others' needs",
		["empathy","planning","familiar"]],
	["asked mirroring (do you mean?) questions to understand others",
	 "dismissed other people without listening",
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
	["radically reframed their perspective to understand results",
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
	 "claimed glory or redirected blame (sore winner/loser)",
		["empathy","achievement","familiar"]],
	["supported others, even despite personal disagreement",
	 "didn't respect people who weren't \'useful\'",
		["empathy","achievement","independent"]],
	["enjoyed others' success as-much-as or more-than their own",
	 "claimed others' credit as their own",
		["empathy","achievement","expert"]],
//],"community":[
//init - what starts the process?
	["talked to people about what is important",
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
	["delegated and empowered others to plan for the group",
	 "micromanaged or intimidated",
		["community","planning","expert"]],
//doing - how does the process get done?
	["found guides to help them get their independent work done",
	 "was counter-productive to other problem solvers",
		["community","doing","familiar"]],
	["gave tutorials or examples showing how to do things",
	 "didn't share helpful knowledge",
		["community","doing","independent"]],
	["guided others to their independent success, at cost to self",
	 "sabatoged others to maintain power",
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
	["gave away ownership to share resources and results",
	 "resisted or denied peoples' input for their own ego",
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
	["adopted traditional approaches and best practices",
	 "avoided trandition and did not learn best practices",
		["faithfulness","planning","familiar"]],
	["obeyed best-practices even in times of hardship",
	 "picked-and-chose only the easy options, to minimize effort",
		["faithfulness","planning","independent"]],
	["gave up their own desires to achieve their values",
	 "ignored adressing problems while pursing desires",
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
//test - how do you check if the process was a success?
	["held themselves and others to a moral standard",
	 "exempted some people from moral standards",
		["faithfulness","test","familiar"]],
	["held systems accountable to moral standards",
	 "accepted immorality in cultures, laws, or machines",
		["faithfulness","test","independent"]],
	["accepted harsh judgement on behalf of others",
	 "made corrupt deals to avoid persecution or prosecution",
		["faithfulness","test","expert"]],
//judgement - how to respond once test results are in?
	["made and supported decisions with their own values",
	 "ignored their own values when it was convenient",
		["faithfulness","judgement","familiar"]],
	["repented and/or humbly-reconciled with others",
	 "held grudges or chose to make enemies",
		["faithfulness","judgement","independent"]],
	["made tough choices requiring significant self-sacrifice",
	 "avoided tough choices, hoping someone else would do it",
		["faithfulness","judgement","expert"]],
//goal - what was the point of all of this?
	["succeeded in acting according to their own values",
	 "was undisciplined, a hypocrite, or a liar",
		["faithfulness","achievement","familiar"]],
	["acted virtuously and blamelessly in success and failure",
	 "accused others to justify their own failures",
		["faithfulness","achievement","independent"]],
	["became a light in a dark place, inspiring hope to others",
	 "exploited others' ignorance",
		["faithfulness","achievement","expert"]],
//],
];