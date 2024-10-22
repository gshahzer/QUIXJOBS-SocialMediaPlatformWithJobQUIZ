import { Video, FileText, CheckCircle, PlayCircle, Bookmark, Star, UserPlus, Trophy, Box, Shield, Brain, Layers, Cloud, Server, Code, Gamepad } from "lucide-react"; // Add more icons

const InterviewPreparation = () => {
  return (
    <section className="bg-white p-8 rounded-lg shadow-lg max-w-6xl mx-auto my-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Interview Preparation Hub</h2>
      <p className="text-lg text-gray-600 mb-8 text-center">Prepare for your next interview with quizzes, video tutorials, mock interviews, and expert advice tailored to your field.</p>

      {/* Section for quizzes */}
      <div className="mb-10">
        <h3 className="text-2xl font-semibold text-gray-700 mb-4">Quizzes by Field</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="border rounded-lg p-6 hover:shadow-lg bg-white">
            <FileText size={28} className="text-blue-600 mb-3" />
            <h4 className="font-semibold text-lg text-gray-700">Software Development</h4>
            <p className="text-gray-500 mb-3">Challenge yourself with coding, data structures, and algorithmic problems.</p>
            <button className="btn btn-primary">Take Quiz</button>
          </div>

          <div className="border rounded-lg p-6 hover:shadow-lg bg-white">
            <FileText size={28} className="text-blue-600 mb-3" />
            <h4 className="font-semibold text-lg text-gray-700">Data Science</h4>
            <p className="text-gray-500 mb-3">Sharpen your analytical skills with data analysis, machine learning, and more.</p>
            <button className="btn btn-primary">Take Quiz</button>
          </div>

          <div className="border rounded-lg p-6 hover:shadow-lg bg-white">
            <FileText size={28} className="text-blue-600 mb-3" />
            <h4 className="font-semibold text-lg text-gray-700">Marketing</h4>
            <p className="text-gray-500 mb-3">Prepare for marketing strategy, branding, and campaign management.</p>
            <button className="btn btn-primary">Take Quiz</button>
          </div>

          <div className="border rounded-lg p-6 hover:shadow-lg bg-white">
            <FileText size={28} className="text-blue-600 mb-3" />
            <h4 className="font-semibold text-lg text-gray-700">App Development</h4>
            <p className="text-gray-500 mb-3">Prepare for app development interview, knowing whats currently asked in market</p>
            <button className="btn btn-primary">Take Quiz</button>
          </div>

          <div className="border rounded-lg p-6 hover:shadow-lg bg-white">
            <FileText size={28} className="text-blue-600 mb-3" />
            <h4 className="font-semibold text-lg text-gray-700">Virtual Assistant</h4>
            <p className="text-gray-500 mb-3">Prepare for assisting virtually, patience, and self management.</p>
            <button className="btn btn-primary">Take Quiz</button>
          </div>
        </div>
      </div>

      {/* Section for video tutorials */}
      <div className="mb-10">
        <h3 className="text-2xl font-semibold text-gray-700 mb-4">Video Tutorials</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="border rounded-lg p-6 hover:shadow-lg bg-white">
            <PlayCircle size={28} className="text-green-500 mb-3" />
            <h4 className="font-semibold text-lg text-gray-700">Technical Interview Prep</h4>
            <p className="text-gray-500 mb-3">Get tips on solving coding problems efficiently in real-time.</p>
            <button className="btn btn-primary">Watch Video</button>
          </div>

          <div className="border rounded-lg p-6 hover:shadow-lg bg-white">
            <PlayCircle size={28} className="text-green-500 mb-3" />
            <h4 className="font-semibold text-lg text-gray-700">Behavioral Interview Tips</h4>
            <p className="text-gray-500 mb-3">Learn how to answer tough behavioral questions with confidence.</p>
            <button className="btn btn-primary">Watch Video</button>
          </div>

          <div className="border rounded-lg p-6 hover:shadow-lg bg-white">
            <PlayCircle size={28} className="text-green-500 mb-3" />
            <h4 className="font-semibold text-lg text-gray-700">Resume Building</h4>
            <p className="text-gray-500 mb-3">Create a resume that stands out with these expert tips.</p>
            <button className="btn btn-primary">Watch Video</button>
          </div>

          {/* Add more video tutorials */}
        </div>
      </div>

      {/* Section for Mock Interviews */}
      <div className="mb-10">
        <h3 className="text-2xl font-semibold text-gray-700 mb-4">Mock Interviews</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="border rounded-lg p-6 hover:shadow-lg bg-white">
            <CheckCircle size={28} className="text-red-500 mb-3" />
            <h4 className="font-semibold text-lg text-gray-700">Coding Mock Interview</h4>
            <p className="text-gray-500 mb-3">Simulate a real coding interview and get feedback.</p>
            <button className="btn btn-primary">Start Interview</button>
          </div>

          <div className="border rounded-lg p-6 hover:shadow-lg bg-white">
            <CheckCircle size={28} className="text-red-500 mb-3" />
            <h4 className="font-semibold text-lg text-gray-700">Behavioral Mock Interview</h4>
            <p className="text-gray-500 mb-3">Practice answering typical behavioral questions.</p>
            <button className="btn btn-primary">Start Interview</button>
          </div>

          <div className="border rounded-lg p-6 hover:shadow-lg bg-white">
            <CheckCircle size={28} className="text-red-500 mb-3" />
            <h4 className="font-semibold text-lg text-gray-700">Technical System Design</h4>
            <p className="text-gray-500 mb-3">Test your ability to design systems on the fly.</p>
            <button className="btn btn-primary">Start Interview</button>
          </div>

         
<div className="border rounded-lg p-6 hover:shadow-lg bg-white">
  <CheckCircle size={28} className="text-red-500 mb-3" />
  <h4 className="font-semibold text-lg text-gray-700">Project Management Interview</h4>
  <p className="text-gray-500 mb-3">Test your ability to manage projects and teams efficiently.</p>
  <button className="btn btn-primary">Start Interview</button>
</div>

<div className="border rounded-lg p-6 hover:shadow-lg bg-white">
  <CheckCircle size={28} className="text-red-500 mb-3" />
  <h4 className="font-semibold text-lg text-gray-700">Data Structures & Algorithms</h4>
  <p className="text-gray-500 mb-3">Tackle tough data structures and algorithms problems in a timed setting.</p>
  <button className="btn btn-primary">Start Interview</button>
</div>

<div className="border rounded-lg p-6 hover:shadow-lg bg-white">
  <CheckCircle size={28} className="text-red-500 mb-3" />
  <h4 className="font-semibold text-lg text-gray-700">Product Management Interview</h4>
  <p className="text-gray-500 mb-3">Prepare for product strategy and execution questions in this mock interview.</p>
  <button className="btn btn-primary">Start Interview</button>
</div>

<div className="border rounded-lg p-6 hover:shadow-lg bg-white">
  <CheckCircle size={28} className="text-red-500 mb-3" />
  <h4 className="font-semibold text-lg text-gray-700">UX/UI Design Interview</h4>
  <p className="text-gray-500 mb-3">Showcase your design thinking and solve UX problems on the spot.</p>
  <button className="btn btn-primary">Start Interview</button>
</div>
        </div>
      </div>
      <div className="mb-10">
        <h3 className="text-2xl font-semibold text-gray-700 mb-4">Challenge Your Friend</h3>
        <p className="text-lg text-gray-600 mb-4">Test your skills and compete with a friend in a quiz. Select a quiz and invite your friend to challenge them!</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="border rounded-lg p-6 hover:shadow-lg bg-white">
            <UserPlus size={28} className="text-purple-600 mb-3" />
            <h4 className="font-semibold text-lg text-gray-700">Software Development Challenge</h4>
            <p className="text-gray-500 mb-3">Send an invitation to your friend and challenge them to a coding quiz.</p>
            <button className="btn btn-primary">Challenge a Friend</button>
          </div>

          <div className="border rounded-lg p-6 hover:shadow-lg bg-white">
            <UserPlus size={28} className="text-purple-600 mb-3" />
            <h4 className="font-semibold text-lg text-gray-700">Data Science Challenge</h4>
            <p className="text-gray-500 mb-3">Compete with your friend on data analysis and machine learning questions.</p>
            <button className="btn btn-primary">Challenge a Friend</button>
          </div>

          <div className="border rounded-lg p-6 hover:shadow-lg bg-white">
            <UserPlus size={28} className="text-purple-600 mb-3" />
            <h4 className="font-semibold text-lg text-gray-700">Marketing Challenge</h4>
            <p className="text-gray-500 mb-3">Test your marketing skills by challenging a friend to a quiz.</p>
            <button className="btn btn-primary">Challenge a Friend</button>
          </div>

          <div className="border rounded-lg p-6 hover:shadow-lg bg-white">
  <UserPlus size={28} className="text-purple-600 mb-3" />
  <h4 className="font-semibold text-lg text-gray-700">Algorithm Battle</h4>
  <p className="text-gray-500 mb-3">Challenge a friend to solve algorithms under time pressure.</p>
  <button className="btn btn-primary">Challenge Friend</button>
</div>

<div className="border rounded-lg p-6 hover:shadow-lg bg-white">
  <Trophy size={28} className="text-yellow-500 mb-3" />
  <h4 className="font-semibold text-lg text-gray-700">Coding Duel</h4>
  <p className="text-gray-500 mb-3">Go head-to-head with a friend in a coding competition.</p>
  <button className="btn btn-primary">Challenge Friend</button>
</div>

<div className="border rounded-lg p-6 hover:shadow-lg bg-white">
  <Gamepad size={28} className="text-purple-500 mb-3" />
  <h4 className="font-semibold text-lg text-gray-700">Tech Trivia</h4>
  <p className="text-gray-500 mb-3">Test your tech knowledge with a friend in a quiz battle.</p>
  <button className="btn btn-primary">Challenge Friend</button>
</div>

<div className="border rounded-lg p-6 hover:shadow-lg bg-white">
  <Box size={28} className="text-green-500 mb-3" />
  <h4 className="font-semibold text-lg text-gray-700">Design Sprint</h4>
  <p className="text-gray-500 mb-3">Compete in designing a UI/UX solution with your friend.</p>
  <button className="btn btn-primary">Challenge Friend</button>
</div>

<div className="border rounded-lg p-6 hover:shadow-lg bg-white">
  <Shield size={28} className="text-red-500 mb-3" />
  <h4 className="font-semibold text-lg text-gray-700">Security Challenge</h4>
  <p className="text-gray-500 mb-3">Test your cybersecurity skills in a head-to-head competition.</p>
  <button className="btn btn-primary">Challenge Friend</button>
</div>

<div className="border rounded-lg p-6 hover:shadow-lg bg-white">
  <Brain size={28} className="text-pink-500 mb-3" />
  <h4 className="font-semibold text-lg text-gray-700">AI Problem-Solving</h4>
  <p className="text-gray-500 mb-3">Solve complex AI challenges in a race against your friend.</p>
  <button className="btn btn-primary">Challenge Friend</button>
</div>

<div className="border rounded-lg p-6 hover:shadow-lg bg-white">
  <Layers size={28} className="text-orange-500 mb-3" />
  <h4 className="font-semibold text-lg text-gray-700">Full-Stack Showdown</h4>
  <p className="text-gray-500 mb-3">Compete with a friend to build a full-stack web app quickly.</p>
  <button className="btn btn-primary">Challenge Friend</button>
</div>

<div className="border rounded-lg p-6 hover:shadow-lg bg-white">
  <Cloud size={28} className="text-cyan-500 mb-3" />
  <h4 className="font-semibold text-lg text-gray-700">Cloud Computing Duel</h4>
  <p className="text-gray-500 mb-3">Challenge your cloud infrastructure skills with a friend.</p>
  <button className="btn btn-primary">Challenge Friend</button>
</div>

<div className="border rounded-lg p-6 hover:shadow-lg bg-white">
  <Server size={28} className="text-indigo-500 mb-3" />
  <h4 className="font-semibold text-lg text-gray-700">DevOps Showdown</h4>
  <p className="text-gray-500 mb-3">Compete in setting up CI/CD pipelines against your friend.</p>
  <button className="btn btn-primary">Challenge Friend</button>
</div>

<div className="border rounded-lg p-6 hover:shadow-lg bg-white">
  <Code size={28} className="text-teal-500 mb-3" />
  <h4 className="font-semibold text-lg text-gray-700">Front-End Challenge</h4>
  <p className="text-gray-500 mb-3">Race to create the best front-end UI against your friend.</p>
  <button className="btn btn-primary">Challenge Friend</button>
</div>

        </div>
      </div>

      {/* Section for Popular Articles */}
      <div className="mb-10">
        <h3 className="text-2xl font-semibold text-gray-700 mb-4">Popular Articles</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="border rounded-lg p-6 hover:shadow-lg bg-white">
            <Bookmark size={28} className="text-yellow-500 mb-3" />
            <h4 className="font-semibold text-lg text-gray-700">Top 10 Coding Interview Tips</h4>
            <p className="text-gray-500 mb-3">Master the art of coding interviews with these essential tips.</p>
            <button className="btn btn-secondary">Read Article</button>
          </div>

          <div className="border rounded-lg p-6 hover:shadow-lg bg-white">
            <Bookmark size={28} className="text-yellow-500 mb-3" />
            <h4 className="font-semibold text-lg text-gray-700">How to Ace Behavioral Interviews</h4>
            <p className="text-gray-500 mb-3">Guide to answering behavioral questions using the STAR method.</p>
            <button className="btn btn-secondary">Read Article</button>
          </div>

          <div className="border rounded-lg p-6 hover:shadow-lg bg-white">
            <Bookmark size={28} className="text-yellow-500 mb-3" />
            <h4 className="font-semibold text-lg text-gray-700">Resume Mistakes to Avoid</h4>
            <p className="text-gray-500 mb-3">Avoid these common resume mistakes and stand out.</p>
            <button className="btn btn-secondary">Read Article</button>
          </div>

          {/* Add more articles */}
        </div>
      </div>

      {/* Inspirational Section */}
      <div className="text-center py-6 bg-blue-100 rounded-lg shadow-inner">
        <Star size={36} className="text-yellow-500 mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-blue-700 mb-2">Get Inspired</h3>
        <p className="text-lg text-blue-600 mb-4">"Success is where preparation and opportunity meet." - Quix Job</p>
        <button className="btn btn-primary">Start Your Journey</button>
      </div>
    </section>
  );
};

export default InterviewPreparation;
