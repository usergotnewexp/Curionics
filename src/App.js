import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Compass, Lightbulb, Book, Users, Search, ChevronDown, Cpu, Zap, Radio, BarChart2, DollarSign, BrainCircuit, SlidersHorizontal, Sparkles, X, Wand2, Loader2, ServerCrash, Video, FileText, MessageSquare, Send, PlusCircle, ArrowLeft, Link as LinkIcon, ListChecks, Youtube, HardHat, TestTube2, Wrench, FileSignature } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, onSnapshot, serverTimestamp, orderBy, doc } from 'firebase/firestore';

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY || "demo-key",
  authDomain: process.env.REACT_APP_AUTH_DOMAIN || "demo-domain",
  projectId: process.env.REACT_APP_PROJECT_ID || "demo-project",
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET || "demo-bucket",
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID || "demo-sender",
  appId: process.env.REACT_APP_APP_ID || "demo-app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Databases ---
const projectDatabase = [
  // IoT
  { id: 1, title: 'Automated Plant Watering System', category: 'IoT', difficulty: 'Beginner', cost: '₹', description: 'A simple system using a soil moisture sensor to water plants automatically.' },
  { id: 2, title: 'Smart Weather Station', category: 'IoT', difficulty: 'Intermediate', cost: '₹₹', description: 'Build a device that collects local weather data and displays it on a web server.' },
  { id: 3, title: 'Home Security System with ESP32-CAM', category: 'IoT', difficulty: 'Intermediate', cost: '₹₹', description: 'A motion-activated camera that sends notifications to your phone.' },
  { id: 10, title: 'Network Ad-Blocker (Pi-hole)', category: 'IoT', difficulty: 'Beginner', cost: '₹', description: 'Use a Raspberry Pi to block ads on all devices on your home network.' },
  // Robotics
  { id: 11, title: 'Obstacle Avoiding Robot', category: 'Robotics', difficulty: 'Intermediate', cost: '₹₹', description: 'A wheeled robot that uses ultrasonic sensors to navigate a room without collisions.' },
  { id: 12, title: 'Line Following Robot', category: 'Robotics', difficulty: 'Beginner', cost: '₹₹', description: 'A classic robotics project where a robot follows a black line on a white surface.' },
  { id: 13, title: 'Self-Balancing Robot', category: 'Robotics', difficulty: 'Advanced', cost: '₹₹₹', description: 'Build a two-wheeled robot that balances itself using an IMU and PID controller.' },
  // Signal Processing
  { id: 21, title: 'Digital Signal Processing Audio Equalizer', category: 'Signal Processing', difficulty: 'Advanced', cost: '₹₹', description: 'Design and implement a real-time audio equalizer using a DSP board.' },
  { id: 22, title: 'Software Defined Radio (SDR)', category: 'Signal Processing', difficulty: 'Advanced', cost: '₹₹', description: 'Use an SDR dongle to receive and decode a wide range of radio signals (FM, ADS-B, etc.).' },
];

const videoDatabase = [
  // Basics
  { id: 201, title: 'A simple guide to electronic components.', channel: 'GreatScott!', videoId: 'QW4N2r6rdjo', category: 'Basics' },
  { id: 202, title: 'How a 555 Timer IC Works', channel: 'Ben Eater', videoId: 'kRlSFm519Bo', category: 'Basics' },
  { id: 203, title: 'Understanding Ohms Law', channel: 'ElectroBOOM', videoId: 'NtLL_jGUQcc', category: 'Basics' },
  { id: 204, title: 'Arduino vs Raspberry Pi', channel: 'ExplainingComputers', videoId: 'Kz4FSdS4E8Y', category: 'Arduino' },
  { id: 205, title: 'Getting Started with Arduino', channel: 'Paul McWhorter', videoId: 'fJWR7dBuc18', category: 'Arduino' },
];

