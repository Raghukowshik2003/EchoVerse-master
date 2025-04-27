// src/app/meetthecreators/page.tsx
'use client'; // Needed for useState and event handlers

import React, { useState, FormEvent } from 'react';
import ClientLoadingScreen from '@/components/ClientLoadingScreen';
import TranslateNowButton from '@/components/ui/TranslateNowButton';
import { AnimatedTooltip } from '@/components/ui/AnimatedTooltip';

// --- Define the data for the tooltips ---
const people = [
  {
    id: 1,
    name: "Raghu Kowshik",
    designation: "Devops Engineer",
    image:
      "/raghu.jpeg", 
  },
  {
    id: 2,
    name: "Dindi Venkat",
    designation: "Data Scientist",
    image:
      "/venkat.jpeg",
  },
  {
    id: 3,
    name: "Shapaba Oinam",
    designation: "Cloud Engineer",
    image:
      "/shapaba.png",
  },
  {
    id: 4,
    name: "Tarun Manikanta",
    designation: "Data Scientist",
    image:
      "/Tarun.jpg",
  },
  {
    id: 5,
    name: "Vinay Dheeraj Patnaik",
    designation: "Software Engineer",
    image:
      "/vinay.jpeg",
  },
  {
    id: 6,
    name: "Sai Karthik",
    designation: "Software Engineer",
    image:
      "/karthik.jpg",
  },
  // Add more people if needed
];




const ContactPage: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    const formData = { firstName, lastName, email, message };
    // console.log('Form Data:', formData);
    
    try {
      // --- New: Send data to the API route ---
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        console.log('Email sent successfully!');
        setSubmitStatus('success');
      } else {
        const errorData = await response.json();
        console.error('Failed to send email. API Error:', errorData);
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Failed to send email. Network Error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      setFirstName(''); setLastName(''); setEmail(''); setMessage('');
      setTimeout(() => setSubmitStatus(null), 3000);
    }
  };

  return (
    <ClientLoadingScreen>

<div className="fixed inset-0 -z-10 h-screen w-screen [background:radial-gradient(125%_105%_at_50%_10%,#000_36%,#63e_100%)]"></div>
      {/* Main container to center the card */}
      <div className="flex flex-col items-center justify-center min-h-screen w-full p-2 sm:p-6 md:p-8"> {/* Reduced base padding */}

        {/* --- Card Start --- */}
        {/* Outer div for border gradient and relative positioning for dot */}
        <div className="relative w-full max-w-lg sm:max-w-lg md:max-w-2xl p-px rounded-lg bg-[radial-gradient(circle_230px_at_0%_0%,#999,#0c0d0d)]">

          {/* Animated Dot */}
          <div className="absolute w-[5px] h-[5px] bg-white shadow-[0_0_10px_#ffffff] rounded-full z-20 animate-moveDot"></div>

          {/* Inner Card: Background, Padding, Rounded corners, Relative positioning for ray/lines, Overflow hidden */}
          <div className="relative rounded-[7px] p-3 sm:p-6 md:p-8 bg-[radial-gradient(circle_280px_at_0%_0%,#2a2a2a,#0c0d0d)] text-white shadow-xl overflow-hidden">

            {/* Diagonal Ray */}
            <div className="absolute top-0 left-0 w-[220px] h-[45px] bg-white/20 shadow-[0_0_50px_#fff] blur-lg rounded-full origin-top-left transform rotate-45 z-0"></div> {/* Adjusted opacity and blur */}

            {/* Inner Lines */}
            <div className="absolute top-[10%] left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent z-10"></div> {/* Adjusted gradient line */}
            <div className="absolute bottom-[10%] left-0 w-full h-px bg-gray-700 z-10"></div> {/* Simplified bottom line */}
            <div className="absolute left-[10%] top-0 w-px h-full bg-gradient-to-b from-transparent via-gray-600 to-transparent z-10"></div> {/* Adjusted gradient line */}
            <div className="absolute right-[10%] top-0 w-px h-full bg-gray-700 z-10"></div> {/* Simplified right line */}

            {/* Form Content - needs to be above the ray/lines */}
            <div className="relative z-10 px-6 sm:px-4 md:px-6 pt-4 pb-6"> {/* Ensure form content is above lines/ray */}
            <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6 mt-2 sm:mt-[12px] text-gray-200">Contact Us</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* First Name & Last Name Row */}
                <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 w-full sm:w-auto">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-400 mb-1 sm:ml-[30px]">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="w-full sm:w-[230px] sm:ml-[27px] px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="John"
                    />
                  </div>
                  <div className="flex-1 w-full sm:w-auto">
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-400 mb-1 sm:ml-[15px]">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="w-full sm:w-[230px] sm:ml-[10px] px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1 sm:ml-[32px]">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full sm:w-[500px] sm:ml-[30px] px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="you@example.com"
                  />
                </div>

                {/* Message Field */}
                <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-400 mb-1 sm:ml-[32px]">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    className="w-full sm:w-[500px] sm:ml-[30px] px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Your message..."
                  />
                </div>

                {/* Submit Button */}
                {/* --- Submit Button --- */}
                {/* Replace the old button with TranslateNowButton */}
                <div className="relative pt-4 -top-6 flex justify-center"> {/* Add some padding-top to the wrapper */}
                  <TranslateNowButton
                    type="submit" // <-- Set type to submit
                    disabled={isSubmitting} // <-- Pass disabled state
                  >
                    {/* Pass the dynamic text as children */}
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </TranslateNowButton>
                </div>
                {/* --- End Submit Button --- */}
                {/* Submission Status Feedback */}
                {submitStatus === 'success' && (
                  <p className="text-center text-green-400 text-sm mt-4">Message sent successfully!</p>
                )}
                {submitStatus === 'error' && (
                  <p className="text-center text-red-400 text-sm mt-4">Failed to send message. Please try again.</p>
                )}
              </form>
            </div> {/* End Form Content Wrapper */}
          </div> {/* End Inner Card */}
        </div> {/* --- Card End --- */}

        <div className="flex flex-row items-center justify-center mt-8 sm:mt-[40px] w-full">
          <AnimatedTooltip items={people} />
        </div>

      </div>
    </ClientLoadingScreen>
  );
};

export default ContactPage;