// src/components/ui/AnimatedBorderContainer.tsx
// STARTING WITH THE ORIGINAL CODE FROM THE UI WEBSITE

import React from 'react';
import styled from 'styled-components';

// Basic Props Interface
interface AnimatedBorderContainerProps {
  children?: React.ReactNode;
  className?: string;
  title: string;
  headerControls?: React.ReactNode; // <-- ADDED: Prop for extra header content
}

// Renamed component function from 'Card' to match filename
const AnimatedBorderContainer: React.FC<AnimatedBorderContainerProps> = ({
  children,
  className,
  title,
  headerControls, // <-- ADDED: Destructure the new prop
}) => {
  return (
    <StyledWrapper className={className}>
      {/* --- Original JSX Starts Here --- */}
      <div> {/* This extra div might be removable later */}
        <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
          {/* ... svg filters remain the same ... */}
           <filter id="unopaq" y="-100%" height="300%" x="-100%" width="300%">
             <feColorMatrix values="1 0 0 0 0
             0 1 0 0 0
             0 0 1 0 0
             0 0 0 5 0" />
           </filter>
           <filter id="unopaq2" y="-100%" height="300%" x="-100%" width="300%">
             <feColorMatrix values="1 0 0 0 0
             0 1 0 0 0
             0 0 1 0 0
             0 0 0 10 0" />
           </filter>
           <filter id="unopaq3" y="-100%" height="300%" x="-100%" width="300%">
             <feColorMatrix values="1 0 0 1 0
             0 1 0 1 0
             0 0 1 1 0
             0 0 0 2 0" />
           </filter>
        </svg>
        <div className="card-container">
          <div className="spin spin-blur" />
          <div className="spin spin-intense" />
          <div className="backdrop" />
          <div className="card-border">
            <div className="spin spin-inside" />
          </div>
          <div className="card">
            {/* --- MODIFIED HEADER --- */}
            <div className="simple-header">
              <span className="header-title-text">{title}</span>
              {/* Render the controls passed via props */}
              <div className="header-controls-container"> {/* Optional: Add a container for controls if needed */}
                 {headerControls}
              </div>
            </div>
            {/* --- END MODIFIED HEADER --- */}

            <div className="content"> {/* This is the area we will modify */}
              {children}
            </div>
          </div>
        </div>
      </div>
      {/* --- Original JSX Ends Here --- */}
    </StyledWrapper>
  );
}

// --- Original CSS Starts Here ---
const StyledWrapper = styled.div`
  .card-container {
    position: relative;
    width: 500px; /* Original fixed width */
    height: 400px; /* Original fixed height */
    border-radius: 1em;
    margin: 0 -1em; /* Original margin */
  }

  .card-border {
    position: absolute;
    inset: 0;
    background: #0005;
    border-radius: inherit;
  }

  .card {
    position: absolute;
    inset: 0.125em;
    border-radius: 0.875em;
    background: #111215; /* Original opaque background */
    display: flex;
    flex-direction: column;
    color: #fff;
    overflow: hidden;
  }

  /* --- MODIFIED STYLES FOR THE HEADER --- */
  .simple-header {
    padding: 0.75rem 1rem; /* Adjust padding as needed */
    background: rgb(17, 15, 17); /* Or a subtle color like #0b0d10 if you prefer */
    border-bottom: 1px solid #1d1f23; /* Match original border */
    flex-shrink: 0; /* Prevent header from shrinking */
    position: relative; /* Ensure it stacks correctly if needed */
    z-index: 1; /* Place above potential ::before elements */

    /* Use Flexbox for layout */
    display: flex;
    justify-content: space-between; /* Pushes title and controls apart */
    align-items: center; /* Vertically aligns items */
  }

  .header-title-text {
    font-size: 1rem; /* Adjust size */
    font-weight: 600; /* Adjust weight */
    color: #e0e0e0; /* Adjust color */
    /* Remove text-align: center if it was there before */
    /* text-align: left; */ /* Or keep centered if you prefer title centered and controls right */
  }

  /* Optional: Container for controls if you need specific alignment/spacing */
  .header-controls-container {
     display: flex;
     align-items: center;
     margin-right: 6rem;
     /* Add gap if needed: gap: 0.5rem; */
  }
  /* --- END MODIFIED HEADER STYLES --- */


  .content { /* Styles for the original content area */
    height: 100%;
    overflow: auto; /* Changed from hidden to auto/scroll if content might exceed card height */
    flex-grow: 1; /* Allow content to take remaining space */
  }

  /* ... rest of the styles remain the same ... */

   .backdrop {
     position: absolute;
     inset: -15%;
     background: radial-gradient(
       circle at 50% 50%,
       #0000 0,
       #0000 30%,
       rgba(0, 0, 0, 0.67) 50%
     );
     background-size: 3px 3px;
     z-index: -1;
   }

   .spin {
     position: absolute;
     inset: 0;
     z-index: -2;
     overflow: hidden;
   }

   .spin-blur {
     filter: blur(1em) url(#unopaq);
   }

   .spin-intense {
     inset: -0.125em;
     filter: blur(0.5em) url(#unopaq2);
     border-radius: 0.75em;
   }

   .spin-inside {
     inset: -2px;
     border-radius: inherit;
     filter: blur(2px) url(#unopaq3);
     z-index: 0;
   }

   .spin::before {
     content: "";
     position: absolute;
     inset: -30%;
     animation: speen 8s cubic-bezier(0.56, 0.15, 0.28, 0.86) infinite;
   }

   .spin-blur::before {
     background: linear-gradient(-45deg, #f50, #0000 46% 54%, #05f);
   }

   .spin-intense::before {
     background: linear-gradient(-45deg, #f95, #0000 35% 65%, #59f);
   }

   .spin-inside::before {
     background: linear-gradient(-45deg, #fc9, #0000 35% 65%, #9cf);
   }

   @keyframes speen {
     0% {
       rotate: 10deg;
     }
     50% {
       rotate: 190deg;
     }
     to {
       rotate: 370deg;
     }
   }

   .pfp {
     cursor: pointer;
     display: flex;
     width: 1.75em;
     height: 1.75em;
     border-radius: 100%;
     background-color: #fff1;
     background-size: cover;
     /* Original background image data removed for brevity */
     /* background-image: url("data:image/png;base64,..."); */
   }
`;
// --- Original CSS Ends Here ---

export default AnimatedBorderContainer; // Exporting with the filename