const researchPapers = [
    { id: 701, title: "Deep Learning for MIMO Systems: A Survey", authors: "A. Alkhateeb, et al.", source: "arXiv", url: "https://arxiv.org/abs/1902.07718" },
    { id: 702, title: "A Tutorial on Deep Learning for Wireless Communications", authors: "T. O'Shea, J. Hoydis", source: "arXiv", url: "https://arxiv.org/abs/1702.00832" },
    { id: 703, title: "Internet of Things: A Survey", authors: "L. Atzori, A. Iera, G. Morabito", source: "Computer Networks", url: "https://www.sciencedirect.com/science/article/pii/S1389128610001568" },
];

const categoryIcons = {
  'IoT': <Compass size={18} />, 'Robotics': <Cpu size={18} />, 'Signal Processing': <BarChart2 size={18} />, 'Embedded Systems': <SlidersHorizontal size={18} />, 'Computer Vision': <Users size={18} />, 'Power Electronics': <Zap size={18} />, 'Communications': <Radio size={18} />, 'VLSI': <Cpu size={18} />, 'AI/ML': <BrainCircuit size={18} />, 'Electronics': <Lightbulb size={18} />, 'Default': <Lightbulb size={18} />
};

const callGeminiAPI = async (payload) => {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    
    if (!apiKey) {
        throw new Error("Gemini API key not configured. Please add REACT_APP_GEMINI_API_KEY to your .env file.");
    }
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    try {
        const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!response.ok) { throw new Error(`API call failed with status: ${response.status}`); }
        return await response.json();
    } catch (error) { console.error("Gemini API call error:", error); throw error; }
};

// --- Components ---
const Navbar = ({ setPage, setSelectedProject }) => (
  <nav className="bg-white/30 backdrop-blur-lg shadow-lg fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl mx-auto rounded-xl z-50">
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-20">
        <div className="flex items-center">
          <a href="#" onClick={() => { setPage('home'); setSelectedProject(null); }} className="flex-shrink-0 flex items-center gap-2 text-gray-800 hover:text-blue-600 transition-colors">
            <Sparkles size={32} className="text-purple-400" />
            <span className="font-bold text-2xl text-white">Curionics</span>
          </a>
        </div>
        <div className="hidden md:block">
          <div className="ml-10 flex items-center space-x-1 bg-white/20 p-1 rounded-full">
            <a href="#" onClick={() => { setPage('home'); setSelectedProject(null); }} className="text-white hover:bg-white/30 px-3 py-2 rounded-full text-sm font-medium">Home</a>
            <a href="#" onClick={() => { setPage('explorer'); setSelectedProject(null); }} className="text-white hover:bg-white/30 px-3 py-2 rounded-full text-sm font-medium">Explore Ideas</a>
            <a href="#" onClick={() => { setPage('about'); setSelectedProject(null); }} className="text-white hover:bg-white/30 px-3 py-2 rounded-full text-sm font-medium">About</a>
            <a href="#" onClick={() => { setPage('resources'); setSelectedProject(null); }} className="text-white hover:bg-white/30 px-3 py-2 rounded-full text-sm font-medium">Resources Hub</a>
            <a href="#" onClick={() => { setPage('community'); setSelectedProject(null); }} className="text-white hover:bg-white/30 px-3 py-2 rounded-full text-sm font-medium">Community</a>
          </div>
        </div>
      </div>
    </div>
  </nav>
);

const HomePage = ({ setPage }) => (
  <div className="relative h-screen w-full overflow-hidden">
    <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"></div>
        <div className="absolute inset-0 bg-black/40" aria-hidden="true"></div>
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>
    </div>
    <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-7xl">Ignite Your Curiosity</h1>
        <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-200">Your AI-powered companion for Electronics & Communication Engineering projects. From brilliant ideas to flawless execution, discover, plan, and build amazing projects with our intelligent guidance.</p>
        <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
            <button onClick={() => setPage('explorer')} className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 sm:px-10">
              Explore Project Ideas
            </button>
        </div>
    </div>
  </div>
);

