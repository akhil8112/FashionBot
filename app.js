document.addEventListener('DOMContentLoaded', () => {
    // Elements for login/home page
    const homePage = document.getElementById('home-page');
    const chatInterface = document.getElementById('chat-interface');
    const loginBtn = document.getElementById('login-btn');
    const guestLoginBtn = document.getElementById('guest-login-btn');
    
    // Elements for chat interface
    const chatMessages = document.getElementById('chat-messages');
    const userMessageInput = document.getElementById('user-message');
    const sendButton = document.getElementById('send-btn');
    
    // API configuration
    const API_KEY = 'AIzaSyBUfDHAfHusFv34kZpBoEUA5Hq2irn-6TQiI';
    const API_BASE_URL = 'https://api.fashionfinder.example.com/v1/recommendations';
    
    // Sign up elements
    const signupLink = document.getElementById('signup-link');
    const signupModal = document.getElementById('signup-modal');
    const closeSignupModal = document.getElementById('close-signup-modal');
    const signupBtn = document.getElementById('signup-btn');
    const signupErrors = document.getElementById('signup-errors');
    
    // Sign up functionality (unchanged)
    signupLink.addEventListener('click', function(e) {
        e.preventDefault();
        signupModal.classList.remove('hidden');
    });
    
    closeSignupModal.addEventListener('click', function() {
        signupModal.classList.add('hidden');
    });
    
    signupModal.addEventListener('click', function(e) {
        if (e.target === signupModal) {
            signupModal.classList.add('hidden');
        }
    });
    
    signupBtn.addEventListener('click', handleSignup);
    
    function handleSignup() {
        const name = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        const termsCheckbox = document.getElementById('terms-checkbox');
        
        signupErrors.textContent = '';
        signupErrors.classList.remove('visible');
        
        let hasErrors = false;
        let errorMessages = [];
        
        if (!name) {
            errorMessages.push('Please enter your name');
            hasErrors = true;
        }
        
        if (!email) {
            errorMessages.push('Please enter your email');
            hasErrors = true;
        } else if (!isValidEmail(email)) {
            errorMessages.push('Please enter a valid email address');
            hasErrors = true;
        }
        
        if (!password) {
            errorMessages.push('Please enter a password');
            hasErrors = true;
        } else if (password.length < 6) {
            errorMessages.push('Password must be at least 6 characters');
            hasErrors = true;
        }
        
        if (password !== confirmPassword) {
            errorMessages.push('Passwords do not match');
            hasErrors = true;
        }
        
        if (!termsCheckbox.checked) {
            errorMessages.push('You must agree to the Terms of Service and Privacy Policy');
            hasErrors = true;
        }
        
        if (hasErrors) {
            signupErrors.innerHTML = errorMessages.map(msg => `<div>${msg}</div>`).join('');
            signupErrors.classList.add('visible');
            return;
        }
        
        displayLoadingEffect({ currentTarget: signupBtn });
        
        setTimeout(() => {
            signupModal.classList.add('hidden');
            showChatInterface();
            
            setTimeout(() => {
                addMessage(`Welcome ${name}! I can help you discover the best fashion blogs and style inspiration. What are you interested in today?`, 'bot');
            }, 500);
        }, 1500);
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Login functionality (unchanged)
    loginBtn.addEventListener('click', handleLogin);
    guestLoginBtn.addEventListener('click', handleGuestLogin);
    
    function handleLogin(event) {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        
        if (username === '' || password === '') {
            alert('Please enter both username and password');
            return;
        }
        
        displayLoadingEffect(event);
        setTimeout(() => {
            showChatInterface();
            setTimeout(() => {
                addMessage("Hello! I can help you discover amazing fashion blogs and style inspiration. What are you looking for today? (e.g., streetwear, sustainable fashion, luxury brands, etc.)", 'bot');
            }, 500);
        }, 1500);
    }
    
    function handleGuestLogin(event) {
        displayLoadingEffect(event);
        setTimeout(() => {
            showChatInterface();
            setTimeout(() => {
                addMessage("Welcome guest! I can recommend fashion blogs in different styles and categories. What are you interested in?", 'bot');
            }, 500);
        }, 1500);
    }
    
    // Add loading effect to the button when clicked (unchanged)
    function displayLoadingEffect(event) {
        const clickedBtn = event.currentTarget;
        const buttonText = clickedBtn.querySelector('span');
        const loadingSpinner = clickedBtn.querySelector('.loading-spinner');
        
        if (buttonText && loadingSpinner) {
            buttonText.classList.add('hidden');
            loadingSpinner.classList.remove('hidden');
        } else {
            clickedBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        }
        
        clickedBtn.disabled = true;
    }
    
    // Function to switch from home page to chat interface (unchanged)
    function showChatInterface() {
        homePage.classList.remove('active');
        homePage.classList.add('hidden');
        chatInterface.classList.remove('hidden');
        chatInterface.classList.add('active');
        userMessageInput.focus();
    }
    
    // Context of the current conversation
    let conversationContext = {
        lastQuestion: null,
        needsFollowUp: false,
        identifiedCategory: null,
        userPreference: null
    };
    
    // Add event listeners for chat functionality (unchanged)
    sendButton.addEventListener('click', handleUserMessage);
    userMessageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleUserMessage();
    });
    
    // Add character counter functionality (unchanged)
    const charCount = document.getElementById('char-count');
    if (charCount) {
        userMessageInput.addEventListener('input', () => {
            const currentLength = userMessageInput.value.length;
            charCount.textContent = currentLength;
            
            if (currentLength > 200) {
                charCount.classList.add('near-limit');
            } else {
                charCount.classList.remove('near-limit');
            }
        });
    }
    
    // Updated keyword map for fashion blog categories
    const keywordMap = {
        "streetwear": ["streetwear", "urban", "sneakers", "hypebeast", "street style", "casual", "skatewear"],
        "sustainable": ["sustainable", "eco-friendly", "ethical", "green fashion", "slow fashion", "organic", "upcycled"],
        "luxury": ["luxury", "designer", "high-end", "couture", "haute", "premium", "gucci", "prada", "chanel"],
        "vintage": ["vintage", "retro", "thrift", "secondhand", "classic", "old school", "90s", "80s", "70s"],
        "minimalist": ["minimalist", "simple", "neutral", "capsule", "basic", "clean", "scandinavian", "japanese"],
        "bohemian": ["bohemian", "boho", "hippie", "flowy", "maxi", "ethnic", "festival", "coachella"],
        "professional": ["professional", "workwear", "office", "business", "corporate", "formal", "suits", "blazers"],
        "athleisure": ["athleisure", "activewear", "yoga", "gym", "sporty", "lululemon", "workout", "fitness"],
        "plus size": ["plus size", "curvy", "body positive", "inclusive", "extended sizing", "bbw"],
        "menswear": ["menswear", "men's fashion", "male", "grooming", "suits", "beard", "male style"],
        "womenswear": ["womenswear", "women's fashion", "female", "dresses", "skirts", "feminine"],
        "accessories": ["accessories", "jewelry", "bags", "handbags", "watches", "sunglasses", "hats", "scarves"],
        "footwear": ["footwear", "shoes", "sneakers", "boots", "heels", "sandals", "loafers", "footwear"],
        "beauty": ["beauty", "makeup", "skincare", "cosmetics", "glam", "beauty tips", "hair", "nails"],
        "indian": ["indian", "desi", "saree", "lehenga", "salwar", "kurti", "ethnic", "traditional"],
        "trends": ["trends", "latest", "new", "seasonal", "spring", "summer", "fall", "winter", "fw", "ss"],
        "budget": ["budget", "affordable", "cheap", "inexpensive", "discount", "sale", "thrifty"],
        "celebrity": ["celebrity", "red carpet", "awards", "hollywood", "bollywood", "star", "influencer"],
        "diy": ["diy", "custom", "handmade", "alterations", "sewing", "upcycle", "refashion"],
        "travel": ["travel", "vacation", "holiday", "packing", "resort", "beach", "summer", "winter"],
        "wedding": ["wedding", "bridal", "groom", "engagement", "marriage", "reception", "ceremony"],
        // "bridal": ["bridal", "brides", "wedding dress", "bride", "wedding gown", "bridal wear"],
        "groom": ["groom", "groom's wear", "men's wedding", "groom fashion", "wedding suit"],
        "guest outfits": ["guest outfits", "wedding guest", "party wear", "occasion wear", "festive wear"],
        "old fashion": ["old fashion", "historical", "period clothing", "antique fashion", "bygone era"],
        "indian style": ["indian style", "desi", "ethnic", "traditional", "saree", "lehenga", "salwar"],
        "western style": ["western style", "american", "european", "contemporary", "modern"],
        "winter fashion": ["winter fashion", "cold weather", "layering", "knitwear", "coats"],
        "summer fashion": ["summer fashion", "hot weather", "lightweight", "breathable", "linen"]

    };
    
    // Updated follow-up questions for fashion blogs
    const followUpQuestions = {
        streetwear: "Would you prefer blogs focused on high-end streetwear or more affordable everyday street style?",
        sustainable: "Are you looking for sustainable brand recommendations or tips for building an eco-friendly wardrobe?",
        luxury: "Are you interested in runway coverage, luxury brand reviews, or how to style high-end pieces?",
        vintage: "Would you like blogs about vintage shopping tips or how to style vintage pieces in modern outfits?",
        minimalist: "Are you looking for minimalist wardrobe guides or inspiration for simple, elegant outfits?",
        bohemian: "Would you prefer festival fashion blogs or everyday boho-chic style inspiration?",
        professional: "Are you looking for corporate fashion advice or creative professional style inspiration?",
        athleisure: "Would you like blogs about high-performance activewear or stylish everyday athleisure outfits?",
        plussize: "Are you looking for plus size outfit inspiration or reviews of inclusive fashion brands?",
        menswear: "Would you prefer classic menswear blogs or more contemporary street style inspiration for men?",
        womenswear: "Are you looking for feminine style blogs or more androgynous women's fashion inspiration?",
        accessories: "Would you like blogs focused on jewelry, handbags, or all types of accessories?",
        footwear: "Are you interested in sneaker blogs, luxury shoe reviews, or general footwear styling tips?",
        beauty: "Would you prefer makeup tutorials, skincare routines, or beauty product reviews?",
        indian: "Are you looking for traditional Indian wear inspiration or modern fusion styles?",
        trends: "Would you like trend forecasting blogs or how-to-wear guides for current trends?",
        budget: "Are you looking for thrifting tips or affordable brand recommendations?",
        celebrity: "Would you prefer red carpet analysis or celebrity street style blogs?",
        diy: "Are you looking for clothing alteration tutorials or complete DIY fashion projects?",
        travel: "Would you like packing guides or destination-specific style inspiration?",
        wedding: "Are you looking for bridal fashion or guest outfit inspiration?",
        // "bridal": "Are you looking for traditional bridal wear...", 
        groom: "Would you prefer classic tuxedo styles, cultural groom attire, or contemporary wedding suit options?",
        guestoutfits: "Are you looking for formal wedding guest attire, cocktail party outfits, or festive occasion wear?",
        oldfashion: "Are you interested in Victorian era fashion, 1920s flapper style, or another specific historical period?",
        indianstyle: "Would you like traditional Indian wear inspiration or modern fusion with Western styles?",
        westernstyle: "Are you looking for classic American style, European sophistication, or contemporary global trends?",
        winterfashion: "Would you like cozy winter outfit ideas, stylish cold-weather layering, or holiday party looks?",
        summerfashion: "Are you looking for breezy summer dresses, hot weather menswear, or vacation-ready outfits?"
    };
    
    // Message processing (unchanged structure, updated responses)
    function processUserMessage(message) {
        if (conversationContext.needsFollowUp) {
            conversationContext.userPreference = message;
            fetchRecommendations(conversationContext.identifiedCategory, message);
            conversationContext.needsFollowUp = false;
            return;
        }
        
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes('hey') || lowerMessage.includes('hi') || 
            lowerMessage.includes('hello') || lowerMessage === 'hey') {
            removeTypingIndicator();
            addMessage("Hello! I can help you discover amazing fashion blogs and style inspiration. What are you interested in today?", 'bot');
            return;
        }
        
        if (lowerMessage.includes('help') || lowerMessage === '?') {
            removeTypingIndicator();
            addMessage("I can recommend fashion blogs in these categories: " + 
                      Object.keys(keywordMap).join(', ') + 
                      ". Just tell me what style you're interested in!", 'bot');
            return;
        }
        
        const category = identifyCategoryFromMessage(message);
        
        if (category) {
            conversationContext.identifiedCategory = category;
            removeTypingIndicator();
            addMessage(followUpQuestions[category], 'bot');
            conversationContext.needsFollowUp = true;
        } else {
            removeTypingIndicator();
            
            if (message.length > 30) {
                addMessage("I'm not quite sure what fashion style you're looking for. Could you tell me more specifically? For example, you could say 'I want blogs about sustainable fashion' or 'I need inspiration for professional workwear'.", 'bot');
            } else {
                addMessage("I can recommend fashion blogs in different styles like streetwear, sustainable fashion, luxury brands, and more. What would you like help with?", 'bot');
            }
        }
    }
    
    // Category identification (unchanged structure)
    function identifyCategoryFromMessage(message) {
        const messageLower = message.toLowerCase();
        
        for (const [category, keywords] of Object.entries(keywordMap)) {
            for (const keyword of keywords) {
                if (new RegExp(`\\b${keyword}\\b`).test(messageLower)) {
                    return category;
                }
            }
        }
        
        if (message.length > 15) {
            for (const [category, keywords] of Object.entries(keywordMap)) {
                for (const keyword of keywords) {
                    const words = messageLower.split(/\s+/);
                    for (const word of words) {
                        if (word.includes(keyword) || keyword.includes(word)) {
                            return category;
                        }
                    }
                }
            }
        }
        
        return null;
    }
    
    // Handle user messages (unchanged)
    function handleUserMessage() {
        const userMessage = userMessageInput.value.trim();
        if (userMessage === '') return;
        
        addMessage(userMessage, 'user');
        userMessageInput.value = '';
        
        showTypingIndicator();
        
        setTimeout(() => processUserMessage(userMessage), 800);
    }
    
    // Show typing indicator (unchanged)
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('message', 'bot', 'typing-indicator');
        
        const typingContent = document.createElement('div');
        typingContent.classList.add('message-content');
        typingContent.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
        
        typingDiv.appendChild(typingContent);
        chatMessages.appendChild(typingDiv);
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Remove typing indicator (unchanged)
    function removeTypingIndicator() {
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    // Add a message to the chat interface (unchanged)
    function addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        
        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        messageContent.innerHTML = content;
        
        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Fetch recommendations (unchanged structure, updated content)
    async function fetchRecommendations(category, userPreference) {
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const mockApiResponse = getMockApiResponse(category, userPreference);
            
            displayRecommendations(category, mockApiResponse);
            
        } catch (error) {
            console.error('Error fetching recommendations:', error);
            removeTypingIndicator();
            addMessage("I'm sorry, I encountered an error while fetching blog recommendations. Please try again later.", 'bot');
        }
    }
    
    // Display recommendations (unchanged structure, updated content)
    function displayRecommendations(category, blogs) {
        if (!blogs || blogs.length === 0) {
            removeTypingIndicator();
            addMessage("I'm sorry, I don't have blog recommendations for that category yet. Please try another fashion category like streetwear, sustainable fashion, or luxury brands.", 'bot');
            return;
        }
        
        let responseBotMessage = `Here are some excellent ${category} fashion blogs I recommend:`;
        
        const recommendations = blogs.slice(0, 5);
        
        let recommendationsHTML = '';
        recommendations.forEach(blog => {
            let socialLinksHTML = '<div class="social-links">';
            
            blog.social.forEach(platform => {
                let icon = '';
                let label = '';
                let buttonClass = '';
                
                switch(platform.name) {
                    case 'Instagram':
                        icon = 'fab fa-instagram';
                        label = 'Follow on Instagram';
                        buttonClass = 'instagram';
                        break;
                    case 'Pinterest':
                        icon = 'fab fa-pinterest';
                        label = 'Follow on Pinterest';
                        buttonClass = 'pinterest';
                        break;
                    case 'YouTube':
                        icon = 'fab fa-youtube';
                        label = 'Subscribe on YouTube';
                        buttonClass = 'youtube';
                        break;
                    case 'TikTok':
                        icon = 'fab fa-tiktok';
                        label = 'Follow on TikTok';
                        buttonClass = 'tiktok';
                        break;
                    default:
                        icon = 'fas fa-external-link-alt';
                        label = `Visit ${platform.name}`;
                        buttonClass = 'default';
                }
                
                socialLinksHTML += `
                    <a href="${platform.link}" class="social-button ${buttonClass}" target="_blank">
                        <i class="${icon}"></i>${label}
                    </a>
                `;
            });
            
            socialLinksHTML += '</div>';
            
            recommendationsHTML += `
                <div class="blog-recommendation">
                    <h3>${blog.name}</h3>
                    <p><strong>Focus:</strong> ${blog.focus}</p>
                    <p><strong>Why it's great:</strong> ${blog.why}</p>
                    <div class="platforms">
                        Available on: ${blog.social.map(platform => `<span class="platform-tag">${platform.name}</span>`).join(' ')}
                    </div>
                    ${socialLinksHTML}
                    <p><a href="${blog.link}" target="_blank">Visit ${blog.name}</a></p>
                </div>
            `;
        });
        
        responseBotMessage += recommendationsHTML;
        responseBotMessage += `<p>I hope these fashion blogs inspire you! Would you like recommendations for any other style categories?</p>`;
        
        removeTypingIndicator();
        addMessage(responseBotMessage, 'bot');
    }
    
    // Get mock API response with fashion blog data
    function getMockApiResponse(category, userPreference) {

        const mockData = {
            // bridal: [
            //     {
            //         name: "Brides",
            //         focus: "Comprehensive bridal fashion and planning",
            //         why: "Covers everything from traditional to modern bridal styles with real wedding inspiration.",
            //         social: [
            //             { name: "Website", link: "https://www.brides.com/" },
            //             { name: "Instagram", link: "https://www.instagram.com/brides/" },
            //             { name: "Pinterest", link: "https://www.pinterest.com/brides/" }
            //         ],
            //         link: "https://www.brides.com/"
            //     },
            //     {
            //         name: "Martha Stewart Weddings",
            //         focus: "Elegant and timeless bridal style",
            //         why: "Classic wedding inspiration with attention to detail and sophisticated aesthetics.",
            //         social: [
            //             { name: "Website", link: "https://www.marthastewartweddings.com/" },
            //             { name: "Instagram", link: "https://www.instagram.com/msweddings/" },
            //             { name: "YouTube", link: "https://www.youtube.com/user/MarthaStewart" }
            //         ],
            //         link: "https://www.marthastewartweddings.com/"
            //     },
            //     // ... other bridal entries ...
            // ],
            
            // ... rest of your existing categories ...
        
            groom: [
                {
                    name: "Groom Stand",
                    focus: "Modern groom fashion and grooming",
                    why: "Helps grooms look their best with style guides and product recommendations.",
                    social: [
                        { name: "Website", link: "https://groomstand.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/groomstand/" }
                    ],
                    link: "https://groomstand.com/"
                },
                {
                    name: "Indian Groom",
                    focus: "Traditional and contemporary Indian groom wear",
                    why: "Specializes in sherwanis, bandhgalas, and fusion groom attire.",
                    social: [
                        { name: "Website", link: "https://www.indiangroom.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/indiangroomofficial/" }
                    ],
                    link: "https://www.indiangroom.com/"
                },
                {
                    name: "The Black Tux Blog",
                    focus: "Classic and modern tuxedo style",
                    why: "Expert advice on formalwear for weddings and black-tie events.",
                    social: [
                        { name: "Website", link: "https://theblacktux.com/blog/" },
                        { name: "Instagram", link: "https://www.instagram.com/theblacktux/" }
                    ],
                    link: "https://theblacktux.com/blog/"
                }
            ],
            guestoutfits: [
                {
                    name: "The Guest Book",
                    focus: "Wedding guest attire etiquette and inspiration",
                    why: "Helps guests navigate dress codes and find appropriate outfits.",
                    social: [
                        { name: "Website", link: "https://www.theguestbook.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/theguestbook/" }
                    ],
                    link: "https://www.theguestbook.com/"
                },
                {
                    name: "Occasion Mag",
                    focus: "Party and special occasion wear",
                    why: "Trendy outfit ideas for weddings, galas, and festive events.",
                    social: [
                        { name: "Website", link: "https://www.occasionmag.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/occasionmag/" }
                    ],
                    link: "https://www.occasionmag.com/"
                },
                {
                    name: "Festive Fashionista",
                    focus: "Holiday and festive season outfits",
                    why: "Specializes in celebratory attire for various cultural festivals.",
                    social: [
                        { name: "Website", link: "https://www.festivefashionista.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/festivefashionista/" }
                    ],
                    link: "https://www.festivefashionista.com/"
                }
            ],
            oldfashion: [
                {
                    name: "Vintage Dancer",
                    focus: "Historical fashion reproduction",
                    why: "Detailed guides to accurately recreating period-appropriate outfits.",
                    social: [
                        { name: "Website", link: "https://vintagedancer.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/vintagedancer/" }
                    ],
                    link: "https://vintagedancer.com/"
                },
                {
                    name: "Frock Flicks",
                    focus: "Historical fashion in film",
                    why: "Analyzes period costume accuracy in movies and TV shows.",
                    social: [
                        { name: "Website", link: "https://www.frockflicks.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/frockflicks/" }
                    ],
                    link: "https://www.frockflicks.com/"
                },
                {
                    name: "The Pragmatic Costumer",
                    focus: "Historical fashion for modern life",
                    why: "Shows how to incorporate vintage elements into everyday wear.",
                    social: [
                        { name: "Website", link: "https://thepragmaticcostumer.wordpress.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/pragmaticcostumer/" }
                    ],
                    link: "https://thepragmaticcostumer.wordpress.com/"
                }
            ],
            indianstyle: [
                {
                    name: "Urban Asian",
                    focus: "Contemporary Indian fashion trends",
                    why: "Covers the latest in Indian fashion with a modern twist.",
                    social: [
                        { name: "Website", link: "https://www.urbanasian.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/urbanasianfashion/" }
                    ],
                    link: "https://www.urbanasian.com/"
                },
                {
                    name: "Ethnic Chic",
                    focus: "Traditional Indian wear styling",
                    why: "Creative ways to drape sarees and style ethnic outfits.",
                    social: [
                        { name: "Website", link: "https://www.ethnicchic.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/ethnicchic/" }
                    ],
                    link: "https://www.ethnicchic.com/"
                },
                {
                    name: "Desi Weaves",
                    focus: "Handloom and artisan Indian fashion",
                    why: "Promotes sustainable Indian textiles and traditional craftsmanship.",
                    social: [
                        { name: "Website", link: "https://www.desiweaves.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/desiweaves/" }
                    ],
                    link: "https://www.desiweaves.com/"
                }
            ],
            westernstyle: [
                {
                    name: "The Blonde Salad",
                    focus: "Contemporary Western fashion",
                    why: "Showcases modern Western trends with Italian influences.",
                    social: [
                        { name: "Website", link: "https://www.theblondesalad.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/theblondesalad/" }
                    ],
                    link: "https://www.theblondesalad.com/"
                },
                {
                    name: "Song of Style",
                    focus: "California-inspired Western fashion",
                    why: "Blends laid-back West Coast vibes with high fashion.",
                    social: [
                        { name: "Website", link: "https://www.songofstyle.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/songofstyle/" }
                    ],
                    link: "https://www.songofstyle.com/"
                },
                {
                    name: "The Chriselle Factor",
                    focus: "Modern Western style",
                    why: "Sophisticated styling advice with a Western aesthetic.",
                    social: [
                        { name: "Website", link: "https://thechrisellefactor.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/chrisellelim/" }
                    ],
                    link: "https://thechrisellefactor.com/"
                }
            ],
            winterfashion: [
                {
                    name: "The Winter Edit",
                    focus: "Cold weather style and layering",
                    why: "Expert advice on staying stylish while keeping warm in winter.",
                    social: [
                        { name: "Website", link: "https://www.thewinteredit.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/thewinteredit/" }
                    ],
                    link: "https://www.thewinteredit.com/"
                },
                {
                    name: "Coat Check",
                    focus: "Winter outerwear and accessories",
                    why: "Specializes in coats, jackets, and winter accessories from around the world.",
                    social: [
                        { name: "Website", link: "https://www.coatcheckblog.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/coatcheckblog/" }
                    ],
                    link: "https://www.coatcheckblog.com/"
                },
                {
                    name: "Winter Wonderland",
                    focus: "Holiday and winter party fashion",
                    why: "Festive outfit inspiration for all your winter celebrations.",
                    social: [
                        { name: "Website", link: "https://www.winterwonderlandstyle.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/winterwonderlandstyle/" }
                    ],
                    link: "https://www.winterwonderlandstyle.com/"
                }
            ],
            summerfashion: [
                {
                    name: "The Summer Edit",
                    focus: "Hot weather style and breathable fabrics",
                    why: "Helps you stay cool and stylish during summer months.",
                    social: [
                        { name: "Website", link: "https://www.thesummeredit.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/thesummeredit/" }
                    ],
                    link: "https://www.thesummeredit.com/"
                },
                {
                    name: "Beach Please",
                    focus: "Vacation and resort wear",
                    why: "Specializes in stylish yet practical outfits for summer travel.",
                    social: [
                        { name: "Website", link: "https://www.beachpleaseblog.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/beachpleaseblog/" }
                    ],
                    link: "https://www.beachpleaseblog.com/"
                },
                {
                    name: "Sunny Style",
                    focus: "Summer accessories and sun protection",
                    why: "Focuses on completing summer looks with the right accessories and UV protection.",
                    social: [
                        { name: "Website", link: "https://www.sunnystyleblog.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/sunnystyleblog/" }
                    ],
                    link: "https://www.sunnystyleblog.com/"
                }
            ],
            streetwear: [
                {
                    name: "Hypebeast",
                    focus: "High-end streetwear and sneaker culture",
                    why: "The definitive source for streetwear news, collaborations, and drops from premium brands.",
                    social: [
                        { name: "Website", link: "https://hypebeast.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/hypebeast/" },
                        { name: "YouTube", link: "https://www.youtube.com/user/HYPEBEAST" }
                    ],
                    link: "https://hypebeast.com/"
                },
                {
                    name: "Highsnobiety",
                    focus: "Streetwear, fashion, and culture",
                    why: "Blends streetwear with high fashion and provides in-depth trend analysis.",
                    social: [
                        { name: "Website", link: "https://www.highsnobiety.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/highsnobiety/" },
                        { name: "Pinterest", link: "https://www.pinterest.com/highsnobiety/" }
                    ],
                    link: "https://www.highsnobiety.com/"
                },
                {
                    name: "The Hundreds",
                    focus: "Streetwear lifestyle and culture",
                    why: "Founded by streetwear pioneer Bobby Hundreds, offering authentic streetwear perspective.",
                    social: [
                        { name: "Website", link: "https://thehundreds.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/thehundreds/" }
                    ],
                    link: "https://thehundreds.com/"
                }
            ],
            sustainable: [
                {
                    name: "The Good Trade",
                    focus: "Sustainable and ethical fashion",
                    why: "Comprehensive guides to sustainable brands and conscious living.",
                    social: [
                        { name: "Website", link: "https://www.thegoodtrade.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/thegoodtrade/" },
                        { name: "Pinterest", link: "https://www.pinterest.com/thegoodtrade/" }
                    ],
                    link: "https://www.thegoodtrade.com/"
                },
                {
                    name: "Style with a Story",
                    focus: "Slow fashion and ethical brands",
                    why: "Beautifully showcases sustainable brands with transparent supply chains.",
                    social: [
                        { name: "Website", link: "https://stylewithastory.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/stylewithastory/" }
                    ],
                    link: "https://stylewithastory.com/"
                },
                {
                    name: "Sustainable Fashion Matterz",
                    focus: "Global sustainable fashion movement",
                    why: "Educational content about sustainable materials and production methods.",
                    social: [
                        { name: "Website", link: "https://www.sustainablefashionmatterz.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/sustainablefashionmatterz/" }
                    ],
                    link: "https://www.sustainablefashionmatterz.com/"
                }
            ],
            luxury: [
                {
                    name: "The Blonde Salad",
                    focus: "Luxury fashion and lifestyle",
                    why: "Founded by Chiara Ferragni, offers insider access to luxury fashion world.",
                    social: [
                        { name: "Website", link: "https://www.theblondesalad.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/theblondesalad/" },
                        { name: "YouTube", link: "https://www.youtube.com/user/theblondesalad" }
                    ],
                    link: "https://www.theblondesalad.com/"
                },
                {
                    name: "Man Repeller",
                    focus: "High fashion with a humorous twist",
                    why: "Makes luxury fashion approachable with witty commentary and styling tips.",
                    social: [
                        { name: "Website", link: "https://www.manrepeller.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/manrepeller/" }
                    ],
                    link: "https://www.manrepeller.com/"
                },
                {
                    name: "The Fashion Guitar",
                    focus: "Luxury fashion and street style",
                    why: "Beautiful photography and coverage of luxury fashion weeks worldwide.",
                    social: [
                        { name: "Website", link: "https://www.thefashionguitar.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/thefashionguitar/" }
                    ],
                    link: "https://www.thefashionguitar.com/"
                }
            ],
            vintage: [
                {
                    name: "Vintage Fashion Guild",
                    focus: "Vintage clothing identification and styling",
                    why: "Amazing resource for dating vintage pieces and authenticating finds.",
                    social: [
                        { name: "Website", link: "https://vintagefashionguild.org/" },
                        { name: "Instagram", link: "https://www.instagram.com/vintagefashionguild/" }
                    ],
                    link: "https://vintagefashionguild.org/"
                },
                {
                    name: "The Vintage Contessa",
                    focus: "1950s-1980s vintage fashion",
                    why: "Expert advice on sourcing and styling true vintage pieces.",
                    social: [
                        { name: "Website", link: "https://thevintagecontessa.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/thevintagecontessa/" }
                    ],
                    link: "https://thevintagecontessa.com/"
                },
                {
                    name: "Dead Fleurette",
                    focus: "Vintage and antique fashion",
                    why: "Specializes in rare antique clothing from Victorian to 1930s eras.",
                    social: [
                        { name: "Website", link: "https://deadfleurette.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/deadfleurette/" }
                    ],
                    link: "https://deadfleurette.com/"
                }
            ],
            minimalist: [
                {
                    name: "Un-Fancy",
                    focus: "Capsule wardrobes and minimalist style",
                    why: "Pioneered the capsule wardrobe movement with practical seasonal guides.",
                    social: [
                        { name: "Website", link: "https://www.un-fancy.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/unfancy/" }
                    ],
                    link: "https://www.un-fancy.com/"
                },
                {
                    name: "Style Bee",
                    focus: "Minimalist personal style",
                    why: "Shows how to build a versatile wardrobe with fewer, better pieces.",
                    social: [
                        { name: "Website", link: "https://stylebee.ca/" },
                        { name: "Instagram", link: "https://www.instagram.com/stylebee/" }
                    ],
                    link: "https://stylebee.ca/"
                },
                {
                    name: "Into Mind",
                    focus: "Minimalist wardrobe planning",
                    why: "Psychological approach to developing a personal minimalist style.",
                    social: [
                        { name: "Website", link: "https://into-mind.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/into_mind/" }
                    ],
                    link: "https://into-mind.com/"
                }
            ],
            bohemian: [
                {
                    name: "Bohemian Revolution",
                    focus: "Boho-chic fashion and lifestyle",
                    why: "Inspiration for flowing silhouettes, natural fabrics, and eclectic accessories.",
                    social: [
                        { name: "Website", link: "https://bohemianrevolution.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/bohemianrevolution/" }
                    ],
                    link: "https://bohemianrevolution.com/"
                },
                {
                    name: "Boho Luxe Home",
                    focus: "Bohemian fashion and decor",
                    why: "Blends fashion with interior design for complete boho lifestyle inspiration.",
                    social: [
                        { name: "Website", link: "https://www.boholuxehome.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/boholuxehome/" }
                    ],
                    link: "https://www.boholuxehome.com/"
                },
                {
                    name: "Gypsy Soul",
                    focus: "Modern bohemian style",
                    why: "Shows how to incorporate boho elements into contemporary wardrobes.",
                    social: [
                        { name: "Website", link: "https://www.gypsysoul.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/gypsysoul/" }
                    ],
                    link: "https://www.gypsysoul.com/"
                }
            ],
            professional: [
                {
                    name: "Corporette",
                    focus: "Corporate fashion for women",
                    why: "Practical advice for dressing professionally in various industries.",
                    social: [
                        { name: "Website", link: "https://corporette.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/corporette/" }
                    ],
                    link: "https://corporette.com/"
                },
                {
                    name: "The Professionalista",
                    focus: "Affordable workwear",
                    why: "Shows how to build a professional wardrobe on a budget.",
                    social: [
                        { name: "Website", link: "https://theprofessionalista.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/theprofessionalista/" }
                    ],
                    link: "https://theprofessionalista.com/"
                },
                {
                    name: "Putting Me Together",
                    focus: "Creative professional style",
                    why: "Helps bridge the gap between personal style and workplace appropriateness.",
                    social: [
                        { name: "Website", link: "https://puttingmetogether.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/puttingmetogether/" }
                    ],
                    link: "https://puttingmetogether.com/"
                }
            ],
            athleisure: [
                {
                    name: "The Skinny Confidential",
                    focus: "Athleisure and wellness",
                    why: "Trendy athleisure looks paired with health and wellness advice.",
                    social: [
                        { name: "Website", link: "https://www.theskinnyconfidential.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/theskinnyconfidential/" }
                    ],
                    link: "https://www.theskinnyconfidential.com/"
                },
                {
                    name: "Athleisure Mag",
                    focus: "Athleisure industry news",
                    why: "Covers the business and trends behind the athleisure movement.",
                    social: [
                        { name: "Website", link: "https://athleisuremag.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/athleisuremag/" }
                    ],
                    link: "https://athleisuremag.com/"
                },
                {
                    name: "Sweat Style",
                    focus: "Stylish activewear",
                    why: "Shows how to transition seamlessly from workout to everyday in athleisure.",
                    social: [
                        { name: "Website", link: "https://sweatstyle.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/sweatstyle/" }
                    ],
                    link: "https://sweatstyle.com/"
                }
            ],
            "plus size": [
                {
                    name: "Gabi Gregg",
                    focus: "Plus size fashion activism",
                    why: "Pioneer of the body positive movement with bold, stylish looks.",
                    social: [
                        { name: "Website", link: "https://gabifresh.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/gabifresh/" }
                    ],
                    link: "https://gabifresh.com/"
                },
                {
                    name: "The Curvy Fashionista",
                    focus: "Plus size style and shopping",
                    why: "Comprehensive resource for plus size fashion news and brand reviews.",
                    social: [
                        { name: "Website", link: "https://www.thecurvyfashionista.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/thecurvyfashionista/" }
                    ],
                    link: "https://www.thecurvyfashionista.com/"
                },
                {
                    name: "Nicolette Mason",
                    focus: "High fashion for plus sizes",
                    why: "Brings high fashion sensibility to plus size styling.",
                    social: [
                        { name: "Website", link: "https://www.nicolettemason.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/nicolettemason/" }
                    ],
                    link: "https://www.nicolettemason.com/"
                }
            ],
            menswear: [
                {
                    name: "He Spoke Style",
                    focus: "Classic menswear with modern twist",
                    why: "Excellent advice for building a timeless yet contemporary wardrobe.",
                    social: [
                        { name: "Website", link: "https://hespokestyle.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/hespokestyle/" }
                    ],
                    link: "https://hespokestyle.com/"
                },
                {
                    name: "The Modest Man",
                    focus: "Fashion for shorter/slimmer men",
                    why: "Specialized advice often overlooked by mainstream menswear blogs.",
                    social: [
                        { name: "Website", link: "https://www.themodestman.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/themodestman/" }
                    ],
                    link: "https://www.themodestman.com/"
                },
                {
                    name: "Gentleman's Gazette",
                    focus: "Classic and vintage menswear",
                    why: "In-depth guides to traditional men's style and etiquette.",
                    social: [
                        { name: "Website", link: "https://www.gentlemansgazette.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/gentlemansgazette/" }
                    ],
                    link: "https://www.gentlemansgazette.com/"
                }
            ],
            womenswear: [
                {
                    name: "Atlantic-Pacific",
                    focus: "Feminine yet powerful womenswear",
                    why: "Masterful mixing of prints and textures for elegant looks.",
                    social: [
                        { name: "Website", link: "https://atlantic-pacific.blogspot.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/blair_eadie/" }
                    ],
                    link: "https://atlantic-pacific.blogspot.com/"
                },
                {
                    name: "Song of Style",
                    focus: "Trend-driven womenswear",
                    why: "Beautifully curated outfits featuring the latest trends.",
                    social: [
                        { name: "Website", link: "https://www.songofstyle.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/songofstyle/" }
                    ],
                    link: "https://www.songofstyle.com/"
                },
                {
                    name: "The Chriselle Factor",
                    focus: "Modern feminine style",
                    why: "Sophisticated styling advice for professional women.",
                    social: [
                        { name: "Website", link: "https://thechrisellefactor.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/chrisellelim/" }
                    ],
                    link: "https://thechrisellefactor.com/"
                }
            ],
           
            accessories: [
                {
                    name: "Bag Snob",
                    focus: "Luxury handbags and accessories",
                    why: "Expert reviews and buying guides for high-end bags.",
                    social: [
                        { name: "Website", link: "https://www.bagsnob.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/bagsnob/" }
                    ],
                    link: "https://www.bagsnob.com/"
                },
                {
                    name: "The Jewelry Editor",
                    focus: "Fine jewelry trends and education",
                    why: "Beautifully showcases jewelry as wearable art.",
                    social: [
                        { name: "Website", link: "https://www.thejewelryeditor.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/thejewelryeditor/" }
                    ],
                    link: "https://www.thejewelryeditor.com/"
                },
                {
                    name: "Watch Anish",
                    focus: "Luxury watches",
                    why: "In-depth coverage of haute horology and watchmaking artistry.",
                    social: [
                        { name: "Website", link: "https://www.watchanish.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/watchanish/" }
                    ],
                    link: "https://www.watchanish.com/"
                }
            ],
            footwear: [
                {
                    name: "Sneaker News",
                    focus: "Sneaker culture and releases",
                    why: "The most comprehensive source for sneakerheads with global release info.",
                    social: [
                        { name: "Website", link: "https://www.sneakernews.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/sneakernews/" },
                        { name: "YouTube", link: "https://www.youtube.com/user/SneakerNewsTV" }
                    ],
                    link: "https://www.sneakernews.com/"
                },
                {
                    name: "The Shoe Girl",
                    focus: "Luxury footwear",
                    why: "Expert reviews and styling tips for high-end shoes.",
                    social: [
                        { name: "Website", link: "https://www.theshoegirl.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/theshoegirl/" }
                    ],
                    link: "https://www.theshoegirl.com/"
                },
                {
                    name: "Boots and Blazers",
                    focus: "Boots and formal footwear",
                    why: "Specializes in quality boots and how to pair them with different outfits.",
                    social: [
                        { name: "Website", link: "https://www.bootsandblazers.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/bootsandblazers/" }
                    ],
                    link: "https://www.bootsandblazers.com/"
                }
            ],
            beauty: [
                {
                    name: "Into The Gloss",
                    focus: "Beauty routines and products",
                    why: "Peek into the beauty routines of celebrities and industry insiders.",
                    social: [
                        { name: "Website", link: "https://intothegloss.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/intothegloss/" }
                    ],
                    link: "https://intothegloss.com/"
                },
                {
                    name: "Temptalia",
                    focus: "Makeup reviews and dupes",
                    why: "Extensive makeup database with swatches and dupe suggestions.",
                    social: [
                        { name: "Website", link: "https://www.temptalia.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/temptalia/" }
                    ],
                    link: "https://www.temptalia.com/"
                },
                {
                    name: "The Klog",
                    focus: "Korean beauty and skincare",
                    why: "Expert guide to K-beauty products and multi-step routines.",
                    social: [
                        { name: "Website", link: "https://theklog.co/" },
                        { name: "Instagram", link: "https://www.instagram.com/theklog/" }
                    ],
                    link: "https://theklog.co/"
                }
            ],
            trends: [
                {
                    name: "WGSN",
                    focus: "Fashion trend forecasting",
                    why: "Industry-leading trend predictions with comprehensive reports.",
                    social: [
                        { name: "Website", link: "https://www.wgsn.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/wgsn/" }
                    ],
                    link: "https://www.wgsn.com/"
                },
                {
                    name: "Fashion Snoops",
                    focus: "Global trend analysis",
                    why: "Insightful trend forecasting across multiple fashion categories.",
                    social: [
                        { name: "Website", link: "https://www.fashionsnoops.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/fashionsnoops/" }
                    ],
                    link: "https://www.fashionsnoops.com/"
                },
                {
                    name: "Trendland",
                    focus: "Emerging trends and inspiration",
                    why: "Curates cutting-edge trends across fashion, art and design.",
                    social: [
                        { name: "Website", link: "https://trendland.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/trendland/" }
                    ],
                    link: "https://trendland.com/"
                }
            ],
            budget: [
                {
                    name: "The Budget Babe",
                    focus: "Affordable fashion finds",
                    why: "Proves great style doesn't require a huge budget.",
                    social: [
                        { name: "Website", link: "https://www.thebudgetbabe.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/thebudgetbabe/" }
                    ],
                    link: "https://www.thebudgetbabe.com/"
                },
                {
                    name: "Thrifted",
                    focus: "Thrifting tips and tricks",
                    why: "Expert advice for scoring the best secondhand finds.",
                    social: [
                        { name: "Website", link: "https://www.thrifted.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/thrifted/" }
                    ],
                    link: "https://www.thrifted.com/"
                },
                {
                    name: "The Penny Pincher Fashionista",
                    focus: "Discount fashion and sales",
                    why: "Tracks the best deals and sales from major retailers.",
                    social: [
                        { name: "Website", link: "https://www.pennypincherfashion.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/pennypincherfashion/" }
                    ],
                    link: "https://www.pennypincherfashion.com/"
                }
            ],
            celebrity: [
                {
                    name: "Who What Wear",
                    focus: "Celebrity style and shopping",
                    why: "Shows how to get celebrity looks at various price points.",
                    social: [
                        { name: "Website", link: "https://www.whowhatwear.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/whowhatwear/" }
                    ],
                    link: "https://www.whowhatwear.com/"
                },
                {
                    name: "The Blonde Salad",
                    focus: "Celebrity-inspired fashion",
                    why: "Founded by influencer Chiara Ferragni with insider access.",
                    social: [
                        { name: "Website", link: "https://www.theblondesalad.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/theblondesalad/" }
                    ],
                    link: "https://www.theblondesalad.com/"
                },
                {
                    name: "Red Carpet Fashion Awards",
                    focus: "Awards show fashion critique",
                    why: "Expert analysis of celebrity red carpet looks with letter grades.",
                    social: [
                        { name: "Website", link: "https://www.redcarpet-fashionawards.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/redcarpetfashionawards/" }
                    ],
                    link: "https://www.redcarpet-fashionawards.com/"
                }
            ],
            diy: [
                {
                    name: "A Beautiful Mess",
                    focus: "DIY fashion and crafts",
                    why: "Creative projects for customizing and personalizing clothing.",
                    social: [
                        { name: "Website", link: "https://abeautifulmess.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/abeautifulmess/" }
                    ],
                    link: "https://abeautifulmess.com/"
                },
                {
                    name: "Merrick's Art",
                    focus: "Sewing and refashioning",
                    why: "Step-by-step tutorials for altering and upcycling clothing.",
                    social: [
                        { name: "Website", link: "https://www.merricksart.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/merricksart/" }
                    ],
                    link: "https://www.merricksart.com/"
                },
                {
                    name: "The House That Lars Built",
                    focus: "Ambitious DIY fashion projects",
                    why: "Pushes creative boundaries with innovative clothing DIYs.",
                    social: [
                        { name: "Website", link: "https://www.thehousethatlarsbuilt.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/thehousethatlarsbuilt/" }
                    ],
                    link: "https://www.thehousethatlarsbuilt.com/"
                }
            ],
            travel: [
                {
                    name: "Travel Fashion Girl",
                    focus: "Packing and travel outfits",
                    why: "Expert advice on creating versatile travel wardrobes.",
                    social: [
                        { name: "Website", link: "https://www.travelfashiongirl.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/travelfashiongirl/" }
                    ],
                    link: "https://www.travelfashiongirl.com/"
                },
                {
                    name: "Hippie in Heels",
                    focus: "Destination-specific style",
                    why: "Shows what to wear in different climates and cultures.",
                    social: [
                        { name: "Website", link: "https://hippie-inheels.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/hippieinheels/" }
                    ],
                    link: "https://hippie-inheels.com/"
                },
                {
                    name: "The Blonde Abroad",
                    focus: "Stylish travel photography",
                    why: "Beautiful outfit inspiration against global backdrops.",
                    social: [
                        { name: "Website", link: "https://www.theblondeabroad.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/theblondeabroad/" }
                    ],
                    link: "https://www.theblondeabroad.com/"
                }
            ],
            wedding: [
                {
                    name: "Brides",
                    focus: "Comprehensive wedding planning and bridal fashion",
                    why: "Covers everything from dresses to venues with real wedding inspiration.",
                    social: [
                        { name: "Website", link: "https://www.brides.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/brides/" },
                        { name: "Pinterest", link: "https://www.pinterest.com/brides/" }
                    ],
                    link: "https://www.brides.com/"
                },
                {
                    name: "Martha Stewart Weddings",
                    focus: "Elegant and timeless wedding inspiration",
                    why: "Classic wedding ideas with attention to detail and sophisticated aesthetics.",
                    social: [
                        { name: "Website", link: "https://www.marthastewartweddings.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/msweddings/" },
                        { name: "YouTube", link: "https://www.youtube.com/user/MarthaStewart" }
                    ],
                    link: "https://www.marthastewartweddings.com/"
                },
                {
                    name: "The Knot",
                    focus: "Wedding planning and inspiration",
                    why: "All-in-one resource for wedding planning with vendor recommendations.",
                    social: [
                        { name: "Website", link: "https://www.theknot.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/theknot/" },
                        { name: "Pinterest", link: "https://www.pinterest.com/theknot/" }
                    ],
                    link: "https://www.theknot.com/"
                },
                {
                    name: "Wedding Wire",
                    focus: "Wedding planning tools and vendor reviews",
                    why: "Helpful for finding and reviewing wedding vendors in your area.",
                    social: [
                        { name: "Website", link: "https://www.weddingwire.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/weddingwire/" }
                    ],
                    link: "https://www.weddingwire.com/"
                },
                {
                    name: "Green Wedding Shoes",
                    focus: "Alternative and creative weddings",
                    why: "Showcases unique, non-traditional wedding ideas and styles.",
                    social: [
                        { name: "Website", link: "https://greenweddingshoes.com/" },
                        { name: "Instagram", link: "https://www.instagram.com/greenweddingshoes/" }
                    ],
                    link: "https://greenweddingshoes.com/"
                }
            ],
        };
        // Return data for the requested category or empty array if not found
        return mockData[category] || [];
    }
});
       