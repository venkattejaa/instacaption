/**
 * AI Instagram Caption Generator - Application Logic
 * Powered by NVIDIA NIM Cloud Inference APIs
 */

function initApplication() {
  // --- UI Elements ---
  const btnOpenSettings = document.getElementById('btn-open-settings');
  const btnCloseApiModal = document.getElementById('btn-close-api-modal');
  const btnCancelApi = document.getElementById('btn-cancel-api');
  const btnSaveApi = document.getElementById('btn-save-api');
  const apiModal = document.getElementById('api-modal');
  const apiKeyInput = document.getElementById('api-key-input');
  const btnToggleKeyVisibility = document.getElementById('btn-toggle-key-visibility');
  const eyeIcon = document.getElementById('eye-icon');
  
  const keyStatusDot = document.getElementById('key-status-dot');
  const keyStatusText = document.getElementById('key-status-text');
  
  const toneGrid = document.getElementById('tone-grid');
  const btnGenerateCaptions = document.getElementById('btn-generate-captions');
  const btnRegenerateCaptions = document.getElementById('btn-regenerate-captions');
  const btnEmptyGenerate = document.getElementById('btn-empty-generate');
  
  const emptyStateView = document.getElementById('empty-state-view');
  const loadingStateView = document.getElementById('loading-state-view');
  const captionsGridView = document.getElementById('captions-grid-view');
  
  const btnToggleFavorites = document.getElementById('btn-toggle-favorites');
  const favoritesCountDisplay = document.getElementById('favorites-count');
  
  // Instagram Preview Elements
  const previewModal = document.getElementById('preview-modal');
  const btnClosePreviewModal = document.getElementById('btn-close-preview-modal');
  const btnClosePreviewFooter = document.getElementById('btn-close-preview-footer');
  const previewUsername = document.getElementById('preview-username');
  const previewCaptionUsername = document.getElementById('preview-caption-username');
  const previewUserInitials = document.getElementById('preview-user-initials');
  const previewCaptionText = document.getElementById('preview-caption-text');
  const previewCaptionCta = document.getElementById('preview-caption-cta');
  const previewCaptionHashtags = document.getElementById('preview-caption-hashtags');
  const postImageContainer = document.getElementById('post-image-container');
  const previewImageUpload = document.getElementById('preview-image-upload');
  const previewPostImg = document.getElementById('preview-post-img');
  const imageUploadPrompt = document.getElementById('image-upload-prompt');
  const previewBtnLike = document.getElementById('preview-btn-like');
  const previewHeartIcon = document.getElementById('preview-heart-icon');
  const previewLikesCount = document.getElementById('preview-likes-count');
  
  const toastContainer = document.getElementById('toast-container');
  
  // Inputs
  const inputBusinessName = document.getElementById('business-name');
  const inputDescription = document.getElementById('business-description');
  const inputTargetAudience = document.getElementById('target-audience');
  const selectLanguage = document.getElementById('language-select');
  const selectModel = document.getElementById('model-select');

  // --- State Variables ---
  let apiKey = localStorage.getItem('nvidia_nim_api_key') || '';
  let selectedTone = 'Casual';
  let generatedCaptions = [];
  let favoriteCaptions = JSON.parse(localStorage.getItem('insta_favorites')) || [];
  let isViewingFavorites = false;
  let simulatedLikes = 1248;
  let isLiked = false;
  
  // --- Mobile Tab Switcher Logic ---
  const mobileTabs = document.querySelectorAll('.mobile-tab');
  const appContainer = document.querySelector('.app-container');
  const mobileBadge = document.getElementById('mobile-badge');

  mobileTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.getAttribute('data-tab');
      
      // Update active tab buttons
      mobileTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Update app container class
      appContainer.classList.remove('tab-sidebar', 'tab-dashboard', 'tab-preview');
      appContainer.classList.add(`tab-${targetTab}`);
    });
  });

  function switchToDashboardTab() {
    const dashboardTabBtn = document.querySelector('.mobile-tab[data-tab="dashboard"]');
    if (dashboardTabBtn) {
      dashboardTabBtn.click();
    }
  }

  function switchToSidebarTab() {
    const sidebarTabBtn = document.querySelector('.mobile-tab[data-tab="sidebar"]');
    if (sidebarTabBtn) {
      sidebarTabBtn.click();
    }
  }

  function switchToPreviewTab() {
    const previewTabBtn = document.querySelector('.mobile-tab[data-tab="preview"]');
    if (previewTabBtn) {
      previewTabBtn.click();
    }
  }

  // --- Initialization ---
  function init() {
    updateApiKeyStatus();
    updateFavoritesCount();
    
    // Set up option card grid clicks
    const toneCards = toneGrid.querySelectorAll('.option-card');
    toneCards.forEach(card => {
      card.addEventListener('click', () => {
        toneCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedTone = card.dataset.tone;
      });
    });

    // Check if key is available, warn user if not
    if (!apiKey) {
      showToast('Welcome! Please add your NVIDIA API key in Settings to get started.', 'info');
    }
  }

  // --- API Key Management ---
  btnOpenSettings.addEventListener('click', () => {
    apiKeyInput.value = apiKey;
    apiModal.classList.add('active');
  });

  function closeApiSettings() {
    apiModal.classList.remove('active');
  }

  btnCloseApiModal.addEventListener('click', closeApiSettings);
  btnCancelApi.addEventListener('click', closeApiSettings);

  btnSaveApi.addEventListener('click', () => {
    const enteredKey = apiKeyInput.value.trim();
    if (!enteredKey) {
      localStorage.removeItem('nvidia_nim_api_key');
      apiKey = '';
      showToast('API Key removed.', 'info');
    } else {
      localStorage.setItem('nvidia_nim_api_key', enteredKey);
      apiKey = enteredKey;
      showToast('Settings saved successfully!', 'success');
    }
    updateApiKeyStatus();
    closeApiSettings();
  });

  btnToggleKeyVisibility.addEventListener('click', () => {
    if (apiKeyInput.type === 'password') {
      apiKeyInput.type = 'text';
      eyeIcon.setAttribute('data-lucide', 'eye-off');
    } else {
      apiKeyInput.type = 'password';
      eyeIcon.setAttribute('data-lucide', 'eye');
    }
    lucide.createIcons({
      attrs: { id: 'eye-icon' },
      nameAttr: 'data-lucide'
    });
  });

  function updateApiKeyStatus() {
    if (apiKey) {
      keyStatusDot.className = 'status-dot active';
      keyStatusText.textContent = 'API Key Configured';
      keyStatusText.style.color = 'var(--success)';
    } else {
      keyStatusDot.className = 'status-dot inactive';
      keyStatusText.textContent = 'API Key Missing';
      keyStatusText.style.color = 'var(--text-muted)';
    }
  }

  // --- Favorites Toggler ---
  btnToggleFavorites.addEventListener('click', () => {
    if (isViewingFavorites) {
      // Toggle back to dashboard mode
      isViewingFavorites = false;
      btnToggleFavorites.classList.remove('active');
      btnToggleFavorites.querySelector('span').textContent = `View Favorites (${favoriteCaptions.length})`;
      
      if (generatedCaptions.length > 0) {
        showView('grid');
        renderCaptions(generatedCaptions);
      } else {
        showView('empty');
      }
    } else {
      // Go to favorites view
      if (favoriteCaptions.length === 0) {
        showToast('You have no saved favorites yet!', 'info');
        return;
      }
      isViewingFavorites = true;
      btnToggleFavorites.classList.add('active');
      btnToggleFavorites.querySelector('span').textContent = 'Back to Results';
      showView('grid');
      renderCaptions(favoriteCaptions);
    }
  });

  function updateFavoritesCount() {
    favoritesCountDisplay.textContent = favoriteCaptions.length;
    if (isViewingFavorites) {
      btnToggleFavorites.querySelector('span').textContent = 'Back to Results';
    } else {
      btnToggleFavorites.querySelector('span').textContent = `View Favorites (${favoriteCaptions.length})`;
    }
  }

  function toggleFavorite(caption, cardBtn) {
    const index = favoriteCaptions.findIndex(fav => fav.textSignature === caption.textSignature);
    
    if (index > -1) {
      // Remove from favorites
      favoriteCaptions.splice(index, 1);
      cardBtn.classList.remove('active');
      showToast('Removed from Favorites', 'info');
    } else {
      // Add to favorites
      favoriteCaptions.push(caption);
      cardBtn.classList.add('active');
      showToast('Saved to Favorites!', 'success');
    }
    
    localStorage.setItem('insta_favorites', JSON.stringify(favoriteCaptions));
    updateFavoritesCount();

    // If we're viewing favorites, re-render immediately to reflect deletion
    if (isViewingFavorites) {
      if (favoriteCaptions.length === 0) {
        isViewingFavorites = false;
        btnToggleFavorites.classList.remove('active');
        if (generatedCaptions.length > 0) {
          renderCaptions(generatedCaptions);
        } else {
          showView('empty');
        }
      } else {
        renderCaptions(favoriteCaptions);
      }
    }
  }

  // --- Views Controller ---
  function showView(view) {
    emptyStateView.style.display = 'none';
    loadingStateView.style.display = 'none';
    captionsGridView.style.display = 'none';

    if (view === 'empty') {
      emptyStateView.style.display = 'flex';
      btnRegenerateCaptions.disabled = true;
    } else if (view === 'loading') {
      loadingStateView.style.display = 'flex';
      btnRegenerateCaptions.disabled = true;
    } else if (view === 'grid') {
      captionsGridView.style.display = 'grid';
      btnRegenerateCaptions.disabled = false;
    }
  }

  btnEmptyGenerate.addEventListener('click', () => {
    switchToSidebarTab();
    setTimeout(() => {
      inputBusinessName.scrollIntoView({ behavior: 'smooth', block: 'center' });
      inputBusinessName.focus();
    }, 150);
  });

  // --- Diagnostics Console Logger ---
  function logToConsole(message) {
    const consoleLines = document.getElementById('console-lines');
    if (!consoleLines) return;
    const logLine = document.createElement('div');
    logLine.className = 'log-line';
    logLine.textContent = message;
    consoleLines.appendChild(logLine);
    consoleLines.scrollTop = consoleLines.scrollHeight;
    
    while (consoleLines.children.length > 8) {
      consoleLines.removeChild(consoleLines.firstChild);
    }
  }

  // --- Generation Logic ---
  btnGenerateCaptions.addEventListener('click', generateCaptions);
  btnRegenerateCaptions.addEventListener('click', generateCaptions);

  async function generateCaptions() {
    // Validate inputs
    const businessName = inputBusinessName.value.trim();
    const description = inputDescription.value.trim();
    const audience = inputTargetAudience.value.trim() || 'General Instagram audience';
    const language = selectLanguage.value;
    
    // Cyber model mapping to keep model names hidden from user
    const modelValue = selectModel.value;
    const modelMapping = {
      'hyperion': 'meta/llama-3.1-70b-instruct',
      'synapse': 'nvidia/llama-3.1-nemotron-70b-instruct',
      'apex': 'meta/llama-3.1-8b-instruct'
    };
    const model = modelMapping[modelValue] || 'meta/llama-3.1-70b-instruct';

    if (!businessName || !description) {
      showToast('Please fill out the brand name and description!', 'error');
      return;
    }

    if (!apiKey) {
      // No API key — skip API call, go straight to local engine
      switchToDashboardTab();
      showView('loading');
      resetLoadingSteps();
      logToConsole("[SYS-CORE]: No API key detected. Booting Local Copywriting Core...");
      const stepsCancel = animateLoadingSteps();
      
      try {
        const mockCaptions = generateMockCaptions(businessName, description, audience, selectedTone, language);
        generatedCaptions = mockCaptions;
        isViewingFavorites = false;
        btnToggleFavorites.classList.remove('active');
        stepsCancel(true);
        
        setTimeout(() => {
          showView('grid');
          renderCaptions(generatedCaptions);
          if (mobileBadge) {
            mobileBadge.textContent = generatedCaptions.length;
            mobileBadge.style.display = 'inline-flex';
          }
          showToast('10 captions generated! Add an API key in Settings for AI-powered results.', 'info');
        }, 1200);
      } catch (fallbackErr) {
        stepsCancel(false);
        setTimeout(() => {
          showView('empty');
          showToast(`Generation Failed: ${fallbackErr.message}`, 'error');
        }, 800);
      }
      return;
    }

    // Switch mobile tab to dashboard for immediate feedback
    switchToDashboardTab();

    // Switch to Loading View
    showView('loading');
    resetLoadingSteps();
    logToConsole(`[SYS-CORE]: Activating ${modelValue.toUpperCase()}...`);
    logToConsole("[SYS-SYNC]: Porting brand parameters...");

    // Start UI simulated loading process
    const stepsCancel = animateLoadingSteps();

    try {
      // Build structured system prompts
      const systemMessage = `You are a world-class professional Instagram Copywriter and Brand Growth Specialist. 
Your ultimate goal is to write highly engaging, brand-specific Instagram captions that generate clicks, engagement, likes, and sales.

You must generate EXACTLY 10 distinct, original captions in the language specified: ${language}.
For multilingual languages like Hindi and Telugu, translate all sentences to that target language/script perfectly. For Hinglish, write casual Hindi written in the Roman alphabet mixed with English words as spoken by young urban Indians.

Each of the 10 captions must follow the designated brand guidelines but vary in their copy layout and writing style to appeal to different readers:
- Style 1: Hook-focused (extremely punchy opening sentence)
- Style 2: Storytelling-driven (emotion-based, narrative arc)
- Style 3: Engagement Question (interactive prompt to comment)
- Style 4: Minimalist / Punchy (under 2 lines, very sharp)
- Style 5: FOMO / Promotional (focus on limited offer, discount, or direct sale)
- Style 6: Explainer / Value Add (sharing a helpful tip or product secret)
- Style 7: Relatable & Funny (humor, lighthearted banter)
- Style 8: Behind-the-scenes / Authentic (brand identity, personal touch)
- Style 9: Quote/Statement (aspirational, heavy lifestyle focus)
- Style 10: Ultimate Call-To-Action (direct, simple, conversion optimized)

Each caption must contain 4 specific parts and be formatted strictly as a JSON array.
CRITICAL: Do not write any normal paragraphs, pre-text, explanation or closing text. Write ONLY the raw JSON output.
JSON Structure template to follow:
[
  {
    "number": 1,
    "badge": "Style/Angle Description",
    "hook": "An attention-grabbing first line!",
    "body": "The body content written in the specified tone and target language.",
    "callToAction": "A bold Instagram call-to-action (e.g. Tap link in bio, DM us).",
    "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"]
  }
]`;

      const userMessage = `Business Name: ${businessName}
Product/Service Description: ${description}
Target Audience: ${audience}
Desired Tone: ${selectedTone}
Selected Language: ${language}

Generate 10 outstanding, conversion-optimized Instagram captions matching this details in JSON array format. Make sure the hashtags are trending, clean, and highly relevant. Include the "badge" indicating its layout style.`;

      // Call NVIDIA NIM API Endpoint
      const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.7,
          max_tokens: 3000,
          top_p: 0.9
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status} Error calling NVIDIA API`);
      }

      const result = await response.json();
      const rawText = result.choices[0]?.message?.content || '';
      logToConsole("[SYS-RECV]: Payload downloaded.");
      
      // Parse the response
      const parsedCaptions = parseAIOutput(rawText);
      
      if (!parsedCaptions || parsedCaptions.length === 0) {
        throw new Error("Unable to parse a valid list of captions from the AI's response.");
      }

      logToConsole("[SYS-SUCCESS]: Caption matrices rendered!");

      // Generation successful
      generatedCaptions = parsedCaptions;
      isViewingFavorites = false;
      btnToggleFavorites.classList.remove('active');
      
      // Complete loading steps instantly
      stepsCancel(true);
      
      setTimeout(() => {
        showView('grid');
        renderCaptions(generatedCaptions);
        if (mobileBadge) {
          mobileBadge.textContent = generatedCaptions.length;
          mobileBadge.style.display = 'inline-flex';
        }
        showToast('Generated 10 captions instantly!', 'success');
      }, 500);

    } catch (err) {
      console.warn("NVIDIA NIM Cloud offline or authorization pending. Loading custom local engine:", err);
      logToConsole("[SYS-WARN]: Direct connection pending. Booting Local Copywriting Core...");
      
      try {
        const mockCaptions = generateMockCaptions(businessName, description, audience, selectedTone, language);
        generatedCaptions = mockCaptions;
        isViewingFavorites = false;
        btnToggleFavorites.classList.remove('active');
        
        // Complete loader steps
        stepsCancel(true);
        
        setTimeout(() => {
          showView('grid');
          renderCaptions(generatedCaptions);
          if (mobileBadge) {
            mobileBadge.textContent = generatedCaptions.length;
            mobileBadge.style.display = 'inline-flex';
          }
          showToast('Offline fallback: 10 customized captions ready!', 'success');
        }, 800);
      } catch (fallbackErr) {
        stepsCancel(false);
        logToConsole(`[SYS-ERROR]: Core exception: ${fallbackErr.message.slice(0, 30)}...`);
        
        setTimeout(() => {
          showView('empty');
          showToast(`Generation Failed: ${fallbackErr.message}`, 'error');
        }, 800);
      }
    }
  }

  // --- Local Fallback Copywriting Engine ---
  function generateMockCaptions(businessName, description, audience, tone, language) {
    const angles = [
      { badge: "Hook-Focused", type: "hook" },
      { badge: "Storytelling", type: "story" },
      { badge: "Interactive Question", type: "question" },
      { badge: "Punchy Minimalist", type: "minimalist" },
      { badge: "Sales / Promotion", type: "promo" },
      { badge: "Value Secret / Explainer", type: "explainer" },
      { badge: "Humorous / Fun Vibe", type: "funny" },
      { badge: "Behind The Scenes", type: "bts" },
      { badge: "Aspirational Quote", type: "quote" },
      { badge: "Direct Conversion CTA", type: "conversion" }
    ];

    const descWords = description.toLowerCase().split(/[\s,.-]+/).filter(w => w.length > 3);
    const keywords = descWords.length > 0 ? descWords.slice(0, 3) : ['lifestyle', 'aesthetic', 'premium'];
    
    const baseTags = ['#viral', '#aesthetic', '#growth', `#${businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}`, ...keywords.map(k => `#${k}`)];
    const tags = Array.from(new Set(baseTags)).slice(0, 5);

    return angles.map((angle, index) => {
      let hook = "";
      let body = "";
      let cta = "";
      const num = index + 1;
      
      if (language.includes('Hindi')) {
        switch (angle.type) {
          case 'hook':
            hook = `✨ क्या आपने ${businessName} को अभी तक ट्राई किया?`;
            body = `अगर आप अपने लिए बेहतरीन ${description} ढूंढ रहे हैं, तो आपकी तलाश यहाँ खत्म होती है। हमारी हर चीज़ सिर्फ और सिर्फ आपके लिए बनी है।`;
            cta = `आज ही हमसे जुड़ें और ऑर्डर करने के लिए DM करें! 📩`;
            break;
          case 'story':
            hook = `❤️ एक छोटा सा सपना और ढेर सारा प्यार...`;
            body = `जब हमने ${businessName} की शुरुआत की थी, तब बस एक ही मक़सद था - आपको बेहतरीन ${description} देना। आज आपका प्यार हमें हर दिन नया करने की हिम्मत देता है।`;
            cta = `बायो में दिए गए लिंक पर क्लिक करें और हमारी कहानी का हिस्सा बनें! ✨`;
            break;
          case 'question':
            hook = `🤔 आपका पसंदीदा ${keywords[0] || 'स्टाइल'} कौन सा है?`;
            body = `${businessName} के साथ अपने दिन को और भी ख़ास बनाएं। ${description} के बारे में आपकी क्या राय है, हमें ज़रूर बताएं!`;
            cta = `नीचे कमेंट्स में अपने विचार शेयर करें! 👇`;
            break;
          case 'minimalist':
            hook = `💫 सादगी में ही असली ख़ूबसूरती है।`;
            body = `${businessName} का नया कलेक्शन - बेहतरीन ${description} जो आपका दिल जीत लेगा।`;
            cta = `जल्दी करें, बायो लिंक से अभी ऑर्डर करें! 🛍️`;
            break;
          case 'promo':
            hook = `🚨 स्पेशल ऑफर अलर्ट! सिर्फ सीमित समय के लिए!`;
            body = `पाएं सबसे शानदार ${description} सिर्फ ${businessName} पर। ऐसा मौका बार-बार नहीं मिलता!`;
            cta = `ऑफ़र का लाभ उठाने के लिए अभी 'SHOP NOW' बटन दबाएं! 🏃‍♂️`;
            break;
          case 'explainer':
            hook = `💡 क्या आप जानते हैं? इसके पीछे का असली सच:`;
            body = `हमारा ${description} क्यों है सबसे अलग? क्योंकि हम इस्तेमाल करते हैं 100% शुद्ध और जैविक चीज़ें, जो आपके लिए बेहद सुरक्षित हैं।`;
            cta = `अधिक जानने के लिए हमारी वेबसाइट विज़िट करें! 🌐`;
            break;
          case 'funny':
            hook = `🤪 जब आप ${description} के बिना रहने की कोशिश करते हैं...`;
            body = `लेकिन फिर आपको याद आता है कि ${businessName} तो बस एक क्लिक की दूरी पर है! खुद को ज़्यादा परेशान मत कीजिए।`;
            cta = `बिना सोचे अभी ऑर्डर करने के लिए हमें DM करें! 😂`;
            break;
          case 'bts':
            hook = `👩‍🎨 पर्दे के पीछे: जहाँ जादू सच होता है!`;
            body = `देखिए कैसे हम प्यार से आपका पसंदीदा ${description} तैयार करते हैं। ${businessName} में क्वालिटी ही हमारी पहचान है।`;
            cta = `पूरी वीडियो देखने के लिए हमारी रील्स चेक करें! 🎬`;
            break;
          case 'quote':
            hook = `🌟 "अपने हर दिन को ख़ास बनाना आपके हाथ में है।"`;
            body = `${businessName} के साथ अपने लाइफस्टाइल को एक नया मोड़ दें। बेहतरीन ${description} के साथ हर पल को एन्जॉय करें।`;
            cta = `आज ही अपने लिए ऑर्डर करें! ✨`;
            break;
          case 'conversion':
            hook = `🔥 इंतज़ार किस बात का? अभी ऑर्डर करें!`;
            body = `आपका पसंदीदा ${description} अब स्टॉक में उपलब्ध है। ${businessName} की क्वालिटी पर भरोसा करें।`;
            cta = `बायो में दिए गए लिंक पर क्लिक करके आज ही खरीदें! 🛒`;
            break;
        }
      } else if (language.includes('Telugu')) {
        switch (angle.type) {
          case 'hook':
            hook = `✨ మీరు ఇంకా ${businessName} ని ట్రై చేయలేదా?`;
            body = `మీరు ఒక అద్భుతమైన ${description} కోసం చూస్తున్నట్లయితే, మీ అన్వేషణ ఇక్కడితో ముగిసింది. మీ కోసమే ప్రత్యేకం!`;
            cta = `ఈరోజే ఆర్డర్ చేయడానికి మాకు DM చేయండి! 📩`;
            break;
          case 'story':
            hook = `❤️ ఒక చిన్న కల... ఎంతో ప్రేమతో...`;
            body = `మేము ${businessName} ప్రారంభించినప్పుడు ఒకే ఆశయం - మీకు అత్యుత్తమ ${description} అందించడం. మీ నమ్మకమే మా బలం.`;
            cta = `మా బయో లోని లింక్‌ని క్లిక్ చేసి మరిన్ని వివరాలు తెలుసుకోండి! ✨`;
            break;
          case 'question':
            hook = `🤔 మీ ఫేవరెట్ ${keywords[0] || 'స్టైల్'} ఏది?`;
            body = `${businessName} మీ దినచర్యను మరింత ప్రత్యేకం చేస్తుంది. ${description} పై మీ అభిప్రాయాన్ని మాతో పంచుకోండి!`;
            cta = `క్రింద కామెంట్ చేయండి! 👇`;
            break;
          case 'minimalist':
            hook = `💫 అందం మరియు నాణ్యత ఒకే చోట!`;
            body = `${businessName} నుండి సరికొత్త ${description} మీ కోసం సిద్ధంగా ఉంది.`;
            cta = `ఇప్పుడే కొనుగోలు చేయడానికి లింక్ క్లిక్ చేయండి! 🛍️`;
            break;
          case 'promo':
            hook = `🚨 పరిమిత సమయం మాత్రమే! అద్భుతమైన ఆఫర్!`;
            body = `అत्यుత్తమ ${description} ఇప్పుడు ప్రత్యేక ధరలకే పొందండి. కేవలం ${businessName} లో మాత్రమే!`;
            cta = `ఆఫర్ ముగిసేలోపే ఇప్పుడే ఆర్డర్ చేయండి! 🏃‍♂️`;
            break;
          case 'explainer':
            hook = `💡 మీకు ఈ విషయం తెలుసా?`;
            body = `మా ${description} ఎందుకు అంత ప్రత్యేకం? ఎందుకంటే మేము కేవలం సహజసిద్ధమైన పద్ధతులను మాత్రమే ఉపయోగిస్తాము.`;
            cta = `మరిన్ని వివరాల కోసం మా వెబ్‌సైట్ సందర్శించండి! 🌐`;
            break;
          case 'funny':
            hook = `🤪 ${description} లేని రోజు ఎలా ఉంటుందో తెలుసా?`;
            body = `కానీ అదృష్టవశాత్తూ ${businessName} మీ చెంతనే ఉంది! మీ టెన్షన్లన్నీ వదిలేयండి.`;
            cta = `ఇప్పుడే ఆర్డర్ చేసి హ్యాపీగా ఉండండి! 😂`;
            break;
          case 'bts':
            hook = `👩‍🎨 తెరవెనుక దృశ్యాలు: నాణ్యత మా బాధ్యత!`;
            body = `మేము మీ ఫేవరెట్ ${description} ని ఎలా తయారుచేస్తామో చూడండి. ${businessName} లో ప్రతిదీ అద్భుతమే!`;
            cta = `మరిన్ని ఆసక్తికరమైన వీడియోల కోసం రీల్స్ చూడండి! 🎬`;
            break;
          case 'quote':
            hook = `🌟 "నాణ్యమైన జీవితానికి నాణ్యమైన ఎంపిక ముఖ్యం."`;
            body = `${businessName} తో మీ జీవనశైలిని మార్చుకోండి. అద్భుతమైన ${description} తో మీ రోజును ఎంజాయ్ చేయండి.`;
            cta = `ఈరోజే మీ ప్యాక్ బుక్ చేసుకోండి! ✨`;
            break;
          case 'conversion':
            hook = `🔥 ఆలస్యం చేయకండి! ఇప్పుడే సొంతం చేసుకోండి!`;
            body = `మీకు నచ్చిన ${description} ఇప్పుడు స్టాక్‌లో సిద్ధంగా ఉంది. ${businessName} ని నమ్మండి.`;
            cta = `బయో లోని లింక్ ద్వారా ఇప్పుడే షాపింగ్ చేయండి! 🛒`;
            break;
        }
      } else if (language.includes('Hinglish')) {
        switch (angle.type) {
          case 'hook':
            hook = `✨ Guys, have you tried ${businessName} yet?`;
            body = `Agar aap super cool aur reliable ${description} dhoodh rahe ho, toh stop searching! This is exactly what you need.`;
            cta = `DM us right now to order yours! 📩`;
            break;
          case 'story':
            hook = `❤️ Ek chota sa dream aur bahut saara hard work...`;
            body = `Jab humne ${businessName} start kiya tha, hum bas aapko best quality ${description} dena chahte the. Aapka support is everything for us!`;
            cta = `Check link in bio to read our full story! ✨`;
            break;
          case 'question':
            hook = `🤔 What is your go-to ${keywords[0] || 'vibe'}?`;
            body = `${businessName} is here to upgrade your daily routine. Humein comment section mein batayein, what do you think about ${description}?`;
            cta = `Drop your comments below! 👇`;
            break;
          case 'minimalist':
            hook = `💫 Elegance at its best, strictly premium.`;
            body = `Get your hands on the best ${description} from ${businessName}. Perfect combination of style and comfort!`;
            cta = `Shop now using the link in our bio! 🛍️`;
            break;
          case 'promo':
            hook = `🚨 MEGA SALE ALERT! Limited slots only!`;
            body = `Grab the most amazing ${description} from ${businessName} at unbelievable prices. It is now or never!`;
            cta = `Click link in bio and shop before it is gone! 🏃‍♂️`;
            break;
          case 'explainer':
            hook = `💡 Did you know the secret behind this?`;
            body = `Our ${description} is handcrafted with absolute precision. No compromise on quality, ever! That is the ${businessName} guarantee.`;
            cta = `Head to our website to learn more! 🌐`;
            break;
          case 'funny':
            hook = `🤪 Me trying to stay productive without ${description}...`;
            body = `But honestly, why struggle when ${businessName} is just a direct message away? Save yourself the hassle.`;
            cta = `DM us to order and chill! 😂`;
            break;
          case 'bts':
            hook = `👩‍🎨 Behind the scenes action: How we make the magic!`;
            body = `Here is a sneak peek into our making process of your favorite ${description}. Hand-poured with love at ${businessName}.`;
            cta = `Check out our reels for the full behind-the-scenes video! 🎬`;
            break;
          case 'quote':
            hook = `🌟 "Invest in yourself, it pays the best interest."`;
            body = `Upgrade your lifestyle with ${businessName}. Discover premium ${description} designed just for you.`;
            cta = `Order yours today! ✨`;
            break;
          case 'conversion':
            hook = `🔥 Don't wait! Best seller is back in stock!`;
            body = `Your absolute favorite ${description} is flying off the shelves. Trust ${businessName} for premium quality.`;
            cta = `Click link in bio to secure yours today! 🛒`;
            break;
        }
      } else {
        switch (angle.type) {
          case 'hook':
            hook = `✨ Elevate your everyday routine with ${businessName}!`;
            body = `If you've been searching for the ultimate ${description}, your quest ends here. Crafted specifically for ${audience}.`;
            cta = `DM us to get yours today! 📩`;
            break;
          case 'story':
            hook = `❤️ Handcrafted with passion, delivered with love.`;
            body = `When we founded ${businessName}, we had one simple dream: to deliver premium ${description} without compromise. Today, our community is everything.`;
            cta = `Tap the link in our bio to read our story! ✨`;
            break;
          case 'question':
            hook = `🤔 What is your favorite way to unwind?`;
            body = `${businessName} is here to add a touch of luxury to your day. How does a premium ${description} sound to you?`;
            cta = `Let us know in the comments below! 👇`;
            break;
          case 'minimalist':
            hook = `💫 Pure elegance, designed for modern living.`;
            body = `The signature ${description} from ${businessName} is back in stock. Minimal design, maximal luxury.`;
            cta = `Shop the collection today via link in bio! 🛍️`;
            break;
          case 'promo':
            hook = `🚨 EXCLUSIVE OFFER: Get yours before it sells out!`;
            body = `For a limited time, experience the luxury of ${description} at a special introductory rate. Only at ${businessName}.`;
            cta = `Tap 'SHOP NOW' or click the bio link to order! 🏃‍♂️`;
            break;
          case 'explainer':
            hook = `💡 The science of premium self-care:`;
            body = `Why is our ${description} rated #1 by our community? Because we use only organic, clean, and sustainably sourced ingredients.`;
            cta = `Visit our website to see our ingredient transparency! 🌐`;
            break;
          case 'funny':
            hook = `🤪 Me trying to pretend I don't need more products...`;
            body = `But who are we kidding? ${businessName}'s hand-crafted ${description} is literally irresistible. Treat yourself.`;
            cta = `DM us to order right now! 😂`;
            break;
          case 'bts':
            hook = `👩‍🎨 Behind the scenes: Made with love & care!`;
            body = `Take a look at how we hand-pour and package every single ${description}. Quality check is always our absolute priority.`;
            cta = `Watch our latest Reels for the full factory tour! 🎬`;
            break;
          case 'quote':
            hook = `🌟 "Self-care is how you take your power back."`;
            body = `Reclaim your peace of mind with ${businessName}'s ${description}. Created exclusively for those who appreciate premium quality.`;
            cta = `Order yours today! ✨`;
            break;
          case 'conversion':
            hook = `🔥 Grab yours now! Back by popular demand!`;
            body = `The most requested ${description} is finally back in stock at ${businessName}. Don't miss out this time.`;
            cta = `Click the link in our bio to checkout instantly! 🛒`;
            break;
        }
      }

      if (tone === 'Professional') {
        hook = hook.replace(/✨|🤪|🤣|😂|🤪/g, '💼');
        body = `We are proud to present a sophisticated option. ` + body;
      } else if (tone === 'Funny') {
        hook = `🤣 Attention please: ` + hook;
        body = body + ` (Warning: may cause extreme happiness!)`;
      } else if (tone === 'Emotional') {
        hook = `❤️ Warm your heart: ` + hook;
        body = body + ` Created with care, built with absolute devotion.`;
      }

      const textSignature = `${hook.slice(0,10)}_${body.slice(0,10)}_${cta.slice(0,10)}`.replace(/\s+/g, '');

      return {
        number: num,
        badge: angle.badge,
        hook: hook,
        body: body,
        callToAction: cta,
        hashtags: tags,
        textSignature: textSignature
      };
    });
  }

  // --- Loading Step Progress Animations ---
  function resetLoadingSteps() {
    for (let i = 1; i <= 5; i++) {
      const step = document.getElementById(`step-${i}`);
      step.className = 'loading-step';
    }
  }

  function animateLoadingSteps() {
    let timers = [];
    
    const setStepState = (stepNum, state) => {
      const el = document.getElementById(`step-${stepNum}`);
      if (el) el.className = `loading-step ${state}`;
    };

    // Stage 1 active immediately
    setStepState(1, 'active');
    
    // Transition after 2.5s
    timers.push(setTimeout(() => {
      setStepState(1, 'completed');
      setStepState(2, 'active');
    }, 2500));

    // Transition after 4.5s
    timers.push(setTimeout(() => {
      setStepState(2, 'completed');
      setStepState(3, 'active');
    }, 4800));

    // Transition after 7s
    timers.push(setTimeout(() => {
      setStepState(3, 'completed');
      setStepState(4, 'active');
    }, 7200));

    // Transition after 9s
    timers.push(setTimeout(() => {
      setStepState(4, 'completed');
      setStepState(5, 'active');
    }, 9000));

    // Return custom canceler
    return (success) => {
      timers.forEach(clearTimeout);
      if (success) {
        // Mark all steps completed instantly
        for (let i = 1; i <= 5; i++) {
          setStepState(i, 'completed');
        }
      } else {
        // Reset all
        resetLoadingSteps();
      }
    };
  }

  // --- Robust Output Parser ---
  function parseAIOutput(text) {
    let cleanText = text.trim();
    
    // Strip markdown JSON wrappers if present
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```(json)?/i, '').replace(/```$/, '').trim();
    }

    // Attempt direct parse
    try {
      const data = JSON.parse(cleanText);
      if (Array.isArray(data)) {
        return sanitizeParsedData(data);
      }
    } catch (e) {
      console.warn("Direct JSON parsing failed, attempting sub-string extraction...");
    }

    // Fallback: extract array using bracket index searching
    try {
      const firstBracket = cleanText.indexOf('[');
      const lastBracket = cleanText.lastIndexOf(']');
      
      if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        const arrayString = cleanText.substring(firstBracket, lastBracket + 1);
        const data = JSON.parse(arrayString);
        if (Array.isArray(data)) {
          return sanitizeParsedData(data);
        }
      }
    } catch (e) {
      console.warn("Array substring parsing failed, attempting regular expression parse...");
    }

    // Hard fallback: regex parsing of individual blocks
    return regexFallbackParser(cleanText);
  }

  // Ensure each caption object has mandatory properties
  function sanitizeParsedData(arr) {
    return arr.map((item, idx) => {
      const num = item.number || (idx + 1);
      const hook = item.hook || '';
      const body = item.body || '';
      const cta = item.callToAction || '';
      const tags = Array.isArray(item.hashtags) ? item.hashtags : [];
      const badge = item.badge || `Caption Option ${num}`;
      
      // Create a unique signature to easily cross-reference favorites
      const textSignature = `${hook.slice(0,10)}_${body.slice(0,10)}_${cta.slice(0,10)}`.replace(/\s+/g, '');

      return {
        number: num,
        badge: badge,
        hook: hook,
        body: body,
        callToAction: cta,
        hashtags: tags,
        textSignature: textSignature
      };
    });
  }

  function regexFallbackParser(text) {
    const captions = [];
    
    // Match anything in {} blocks
    const blockRegex = /\{[^{}]+\}/g;
    const blocks = text.match(blockRegex);

    if (blocks && blocks.length > 0) {
      blocks.forEach((block, idx) => {
        try {
          // Attempt to convert loose blocks to objects
          // We can do simple regex matches for properties inside the block
          const hookMatch = block.match(/"hook"\s*:\s*"([^"]+)"/);
          const bodyMatch = block.match(/"body"\s*:\s*"([^"]+)"/);
          const ctaMatch = block.match(/"callToAction"\s*:\s*"([^"]+)"/);
          const badgeMatch = block.match(/"badge"\s*:\s*"([^"]+)"/);
          
          let hashtags = [];
          const tagsMatch = block.match(/"hashtags"\s*:\s*\[([^\]]+)\]/);
          if (tagsMatch) {
            hashtags = tagsMatch[1].split(',').map(t => t.replace(/"/g, '').trim());
          }

          if (hookMatch || bodyMatch) {
            captions.push({
              number: idx + 1,
              badge: badgeMatch ? badgeMatch[1] : `Vibe Card ${idx + 1}`,
              hook: hookMatch ? hookMatch[1] : 'Captivating details!',
              body: bodyMatch ? bodyMatch[1] : block,
              callToAction: ctaMatch ? ctaMatch[1] : 'Click through to bio!',
              hashtags: hashtags,
              textSignature: `fallback_signature_${idx}_${Date.now()}`
            });
          }
        } catch (e) {
          // Skip block if completely unparseable
        }
      });
    }

    return captions;
  }

  // --- Render Captions Dashboard Grid ---
  function renderCaptions(captionsList) {
    captionsGridView.innerHTML = '';

    captionsList.forEach((cap) => {
      // Build Card Element
      const card = document.createElement('div');
      card.className = 'caption-card';
      
      const isFav = favoriteCaptions.some(fav => fav.textSignature === cap.textSignature);
      const formattedHashtags = cap.hashtags.map(t => {
        const hash = t.startsWith('#') ? t : `#${t}`;
        return `<span class="hashtag-tag">${hash}</span>`;
      }).join(' ');

      // Merge the text segments for length calculation
      const fullTextToCopy = `${cap.hook}\n\n${cap.body}\n\n${cap.callToAction}\n\n${cap.hashtags.join(' ')}`;
      const charCount = fullTextToCopy.length;

      card.innerHTML = `
        <div class="caption-card-header">
          <div class="caption-number">
            <i data-lucide="sparkles" style="width: 14px; height: 14px; color: var(--insta-pink);"></i>
            <span>CAPTION #${cap.number}</span>
          </div>
          <div class="caption-badge">${cap.badge}</div>
        </div>
        
        <div class="caption-card-body">
          <div class="caption-part">
            <span class="caption-part-label">The Hook</span>
            <p class="caption-hook">${cap.hook}</p>
          </div>
          
          <div class="caption-part">
            <span class="caption-part-label">Body Text</span>
            <p class="caption-text-body">${cap.body}</p>
          </div>
          
          <div class="caption-part">
            <span class="caption-part-label">Call to Action</span>
            <p class="caption-cta">${cap.callToAction}</p>
          </div>
          
          <div class="caption-hashtags-container">
            ${formattedHashtags || '<span style="font-size: 0.75rem; color: var(--text-muted);">No hashtags included</span>'}
          </div>
        </div>
        
        <div class="caption-card-footer">
          <button class="caption-btn caption-btn-copy" title="Copy full caption and hashtags">
            <i data-lucide="copy" style="width: 14px; height: 14px;"></i>
            <span>Copy (${charCount}c)</span>
          </button>
          
          <button class="caption-btn caption-btn-preview" title="Instagram Feed Preview">
            <i data-lucide="eye" style="width: 14px; height: 14px;"></i>
            <span>Preview</span>
          </button>
          
          <button class="caption-btn caption-btn-favorite ${isFav ? 'active' : ''}" title="${isFav ? 'Remove from favorites' : 'Save to favorites'}">
            <i data-lucide="heart" style="width: 14px; height: 14px;"></i>
            <span>Fav</span>
          </button>
        </div>
      `;

      // Event Binding for card actions
      const copyBtn = card.querySelector('.caption-btn-copy');
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(fullTextToCopy).then(() => {
          copyBtn.querySelector('span').textContent = 'Copied!';
          copyBtn.querySelector('i').setAttribute('data-lucide', 'check');
          lucide.createIcons();
          showToast('Caption copied to clipboard!', 'success');
          
          setTimeout(() => {
            copyBtn.querySelector('span').textContent = `Copy (${charCount}c)`;
            copyBtn.querySelector('i').setAttribute('data-lucide', 'copy');
            lucide.createIcons();
          }, 2000);
        }).catch(err => {
          showToast('Failed to copy text.', 'error');
        });
      });

      const previewBtn = card.querySelector('.caption-btn-preview');
      previewBtn.addEventListener('click', () => {
        openInstagramPreview(cap);
      });

      const favBtn = card.querySelector('.caption-btn-favorite');
      favBtn.addEventListener('click', () => {
        toggleFavorite(cap, favBtn);
      });

      captionsGridView.appendChild(card);
    });

    // Re-trigger icon painting
    lucide.createIcons();
  }

  // --- Instagram Live Preview Modal Logic ---
  function openInstagramPreview(caption) {
    // 1. Prepare profile info
    const businessName = inputBusinessName.value.trim() || 'your_business';
    // Format username: lowercase, replace spaces/symbols with underscore
    const formattedUser = businessName.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 30);
    
    previewUsername.textContent = formattedUser;
    previewCaptionUsername.textContent = formattedUser;
    
    // Set profile initials
    const initials = businessName.split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2);
    previewUserInitials.textContent = initials || 'BI';

    // 2. Pre-fill Caption Elements
    previewCaptionText.innerHTML = `<strong>${caption.hook}</strong><br>${caption.body}`;
    previewCaptionCta.textContent = caption.callToAction;
    previewCaptionHashtags.textContent = caption.hashtags.join(' ');

    // 3. Likes mock state
    simulatedLikes = Math.floor(Math.random() * 800) + 120;
    isLiked = false;
    previewLikesCount.textContent = formatNumber(simulatedLikes);
    previewHeartIcon.setAttribute('data-lucide', 'heart');
    previewHeartIcon.style.color = 'white';
    previewHeartIcon.style.fill = 'none';
    lucide.createIcons();

    // 4. Reset Image state if not uploaded
    if (!previewPostImg.src || previewPostImg.style.display === 'none') {
      previewPostImg.style.display = 'none';
      imageUploadPrompt.style.display = 'flex';
    }

    // Open Modal
    previewModal.classList.add('active');
    switchToPreviewTab();
  }

  function closePreviewModal() {
    previewModal.classList.remove('active');
  }

  btnClosePreviewModal.addEventListener('click', closePreviewModal);
  btnClosePreviewFooter.addEventListener('click', closePreviewModal);

  // Post Image Upload handler
  postImageContainer.addEventListener('click', () => {
    previewImageUpload.click();
  });

  previewImageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        previewPostImg.src = event.target.result;
        previewPostImg.style.display = 'block';
        imageUploadPrompt.style.display = 'none';
        showToast('Image uploaded successfully! Looking great.', 'success');
      };
      reader.readAsDataURL(file);
    }
  });

  // Like Toggle Interaction
  previewBtnLike.addEventListener('click', () => {
    isLiked = !isLiked;
    if (isLiked) {
      simulatedLikes += 1;
      previewHeartIcon.setAttribute('data-lucide', 'heart');
      previewHeartIcon.style.color = '#ef4444';
      previewHeartIcon.style.fill = '#ef4444';
      showToast('Liked post!', 'success');
    } else {
      simulatedLikes -= 1;
      previewHeartIcon.setAttribute('data-lucide', 'heart');
      previewHeartIcon.style.color = 'white';
      previewHeartIcon.style.fill = 'none';
    }
    previewLikesCount.textContent = formatNumber(simulatedLikes);
    lucide.createIcons();
  });

  // --- Toast Utilities ---
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    
    let iconName = 'check-circle';
    if (type === 'error') {
      iconName = 'alert-triangle';
      toast.style.borderLeftColor = 'var(--error)';
    } else if (type === 'info') {
      iconName = 'info';
      toast.style.borderLeftColor = 'var(--insta-blue)';
    }

    toast.innerHTML = `
      <div class="toast-icon">
        <i data-lucide="${iconName}"></i>
      </div>
      <div class="toast-message">${message}</div>
    `;

    toastContainer.appendChild(toast);
    
    // Paint icons inside the toast
    lucide.createIcons();

    // Trigger transition
    setTimeout(() => {
      toast.classList.add('show');
    }, 50);

    // Self-destruct toast
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3500);
  }

  // --- Helper Formatter ---
  function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // Start App
  init();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApplication);
} else {
  initApplication();
}