const AboutPage = () => (
  <div className="bg-gray-900 min-h-screen pt-28 bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072')"}}>
    <div className="absolute inset-0 bg-black/80"></div>
    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-white sm:text-5xl">About Curionics</h1>
        <p className="mt-4 text-xl text-gray-300">Your AI-powered ECE project companion</p>
      </div>
      
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-8 text-white space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-4 text-purple-300">What is Curionics?</h2>
          <p className="text-gray-300 leading-relaxed">
            Curionics is an innovative, AI-powered platform designed specifically for Electronics and Communication Engineering (ECE) students and enthusiasts. 
            We bridge the gap between theoretical knowledge and practical implementation by providing intelligent project guidance, comprehensive resources, 
            and a collaborative community platform.
          </p>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold mb-4 text-purple-300">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-black/20 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-400 mb-2">🤖 AI Project Planner</h3>
              <p className="text-sm text-gray-300">Get detailed project plans, component lists, cost estimates, and step-by-step guidance powered by advanced AI.</p>
            </div>
            <div className="bg-black/20 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-400 mb-2">💡 Idea Spark AI</h3>
              <p className="text-sm text-gray-300">Generate creative project ideas based on your interests and keywords using our intelligent suggestion system.</p>
            </div>
            <div className="bg-black/20 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-400 mb-2">📚 Resource Hub</h3>
              <p className="text-sm text-gray-300">Access curated tutorials, research papers, and educational videos from top creators and institutions.</p>
            </div>
            <div className="bg-black/20 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-400 mb-2">👥 Community Forum</h3>
              <p className="text-sm text-gray-300">Connect with fellow engineers, share experiences, ask questions, and collaborate on projects in real-time.</p>
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold mb-4 text-purple-300">Our Mission</h2>
          <p className="text-gray-300 leading-relaxed">
            To democratize access to high-quality ECE project guidance and foster a community where students can learn, 
            create, and innovate together. We believe that every student should have access to intelligent tools that 
            can transform their ideas into successful projects.
          </p>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold mb-4 text-purple-300">Why Choose Curionics?</h2>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-center gap-2"><span className="text-green-400">✓</span> AI-powered project planning and guidance</li>
            <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Cost-effective solutions tailored for Indian market</li>
            <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Comprehensive resource library</li>
            <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Active community support</li>
            <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Regular updates with latest technologies</li>
            <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Free and open-source platform</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

const ProjectCard = ({ project, setPage, setSelectedProject }) => (
  <div className="bg-white/40 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col border border-white/20">
    <div className="p-6 flex-grow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-white/80">
          <span className="text-purple-300">{categoryIcons[project.category] || categoryIcons['Default']}</span>
          <span>{project.category}</span>
        </div>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full text-white/90 ${ project.difficulty === 'Beginner' ? 'bg-green-500/50' : project.difficulty === 'Intermediate' ? 'bg-yellow-500/50' : 'bg-red-500/50' }`}>{project.difficulty}</span>
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
      <p className="text-white/80 text-sm flex-grow">{project.description}</p>
    </div>
    <div className="bg-black/20 px-6 py-4 flex justify-between items-center">
        <div className="text-sm font-semibold text-white/90">Est. Cost: <span className="text-purple-300">{project.cost}</span></div>
        <button onClick={() => { setSelectedProject(project); setPage('details'); }} className="text-sm font-semibold text-purple-300 hover:text-white">View Details &rarr;</button>
    </div>
  </div>
);

const IdeaSparkModal = ({ setShowModal, setProjects }) => {
    const [keywords, setKeywords] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGenerate = async () => {
        if (!keywords.trim()) return;
        setIsLoading(true);
        setError(null);
        const prompt = `Generate 3 creative, novel project ideas for an ECE student based on: "${keywords}". Provide a title, description, category, difficulty (Beginner, Intermediate, or Advanced), and cost ('₹', '₹₹', or '₹₹₹').`;
        const payload = {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: { type: "ARRAY", items: { type: "OBJECT", properties: { title: { type: "STRING" }, description: { type: "STRING" }, category: { type: "STRING" }, difficulty: { type: "STRING" }, cost: { type: "STRING" } }, required: ["title", "description", "category", "difficulty", "cost"] } }
            }
        };
        try {
            const result = await callGeminiAPI(payload);
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) {
                throw new Error("Invalid API response");
            }
            const newIdeas = JSON.parse(text);
            const newProjects = newIdeas.map(idea => ({ ...idea, id: Date.now() + Math.random() }));
            setProjects(prev => [...newProjects, ...prev]);
            setShowModal(false);
        } catch (err) { 
            setError("AI service is currently unavailable. Please try again later or explore our existing project database."); 
            console.error(err); 
        } finally { 
            setIsLoading(false); 
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-[100]">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8 max-w-lg w-full text-white">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Sparkles className="text-yellow-400"/> Idea Spark AI
                    </h2>
                    <button onClick={() => setShowModal(false)} className="text-gray-300 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                <p className="text-gray-300 mb-4">Enter keywords and let our AI inspire your next project!</p>
                <input 
                    type="text" 
                    value={keywords} 
                    onChange={(e) => setKeywords(e.target.value)} 
                    placeholder="e.g., sustainable energy, robotics, IoT" 
                    className="w-full p-2 border border-white/20 rounded-lg bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 mb-4" 
                />
                {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
                }
                <div className="flex justify-end">
                    <button 
                        onClick={handleGenerate} 
                        disabled={isLoading} 
                        className="flex items-center justify-center px-6 py-2 bg-purple-600 text-white font-semibold rounded-full hover:bg-purple-700 disabled:bg-purple-400"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin mr-2" /> Generating...
                            </>
                        ) : (
                            '✨ Generate Ideas'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ProjectExplorer = ({ projects, setProjects, setPage, setSelectedProject }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const [category, setCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const searchMatch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) || project.description.toLowerCase().includes(searchTerm.toLowerCase());
      const difficultyMatch = difficulty === 'All' || project.difficulty === difficulty;
      const categoryMatch = category === 'All' || project.category === category;
      return searchMatch && difficultyMatch && categoryMatch;
    });
  }, [searchTerm, difficulty, category, projects]);

  const uniqueCategories = ['All', ...new Set(projects.map(p => p.category))];
  const uniqueDifficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  return (
    <div className="bg-gray-900 min-h-screen pt-28 bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=2070')"}}>
      <div className="absolute inset-0 bg-black/70"></div>
      {showModal && <IdeaSparkModal setShowModal={setShowModal} setProjects={setProjects} />}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl">Project Idea Explorer</h1>
          <p className="mt-4 text-xl text-gray-300">Discover your next challenge or let our AI spark a new idea for you.</p>
          <button onClick={() => setShowModal(true)} className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 text-yellow-900 font-bold rounded-lg shadow-lg hover:bg-yellow-500 transition transform hover:scale-105">
            <Sparkles size={20}/> ✨ Idea Spark AI
          </button>
        </div>
        <div className="bg-white/10 backdrop-blur-xl p-4 rounded-xl shadow-lg mb-8 sticky top-28 z-40 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-300" />
              </div>
              <input 
                type="text" 
                placeholder="Search for projects..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="block w-full pl-10 pr-3 py-2 border border-white/20 rounded-lg bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 sm:text-sm"
              />
            </div>
            <div className="relative">
              <select 
                value={difficulty} 
                onChange={(e) => setDifficulty(e.target.value)} 
                className="appearance-none block w-full pl-3 pr-10 py-2 text-white border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-400 sm:text-sm rounded-lg border bg-white/10"
              >
                {uniqueDifficulties.map(d => (
                  <option className="text-black" key={d} value={d}>{d}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-300">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
            <div className="relative">
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)} 
                className="appearance-none block w-full pl-3 pr-10 py-2 text-white border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-400 sm:text-sm rounded-lg border bg-white/10"
              >
                {uniqueCategories.map(c => (
                  <option className="text-black" key={c} value={c}>{c}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-300">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-300 mb-4">Showing {filteredProjects.length} of {projects.length} projects.</p>
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map(project => (
                <ProjectCard key={project.id} project={project} setPage={setPage} setSelectedProject={setSelectedProject} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 bg-white/10 backdrop-blur-xl rounded-lg shadow-lg border border-white/20">
              <Lightbulb className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-lg font-medium text-white">No projects found</h3>
              <p className="mt-1 text-sm text-gray-400">Try adjusting your search or use the Idea Spark AI!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProjectDetails = ({ project, setPage, setSelectedProject }) => {
    const [aiPlan, setAiPlan] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGeneratePlan = async () => {
        setIsLoading(true);
        setError(null);
        setAiPlan(null);

        const prompt = `You are an expert ECE project advisor. For the project titled "${project.title}", create a detailed, cost-efficient plan for the Indian market. Provide a detailed overview, a list of cost-efficient components with their purpose, a list of helpful references (like tutorials or datasheets), and an estimated total cost in Indian Rupees (INR).`;
        
        const payload = {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        detailed_overview: { type: "STRING" },
                        cost_efficient_components: { type: "ARRAY", items: { type: "OBJECT", properties: { name: { type: "STRING" }, purpose: { type: "STRING" } } } },
                        references: { type: "ARRAY", items: { type: "OBJECT", properties: { title: { type: "STRING" }, url: { type: "STRING" } } } },
                        estimated_total_cost: { type: "STRING" }
                    },
                    required: ["detailed_overview", "cost_efficient_components", "references", "estimated_total_cost"]
                }
            }
        };

        try {
            const result = await callGeminiAPI(payload);
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) {
                throw new Error("Invalid API response");
            }
            setAiPlan(JSON.parse(text));
        } catch (err) {
            setError("AI service is currently unavailable. Please try again later or explore our existing project resources.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-900 min-h-screen pt-28 bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2070')"}}>
            <div className="absolute inset-0 bg-black/80"></div>
            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <button onClick={() => { setPage('explorer'); setSelectedProject(null); }} className="flex items-center gap-2 text-purple-300 hover:text-white mb-6">
                    <ArrowLeft size={18} /> Back to Explorer
                </button>
                
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-8 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                            <span className="text-purple-300">{categoryIcons[project.category] || categoryIcons['Default']}</span>
                            <span>{project.category}</span>
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full text-white/90 ${ project.difficulty === 'Beginner' ? 'bg-green-500/50' : project.difficulty === 'Intermediate' ? 'bg-yellow-500/50' : 'bg-red-500/50' }`}>{project.difficulty}</span>
                    </div>

                    <h1 className="text-4xl font-extrabold mb-2">{project.title}</h1>
                    <p className="text-lg text-gray-300 mb-8">{project.description}</p>

                    <div className="bg-black/20 rounded-lg p-6">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Wand2 size={24}/> AI Project Planner</h2>
                        
                        {!aiPlan && !isLoading && !error && (
                            <>
                                <p className="text-gray-300 mb-4">Let our AI generate a step-by-step plan, including components, references, and a cost estimate in INR (₹) to get you started.</p>
                                <button onClick={handleGeneratePlan} className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-bold rounded-lg shadow-md hover:bg-purple-700 transition transform hover:scale-105">
                                    <Sparkles size={20}/> Generate Project Plan
                                </button>
                            </>
                        )}
                        
                        {isLoading && (
                            <div className="flex items-center justify-center gap-3 text-lg font-semibold text-gray-200 py-8">
                                <Loader2 className="animate-spin h-8 w-8 text-purple-400" />
                                Generating your custom project plan...
                            </div>
                        )}

                        {error && (
                             <div className="text-center py-8 px-4 bg-red-900/30 rounded-lg">
                                <ServerCrash className="mx-auto h-12 w-12 text-red-400" />
                                <h3 className="mt-2 text-lg font-medium text-red-200">Oops! Something went wrong.</h3>
                                <p className="mt-1 text-sm text-red-300">{error}</p>
                            </div>
                        )}

                        {aiPlan && (
                            <div className="space-y-8 animate-fade-in">
                                <div>
                                    <h3 className="text-xl font-semibold mb-2 border-b-2 border-purple-400/50 pb-2">Project Overview</h3>
                                    <p className="text-gray-300 mt-2">{aiPlan.detailed_overview}</p>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-3 border-b-2 border-purple-400/50 pb-2">Cost-Efficient Components</h3>
                                    <ul className="space-y-2 text-gray-300">
                                        {aiPlan.cost_efficient_components.map((item, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <ListChecks className="text-purple-300 mt-1 flex-shrink-0" size={18}/>
                                                <div><strong>{item.name}:</strong> {item.purpose}</div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                 <div>
                                    <h3 className="text-xl font-semibold mb-3 border-b-2 border-purple-400/50 pb-2">References</h3>
                                    <ul className="space-y-2 text-gray-300">
                                         {aiPlan.references.map((item, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <LinkIcon className="text-purple-300 mt-1 flex-shrink-0" size={16}/>
                                                <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-purple-300 underline">{item.title}</a>
                                            </li>
                                         ))}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold mb-2 border-b-2 border-purple-400/50 pb-2">Estimated Total Cost (India)</h3>
                                    <p className="text-2xl font-bold text-purple-300 mt-2">{aiPlan.estimated_total_cost}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const VideoCard = ({ video }) => (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col border border-white/20">
        <div className="aspect-w-16 aspect-h-9">
            <iframe 
                src={`https://www.youtube.com/embed/${video.videoId}`} 
                title={video.title} 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="w-full h-full rounded-t-2xl"
            ></iframe>
        </div>
        <div className="p-4">
            <h3 className="text-md font-bold text-white leading-tight">{video.title}</h3>
            <p className="text-sm text-purple-300 mt-2">{video.channel}</p>
        </div>
    </div>
);

const ResearchPaperCard = ({ paper }) => (
    <a href={paper.url} target="_blank" rel="noopener noreferrer" className="block bg-white/10 backdrop-blur-md p-4 rounded-lg hover:bg-white/20 transition-colors border border-white/20">
        <h4 className="font-bold text-white">{paper.title}</h4>
        <p className="text-sm text-gray-300">{paper.authors}</p>
        <p className="text-xs text-purple-300 mt-1">Source: {paper.source}</p>
    </a>
);

const ResourcesPage = () => {
    const [activeTab, setActiveTab] = useState('videos'); // videos, papers
    const [activeVideoCategory, setActiveVideoCategory] = useState('All');
    const videoCategories = ['All', 'Basics', 'Tools & Techniques', 'Arduino', 'Raspberry Pi', 'Project Ideas'];
    const videoCategoryIcons = {
        'All': <Sparkles size={18}/>,
        'Basics': <Book size={18}/>,
        'Tools & Techniques': <Wrench size={18}/>,
        'Arduino': <Cpu size={18}/>,
        'Raspberry Pi': <Cpu size={18}/>,
        'Project Ideas': <Lightbulb size={18}/>
    };

    const filteredVideos = useMemo(() => {
        if (activeVideoCategory === 'All') return videoDatabase;
        return videoDatabase.filter(video => video.category === activeVideoCategory);
    }, [activeVideoCategory]);

    return (
        <div className="bg-gray-900 min-h-screen pt-28 bg-cover bg-fixed" style={{backgroundImage: "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072')"}}>
            <div className="absolute inset-0 bg-black/80"></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-white sm:text-5xl">Resources Hub</h1>
                    <p className="mt-4 text-xl text-gray-300">Explore tutorials, research papers, and videos from across the web.</p>
                </div>
                
                <div className="mb-8 flex justify-center">
                    <div className="bg-white/10 backdrop-blur-xl p-2 rounded-full shadow-lg border border-white/20 flex flex-wrap gap-2">
                        <button onClick={() => setActiveTab('videos')} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full transition-colors ${activeTab === 'videos' ? 'bg-purple-600 text-white' : 'text-gray-200 hover:bg-white/20'}`}><Youtube size={18}/> Videos</button>
                        <button onClick={() => setActiveTab('papers')} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full transition-colors ${activeTab === 'papers' ? 'bg-purple-600 text-white' : 'text-gray-200 hover:bg-white/20'}`}><FileSignature size={18}/> Research Papers</button>
                    </div>
                </div>

                {activeTab === 'videos' && (
                    <div>
                        <div className="mb-8 flex justify-center">
                            <div className="bg-black/20 p-2 rounded-full flex flex-wrap gap-2">
                                {videoCategories.map(category => (
                                    <button 
                                        key={category}
                                        onClick={() => setActiveVideoCategory(category)}
                                        className={`flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full transition-colors ${activeVideoCategory === category ? 'bg-purple-500 text-white' : 'text-gray-300 hover:bg-white/10'}`}
                                    >
                                        {videoCategoryIcons[category]}
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {filteredVideos.map(video => <VideoCard key={video.id} video={video} />)}
                        </div>
                    </div>
                )}
                
                {activeTab === 'papers' && (
                    <div className="space-y-4">
                        {researchPapers.map(paper => <ResearchPaperCard key={paper.id} paper={paper} />)}
                    </div>
                )}
            </div>
        </div>
    );
};

const ThreadView = ({ thread, setViewingThread, username }) => {
    const [replies, setReplies] = useState([]);
    const [newReply, setNewReply] = useState("");
    const repliesEndRef = useRef(null);

    useEffect(() => {
        if (!thread?.id) return;
        const repliesQuery = query(collection(db, "threads", thread.id, "replies"), orderBy("timestamp"));
        const unsubscribe = onSnapshot(repliesQuery, (querySnapshot) => {
            const msgs = [];
            querySnapshot.forEach((doc) => {
                msgs.push({ id: doc.id, ...doc.data() });
            });
            setReplies(msgs);
        });
        return () => unsubscribe();
    }, [thread?.id]);

    useEffect(() => {
        repliesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [replies]);

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (newReply.trim() === "") return;
        try {
            await addDoc(collection(db, "threads", thread.id, "replies"), {
                text: newReply,
                author: username,
                timestamp: serverTimestamp(),
            });
            setNewReply("");
        } catch (error) {
            console.error("Error sending reply:", error);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-white/20">
                <button onClick={() => setViewingThread(null)} className="flex items-center gap-2 text-purple-300 hover:text-white mb-4">
                    <ArrowLeft size={18} /> Back to All Threads
                </button>
                <h2 className="text-2xl font-bold text-white">{thread.title}</h2>
                <p className="text-sm text-gray-400">Started by {thread.author}</p>
            </div>
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {replies.map(reply => (
                    <div key={reply.id} className={`flex ${reply.author === username ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-3 rounded-lg max-w-xs lg:max-w-md ${reply.author === username ? 'bg-purple-600/80 text-white' : 'bg-gray-600/80 text-white'}`}>
                            <p className="text-xs font-bold opacity-70 mb-1">{reply.author}</p>
                            <p className="text-sm">{reply.text}</p>
                        </div>
                    </div>
                ))}
                <div ref={repliesEndRef} />
            </div>
            <form onSubmit={handleSendReply} className="p-4 flex gap-2 border-t border-white/20">
                <input
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    placeholder="Write a reply..."
                    className="flex-grow block w-full pl-4 pr-3 py-2 border border-white/20 rounded-full bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 sm:text-sm"
                />
                <button type="submit" className="bg-purple-600 text-white p-3 rounded-full hover:bg-purple-700 transition-colors disabled:bg-purple-400">
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
};

const CommunityPage = () => {
    const [threads, setThreads] = useState([]);
    const [viewingThread, setViewingThread] = useState(null); // null for list, thread object for view
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newThreadTitle, setNewThreadTitle] = useState("");
    const [username] = useState(`User${Math.floor(Math.random() * 1000)}`);

    useEffect(() => {
        try {
            const q = query(collection(db, "threads"), orderBy("timestamp", "desc"));
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const threadList = [];
                querySnapshot.forEach((doc) => {
                    threadList.push({ id: doc.id, ...doc.data() });
                });
                setThreads(threadList);
            });
            return () => unsubscribe();
        } catch (error) {
            console.error("Error fetching threads:", error);
        }
    }, []);

    const handleCreateThread = async (e) => {
        e.preventDefault();
        if (newThreadTitle.trim() === "") return;
        try {
            await addDoc(collection(db, "threads"), {
                title: newThreadTitle,
                author: username,
                timestamp: serverTimestamp(),
            });
            setNewThreadTitle("");
            setShowCreateModal(false);
        } catch (error) {
            console.error("Error creating thread:", error);
        }
    };

    return (
        <div className="bg-gray-900 min-h-screen pt-28 bg-cover bg-center" style={{backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2070')"}}>
            <div className="absolute inset-0 bg-black/80"></div>
            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 h-[calc(100vh-7rem)] flex flex-col">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold text-white sm:text-5xl">Community Forum</h1>
                    <p className="mt-4 text-xl text-gray-300">Discuss projects, ask questions, and collaborate in real-time.</p>
                </div>
                
                <div className="flex-grow bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 flex flex-col">
                    {viewingThread ? (
                        <ThreadView thread={viewingThread} setViewingThread={setViewingThread} username={username} />
                    ) : (
                        <div className="h-full flex flex-col">
                            <div className="p-4 flex justify-between items-center border-b border-white/20">
                                <h2 className="text-xl font-bold text-white">All Threads</h2>
                                <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-purple-700">
                                    <PlusCircle size={18} /> Create Thread
                                </button>
                            </div>
                            <div className="flex-grow overflow-y-auto p-4 space-y-3">
                                {threads.map(thread => (
                                    <div key={thread.id} onClick={() => setViewingThread(thread)} className="bg-white/10 p-4 rounded-lg cursor-pointer hover:bg-white/20 transition-colors">
                                        <h3 className="font-bold text-white">{thread.title}</h3>
                                        <p className="text-xs text-gray-400">Started by {thread.author} - {thread.timestamp?.toDate ? thread.timestamp.toDate().toLocaleDateString() : 'Recently'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100]">
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8 max-w-lg w-full text-white">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Create a New Thread</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-300 hover:text-white"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleCreateThread}>
                            <label htmlFor="threadTitle" className="block text-sm font-medium text-gray-300 mb-2">Thread Title</label>
                            <input
                                id="threadTitle"
                                value={newThreadTitle}
                                onChange={(e) => setNewThreadTitle(e.target.value)}
                                placeholder="What's your discussion about?"
                                className="w-full p-2 border border-white/20 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 mb-4"
                            />
                            <div className="flex justify-end">
                                <button type="submit" className="flex items-center justify-center px-6 py-2 bg-purple-600 text-white font-semibold rounded-full hover:bg-purple-700">
                                    Post Thread
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};


// --- App Component ---
export default function App() {
  const [page, setPage] = useState('home'); // 'home', 'explorer', 'details', 'about', 'resources', 'community'
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState(projectDatabase); // Use the new comprehensive database

  const renderPage = () => {
    switch(page) {
        case 'home': return <HomePage setPage={setPage} />;
        case 'explorer': return <ProjectExplorer projects={projects} setProjects={setProjects} setPage={setPage} setSelectedProject={setSelectedProject} />;
        case 'details': return <ProjectDetails project={selectedProject} setPage={setPage} setSelectedProject={setSelectedProject} />;
        case 'about': return <AboutPage />;
        case 'resources': return <ResourcesPage />;
        case 'community': return <CommunityPage />;
        default: return <HomePage setPage={setPage} />;
    }
  }

  return (
    <div className="bg-gray-900 font-sans">
      <style>{`
        .animate-fade-in { animation: fadeIn 0.5s ease-in-out; } 
        @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } } 
        .aspect-w-16 { position: relative; padding-bottom: 56.25%; } 
        .aspect-h-9 { }
        @keyframes pulse { 0%, 100% { opacity: 0.7; } 50% { opacity: 0.4; } }
        .animate-pulse { animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>
      <Navbar setPage={setPage} setSelectedProject={setSelectedProject} />
      <main>
        {renderPage()}
      </main>
    </div>
  );
}