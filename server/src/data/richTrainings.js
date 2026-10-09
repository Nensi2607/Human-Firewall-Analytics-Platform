const richTrainings = [
  {
    title: "Recognizing Phishing Emails",
    description: "Practice inspecting unexpected messages, links, attachments, and requests before taking action.",
    category: "Email Security",
    difficulty: "Beginner",
    estimatedMinutes: 15,
    duration: 15,
    type: "article",
    lessons: [
      {
        title: "Read the whole message in context",
        body: [
          "Phishing messages imitate routine work: a shared file, a delivery notice, an account warning, or a request from a colleague. The useful question is not whether the message looks polished, but whether the request fits the sender, channel, timing, and work you expect.",
          "Pause when a message creates unusual urgency, asks you to bypass a normal approval, or requests information that the sender should already have. Verify the request through a separate, trusted channel instead of replying to the message in question.",
        ],
        keyTakeaways: ["Check whether the request fits the work you expect.", "Urgency is a reason to verify, not a reason to skip checks.", "Use a separate trusted channel to confirm unusual requests."],
        realWorldExample: "A familiar display name sends an unexpected request to review a shared document. Contact the colleague using your organization directory before opening the link.",
        redFlags: ["Unexpected urgency or threats", "A request to bypass normal approval", "A display name that does not match the actual address"],
      },
      {
        title: "Inspect links and attachments safely",
        body: [
          "A link's visible label can differ from its destination. On a computer, inspect the destination without opening it; on a phone, use the message's details or a trusted security reporting option rather than tapping a link to investigate. A familiar logo or HTTPS indicator does not establish that a site is legitimate.",
          "Unexpected attachments can exploit software or persuade you to enable active content. If a file was not expected, confirm with the sender independently and follow your organization's approved scanning and reporting process.",
        ],
        keyTakeaways: ["Inspect the actual destination before visiting a link.", "HTTPS protects a connection but does not prove a site is trustworthy.", "Confirm unexpected files before opening or enabling content."],
        redFlags: ["Look-alike domains or misspellings", "Shortened links with no clear context", "Requests to enable macros or bypass a warning"],
      },
      {
        title: "Choose a safe response",
        body: [
          "Do not reply with credentials, payment details, employee information, or verification codes. Use the approved report-phishing control or security contact; preserve the message so responders can inspect its headers and destination.",
          "If you already clicked, entered information, or opened a file, report it promptly and describe exactly what happened. Early reporting helps the security team contain a problem; it is more useful than deleting evidence or trying to investigate alone.",
        ],
        keyTakeaways: ["Never send passwords or one-time codes in response to email.", "Report suspicious messages through the approved process.", "Report a mistake promptly and factually."],
        realWorldExample: "After entering a password on a page reached from an unexpected message, contact the security team and change the password using the known official sign-in page.",
      },
    ],
    knowledgeCheck: { questions: [
      { question: "A message requests an urgent payment outside the normal process. What is the safest first step?", options: ["Reply and ask whether it is real", "Verify using a separate trusted contact method", "Pay a small amount first", "Forward it to coworkers"], correctAnswer: 1 },
      { question: "What does HTTPS tell you about a site?", options: ["The site belongs to your organization", "The site has no malicious content", "The connection is encrypted, but legitimacy still needs checking", "The link was sent by a trusted person"], correctAnswer: 2 },
      { question: "An unexpected attachment asks you to enable macros. What should you do?", options: ["Enable them so the file renders", "Confirm the file independently and report it if suspicious", "Rename the attachment", "Upload it to a personal drive"], correctAnswer: 1 },
      { question: "You entered your password on a page reached from a suspicious message. What is the best response?", options: ["Wait to see whether anything happens", "Delete the message and tell nobody", "Report promptly and change it through the official sign-in route", "Reply asking the sender to remove your password"], correctAnswer: 2 },
    ] },
  },
  {
    title: "Password Security and Password Managers",
    description: "Build a practical approach to unique passwords, secure storage, and account recovery.",
    category: "Account Security",
    difficulty: "Beginner",
    estimatedMinutes: 14,
    duration: 14,
    type: "article",
    lessons: [
      {
        title: "Make every password unique",
        body: [
          "A password reused across services turns one compromised account into a path toward others. Use a distinct password for each account, especially email, administration, finance, and remote access.",
          "Long, unpredictable passwords are easier to manage when generated and stored by an approved password manager. Avoid predictable substitutions, public facts, and patterns that only change a number or season.",
        ],
        keyTakeaways: ["Use a unique password for every account.", "Prefer long, randomly generated passwords.", "Protect email and recovery accounts especially carefully."],
        realWorldExample: "If a shopping account password is exposed, a unique password prevents that exposure from automatically unlocking your work email.",
      },
      {
        title: "Use a password manager safely",
        body: [
          "An approved password manager creates and stores unique credentials so you do not need to memorize them all. Protect its vault with a strong master passphrase and the strongest supported multi-factor method.",
          "Only use a manager approved for work data. Check the domain before accepting an autofill prompt, keep recovery methods current, and never export a vault to an unprotected file or personal account.",
        ],
        keyTakeaways: ["Use an organization-approved manager for work credentials.", "Secure the vault and recovery route with care.", "Check the site domain before using autofill."],
        redFlags: ["A login page on an unfamiliar domain", "A request to export or email a vault", "A recovery prompt you did not initiate"],
      },
      {
        title: "Handle sharing and recovery carefully",
        body: [
          "Do not send passwords through chat, email, documents, or support tickets. If a task requires shared access, ask for an approved delegated account or secure sharing workflow that can be revoked and audited.",
          "If you suspect a password was exposed, change it from the official service, revoke unknown sessions, check recovery details, and report the incident. Change other passwords only if they were reused; otherwise keep their unique credentials intact.",
        ],
        keyTakeaways: ["Never share credentials in ordinary messages.", "Use delegated access rather than shared passwords.", "Revoke unknown sessions after suspected exposure."],
      },
    ],
    knowledgeCheck: { questions: [
      { question: "Why should passwords be unique across accounts?", options: ["It makes them shorter", "A breach at one service is less likely to expose other accounts", "Managers require identical passwords", "It prevents phishing messages"], correctAnswer: 1 },
      { question: "Which is the safest way to store many work passwords?", options: ["A personal notes app", "A spreadsheet in email", "An organization-approved password manager", "A document shared with the team"], correctAnswer: 2 },
      { question: "An autofill prompt appears on a look-alike domain. What should you do?", options: ["Accept it because autofill appeared", "Check the domain and do not enter credentials on the suspicious site", "Copy the password into chat", "Change the password to a shorter one"], correctAnswer: 1 },
      { question: "A colleague needs access to a work account. What is preferred?", options: ["Send your password temporarily", "Use an approved delegated-access method", "Share a screenshot of the password", "Put the password in a calendar invite"], correctAnswer: 1 },
    ] },
  },
  {
    title: "Multi-Factor Authentication",
    description: "Understand how additional sign-in factors work and how to respond to unexpected prompts.",
    category: "Account Security",
    difficulty: "Beginner",
    estimatedMinutes: 12,
    duration: 12,
    type: "article",
    lessons: [
      {
        title: "What a second factor adds",
        body: [
          "Multi-factor authentication asks for evidence beyond a password, such as an authenticator approval, hardware key, or device-bound credential. A second factor can reduce the impact of a stolen password, but it does not make every sign-in request safe.",
          "Use the method approved for your account and enroll a recovery method through the official settings page. Keep recovery codes in a protected location and never send them to someone who contacts you unexpectedly.",
        ],
        keyTakeaways: ["A second factor supplements a password; it does not replace good judgment.", "Enroll and recover only through official account settings.", "Protect recovery codes like credentials."],
      },
      {
        title: "Treat unexpected prompts as a warning",
        body: [
          "An approval prompt you did not initiate may mean someone has your password or is trying to fatigue you into approving access. Deny it, do not share any displayed code, and report repeated or unfamiliar prompts.",
          "A legitimate support person should not ask you to approve a sign-in they cannot explain or dictate a one-time code to them. Start your own sign-in only from a known application or bookmarked official page.",
        ],
        keyTakeaways: ["Deny prompts you did not initiate.", "Never read a one-time code to a caller or message sender.", "Report repeated prompts and secure the account."],
        redFlags: ["Several approval prompts in a row", "A caller asking you to read a code", "A request to approve a sign-in you did not start"],
      },
      {
        title: "Choose and protect factors",
        body: [
          "Where available, prefer phishing-resistant sign-in methods such as a hardware security key or passkey managed by your organization. Authenticator apps are generally safer than codes delivered through a channel an attacker may control, but follow your organization's supported options.",
          "If a device is lost, report it and revoke its sign-in access using the approved account recovery path. Do not disable multi-factor protection just to clear a prompt or meet a deadline.",
        ],
        keyTakeaways: ["Use the strongest supported method for the account.", "Report lost authentication devices promptly.", "Do not disable protection to work around a prompt."],
      },
    ],
    knowledgeCheck: { questions: [
      { question: "You receive an approval prompt without trying to sign in. What should you do?", options: ["Approve it to stop the prompts", "Deny it and report the unexpected activity", "Send the code to your manager", "Disable MFA"], correctAnswer: 1 },
      { question: "What does MFA provide?", options: ["A guarantee that phishing cannot work", "An additional proof of identity beyond a password", "Automatic malware removal", "A replacement for account recovery"], correctAnswer: 1 },
      { question: "A caller asks you to read a one-time code to verify your account. What is safest?", options: ["Read it if they know your name", "Share only the first half", "Do not share it; verify the caller through a trusted channel", "Send it by text instead"], correctAnswer: 2 },
      { question: "What should happen after a work authentication device is lost?", options: ["Wait until the next password change", "Report it and revoke its access through the approved process", "Disable MFA for the team", "Use a coworker's device"], correctAnswer: 1 },
    ] },
  },
  {
    title: "Social Engineering and Pretexting",
    description: "Recognize manipulation across calls, messages, visitors, and everyday workplace interactions.",
    category: "Social Engineering",
    difficulty: "Intermediate",
    estimatedMinutes: 16,
    duration: 16,
    type: "article",
    lessons: [
      {
        title: "Recognize the pressure pattern",
        body: [
          "Social engineering uses trust, authority, helpfulness, fear, or urgency to influence a person into disclosing information or taking an action. A pretext is the story used to make that action seem normal, such as claiming to be a vendor troubleshooting an account.",
          "Focus on the request and its verification path rather than the caller's confidence or familiarity with internal terms. A believable story is not proof of identity or authorization.",
        ],
        keyTakeaways: ["Notice pressure, secrecy, and requests outside normal process.", "Internal vocabulary does not authenticate a person.", "Verify identity and authority independently."],
        redFlags: ["Requests to keep an action secret", "Pressure to bypass approval", "A claimed emergency with no verifiable ticket or contact"],
      },
      {
        title: "Verify requests across channels",
        body: [
          "Use a directory number, known service portal, or established approval chain to confirm a request. Do not use a phone number, link, or contact detail supplied only by the person making the unexpected request.",
          "For visitors and physical access, follow the site's check-in and escort process. Do not let an unfamiliar person follow you through a secured door simply because they appear busy or carry equipment.",
        ],
        keyTakeaways: ["Use known contact details, not the unexpected message's details.", "Confirm authorization before sharing data or granting access.", "Follow visitor and physical-access procedures consistently."],
      },
      {
        title: "Respond without escalating risk",
        body: [
          "You can pause a request politely: explain that you need to verify it using the standard process. Legitimate work can tolerate a short verification step; an insistence that you must skip it is itself useful context.",
          "Record the channel, time, requested action, and contact details, then report through the approved security route. Do not confront a suspected attacker or disclose additional information while testing their story.",
        ],
        keyTakeaways: ["A calm verification pause is appropriate.", "Record observable facts rather than assumptions.", "Report suspected manipulation through approved channels."],
      },
    ],
    knowledgeCheck: { questions: [
      { question: "A caller says they are senior leadership and demands secrecy while requesting employee data. What is the safest response?", options: ["Send only part of the data", "Verify their identity and authority through a known channel", "Use the number they provide", "Ask a coworker to send it"], correctAnswer: 1 },
      { question: "What is a pretext?", options: ["A technical security patch", "A story used to make a request seem legitimate", "A type of password manager", "A malware scan"], correctAnswer: 1 },
      { question: "An unfamiliar person asks you to hold a secure door open. What should you do?", options: ["Let them follow if they look like staff", "Follow visitor and access procedures", "Ask them to use your badge", "Take a photo and do nothing else"], correctAnswer: 1 },
      { question: "Which is the safest way to verify a surprising request?", options: ["Use contact details supplied in the request", "Reply to the same message", "Use a known directory or established approval process", "Ask the requester to repeat the story"], correctAnswer: 2 },
    ] },
  },
  {
    title: "Safe Browsing and Public Wi-Fi",
    description: "Make safer decisions about websites, downloads, browser prompts, and unfamiliar networks.",
    category: "Safe Browsing",
    difficulty: "Beginner",
    estimatedMinutes: 13,
    duration: 13,
    type: "article",
    lessons: [
      {
        title: "Check the destination, not just the design",
        body: [
          "A polished page can still be fraudulent. Navigate to important services through a known bookmark or typed address, and check the full domain before signing in. Treat browser warnings as a stop signal rather than an obstacle to click past.",
          "HTTPS encrypts traffic between your browser and a site, but it does not establish that the site is the organization you intended to reach. Unexpected redirects, downloads, or sign-in prompts deserve verification.",
        ],
        keyTakeaways: ["Use known routes for important sign-ins.", "Read the domain carefully before entering credentials.", "Do not bypass browser security warnings."],
      },
      {
        title: "Use public networks carefully",
        body: [
          "Public Wi-Fi names can be imitated, and an open network may not provide the protections of a managed work connection. Use your organization's approved VPN or secure access method for work, and avoid sensitive tasks on an untrusted network when a safer route is available.",
          "Disable automatic joining of unknown networks and forget networks you no longer need. A VPN protects traffic to its endpoint, but it does not protect you from fake sign-in pages, malicious downloads, or unsafe actions after traffic reaches the internet.",
        ],
        keyTakeaways: ["Use approved secure access for work on public networks.", "Disable automatic connection to unknown networks.", "A VPN does not make every site or download trustworthy."],
      },
      {
        title: "Keep browser activity under control",
        body: [
          "Install browser extensions and software only from approved sources. Review permission requests: an extension that can read every page may access sensitive content far beyond the task it claims to perform.",
          "Keep browsers and devices updated through managed update tools. If a site unexpectedly asks you to install a codec, security update, or remote-support tool, stop and confirm with IT using a known contact route.",
        ],
        keyTakeaways: ["Use approved extension and software sources.", "Review permissions before granting browser access.", "Get software updates through managed channels."],
        redFlags: ["A pop-up demands immediate installation", "An extension asks for broad unrelated access", "A website asks for remote-control access"],
      },
    ],
    knowledgeCheck: { questions: [
      { question: "What does an HTTPS indicator prove?", options: ["The site is operated by your employer", "The connection is encrypted, not that the destination is legitimate", "The page has been approved by IT", "The download is safe"], correctAnswer: 1 },
      { question: "What should you do when a browser displays a certificate or security warning?", options: ["Continue if the page looks familiar", "Stop and use a trusted route or report it", "Disable the warning", "Try a personal device"], correctAnswer: 1 },
      { question: "How should you access work systems on public Wi-Fi?", options: ["Use the approved secure access method", "Use any network with a familiar name", "Turn off device updates", "Share your hotspot password publicly"], correctAnswer: 0 },
      { question: "A website asks you to install a remote-support tool unexpectedly. What is safest?", options: ["Install it to view the page", "Confirm through a known IT contact before proceeding", "Ask the website for a discount", "Disable your browser protections"], correctAnswer: 1 },
    ] },
  },
  {
    title: "Data Protection and Sensitive Information",
    description: "Apply practical safeguards when viewing, sharing, storing, and disposing of work information.",
    category: "Data Protection",
    difficulty: "Intermediate",
    estimatedMinutes: 16,
    duration: 16,
    type: "article",
    lessons: [
      {
        title: "Know what you are handling",
        body: [
          "Work information may include personal details, credentials, financial records, contracts, source code, or internal plans. Use the classification and handling rules your organization provides; when classification is unclear, ask the data owner or security contact before sharing.",
          "Access only the information needed for your task. A legitimate work account does not make every record appropriate to browse, copy, or retain.",
        ],
        keyTakeaways: ["Follow the organization's classification rules.", "Use only information needed for the task.", "Ask before handling or sharing unclear data."],
      },
      {
        title: "Share through approved routes",
        body: [
          "Before sharing, check the recipient, purpose, and access scope. Prefer approved storage with named recipients and expiration or revocation controls; avoid public links and personal email or file-sharing accounts for work information.",
          "Verify external recipients and attachments carefully. Remove unnecessary sensitive details, and use the organization's approved encryption or secure-transfer process where required.",
        ],
        keyTakeaways: ["Verify recipients and permissions before sharing.", "Use approved storage and transfer tools.", "Share the minimum information required."],
        redFlags: ["A public link when named access is possible", "An unexpected request for a complete data export", "A personal account proposed for work files"],
      },
      {
        title: "Protect data in daily work",
        body: [
          "Lock your screen when stepping away, keep paper and removable media secured, and avoid discussing sensitive work where others can overhear. Use managed devices and approved storage rather than saving work files to unmanaged personal devices.",
          "Dispose of information using the approved deletion, retention, and secure-disposal process. If data is sent to the wrong person or exposed, report it promptly; do not try to conceal or quietly repair the incident.",
        ],
        keyTakeaways: ["Secure screens, paper, and removable media.", "Use managed devices and approved storage.", "Report accidental exposure promptly."],
      },
    ],
    knowledgeCheck: { questions: [
      { question: "A colleague asks for a full customer export but needs only a few records. What should you do?", options: ["Send the full export for convenience", "Share the minimum approved information needed", "Send it to a personal account", "Post it in a public team channel"], correctAnswer: 1 },
      { question: "Before sharing a file externally, what should you verify?", options: ["Recipient, purpose, and access scope", "Only the file name", "Whether the recipient replies quickly", "Whether the file is large"], correctAnswer: 0 },
      { question: "Where should work files be stored?", options: ["Personal cloud storage", "Approved managed storage", "A public file share", "Any removable drive"], correctAnswer: 1 },
      { question: "You send sensitive information to the wrong recipient. What should you do?", options: ["Delete the sent item and wait", "Report promptly using the incident process", "Ask the recipient to keep quiet", "Forward the data to the correct person too"], correctAnswer: 1 },
    ] },
  },
  {
    title: "Ransomware and Malware Basics",
    description: "Recognize common malware delivery paths and respond safely to suspicious device behavior.",
    category: "Malware Defense",
    difficulty: "Intermediate",
    estimatedMinutes: 15,
    duration: 15,
    type: "article",
    lessons: [
      {
        title: "Understand common delivery paths",
        body: [
          "Malware can arrive through malicious attachments, compromised websites, fake software updates, removable media, or stolen credentials. An ordinary-looking document can still contain a harmful link or prompt, so unexpected context matters.",
          "Keep operating systems and applications updated through managed tools, use approved security software, and avoid installing programs from links in unsolicited messages. These controls reduce exposure but do not replace careful reporting.",
        ],
        keyTakeaways: ["Unexpected files and installers deserve verification.", "Use managed updates and approved software sources.", "Security tools help, but users still need to report warning signs."],
      },
      {
        title: "Notice early warning signs",
        body: [
          "Unexpected file extensions, repeated access prompts, unknown encryption notices, missing files, or security tools being disabled may indicate compromise. Do not click a note's payment link or attempt to run cleanup tools from the same message.",
          "A device behaving unusually may also have an ordinary cause, so report observed facts rather than diagnosing the cause. Avoid moving files to shared drives or plugging in removable media while the device is under suspicion.",
        ],
        keyTakeaways: ["Report observable symptoms without guessing at a diagnosis.", "Do not follow instructions from a suspicious ransom note.", "Avoid spreading files or removable media from a suspect device."],
        redFlags: ["A sudden encryption or ransom message", "Security tools unexpectedly disabled", "Unknown files or repeated sign-in prompts"],
      },
      {
        title: "Contain and report",
        body: [
          "Follow your organization's incident instructions. If directed, disconnect the device from network access without powering it off; otherwise contact the security team immediately and follow their guidance. Do not connect backup drives or other devices to a suspected system.",
          "Report what you opened, clicked, or observed and when it happened. Preserve messages and alerts when safe to do so; responders need a clear timeline to contain affected accounts and devices.",
        ],
        keyTakeaways: ["Use the organization's containment instructions.", "Contact security promptly and provide a factual timeline.", "Do not pay, run unapproved tools, or attach backups without guidance."],
      },
    ],
    knowledgeCheck: { questions: [
      { question: "A document unexpectedly asks you to enable active content. What should you do?", options: ["Enable it to view the file", "Stop and verify the file through a trusted channel", "Send it to a personal computer", "Disable security software"], correctAnswer: 1 },
      { question: "You see an unexpected encryption notice on a work device. What is safest?", options: ["Click the payment link", "Run a cleanup tool from the notice", "Contact security and follow incident instructions", "Connect a backup drive"], correctAnswer: 2 },
      { question: "Why avoid connecting removable media to a suspected infected device?", options: ["It could spread malware or expose backup data", "It makes the screen brighter", "It changes the account password", "It prevents reporting"], correctAnswer: 0 },
      { question: "What information helps incident responders?", options: ["A guess about the attacker", "A factual timeline of what you observed and did", "A deleted copy of the alert", "A payment receipt"], correctAnswer: 1 },
    ] },
  },
  {
    title: "Reporting Security Incidents",
    description: "Learn what to report, how quickly to report it, and what information helps responders act.",
    category: "Incident Response",
    difficulty: "Beginner",
    estimatedMinutes: 12,
    duration: 12,
    type: "article",
    lessons: [
      {
        title: "Recognize reportable events",
        body: [
          "Report suspected phishing, unexpected account prompts, lost devices, accidental data sharing, unusual system behavior, and physical access concerns. You do not need proof that an incident occurred before asking the security team to review it.",
          "A near miss is useful too. Reporting a suspicious message you did not open can help the organization warn others and block related activity.",
        ],
        keyTakeaways: ["Report concerns early, even when uncertain.", "Near misses can help prevent later incidents.", "Use the designated security contact or reporting tool."],
      },
      {
        title: "Give responders useful facts",
        body: [
          "Include what happened, when, which account or device was involved, what you clicked or shared, and any message or alert details. Be direct about mistakes; accurate information is more valuable than a polished explanation.",
          "Preserve relevant messages and files when safe. Do not forward suspicious content broadly, delete logs, or investigate by contacting a suspected sender unless the response team asks you to.",
        ],
        keyTakeaways: ["Share a clear timeline and affected account or device.", "State what you did, not only what you suspect.", "Preserve evidence and avoid broad forwarding."],
      },
      {
        title: "Follow response guidance",
        body: [
          "Responders may ask you to change a password, revoke a session, isolate a device, or stop using a particular system. Follow the instructions through verified channels and ask for clarification if a request is unexpected.",
          "Keep incident details within the response group. Do not post sensitive evidence to public channels or promise that an issue is fixed before the authorized team confirms it.",
        ],
        keyTakeaways: ["Follow verified containment and recovery instructions.", "Ask for confirmation when a response request is unexpected.", "Keep incident details on approved channels."],
      },
    ],
    knowledgeCheck: { questions: [
      { question: "You are unsure whether a suspicious sign-in alert is an incident. What should you do?", options: ["Wait until damage is obvious", "Report it and let responders assess it", "Delete it", "Ask the sender by replying"], correctAnswer: 1 },
      { question: "Which report detail is most useful?", options: ["A factual timeline of actions and affected account/device", "A guess about who is responsible", "Only the word 'urgent'", "A public social post"], correctAnswer: 0 },
      { question: "What should you do with a suspicious message while reporting?", options: ["Forward it to the whole company", "Preserve it and use the approved reporting tool", "Delete it before contacting security", "Reply to test the sender"], correctAnswer: 1 },
      { question: "A response instruction arrives through an unexpected personal message. What should you do?", options: ["Follow it immediately", "Verify it through a trusted response channel", "Share your password", "Post it publicly"], correctAnswer: 1 },
    ] },
  },
  {
    title: "Remote Work and Mobile Device Security",
    description: "Protect work accounts and information across home networks, travel, and mobile devices.",
    category: "Device Security",
    difficulty: "Intermediate",
    estimatedMinutes: 15,
    duration: 15,
    type: "article",
    lessons: [
      {
        title: "Secure the work environment",
        body: [
          "Use managed devices and the organization's approved access methods. Keep the device physically secure, lock the screen when unattended, and avoid leaving it visible in vehicles or shared spaces.",
          "Home routers and travel networks need updates and strong administrative credentials. Use approved VPN or secure access for work, and avoid discussing sensitive information where others can hear or view it.",
        ],
        keyTakeaways: ["Use managed devices and approved access methods.", "Protect screens and devices in shared environments.", "Keep home network equipment updated and secured."],
      },
      {
        title: "Protect phones and tablets",
        body: [
          "Use a device lock, supported encryption, and managed updates. Install applications only from approved stores and review permissions before granting access to contacts, location, camera, microphone, or files.",
          "Do not use personal messaging or storage apps for work content unless explicitly approved. Report a lost device promptly so access can be revoked and recovery steps can begin.",
        ],
        keyTakeaways: ["Use device locks and managed updates.", "Review app permissions and install from approved sources.", "Report loss quickly and avoid unapproved personal apps for work."],
      },
      {
        title: "Handle travel and shared spaces",
        body: [
          "Be alert to shoulder surfing, unattended devices, unknown charging accessories, and unexpected requests to connect to a network. Keep sensitive screens out of public view and use only approved accessories and connectivity.",
          "If travel or location creates additional handling requirements, check the organization's current guidance before departure. Report confiscated, lost, or unexpectedly accessed devices through the normal incident route.",
        ],
        keyTakeaways: ["Protect screens and devices in public places.", "Use approved connectivity and accessories.", "Check travel guidance and report device loss or access concerns."],
        redFlags: ["A stranger offers an unknown USB accessory", "A device is unexpectedly out of your control", "A public network requires unusual credentials"],
      },
    ],
    knowledgeCheck: { questions: [
      { question: "What should you do if a managed work phone is lost?", options: ["Wait until it is found", "Report it promptly through the approved incident route", "Post your unlock code online", "Borrow a stranger's phone to sign in"], correctAnswer: 1 },
      { question: "How should you install a work-related mobile app?", options: ["From an unsolicited message link", "From an approved source and after checking permissions", "From any file-sharing site", "By disabling device management"], correctAnswer: 1 },
      { question: "What is the safest approach to public Wi-Fi for work?", options: ["Use the approved secure access method", "Use any network with a recognizable name", "Turn off device encryption", "Share credentials with the venue"], correctAnswer: 0 },
      { question: "A stranger offers a USB device while you travel. What should you do?", options: ["Connect it to identify the owner", "Use only approved accessories and report concerns", "Copy work files to it", "Disable endpoint protection"], correctAnswer: 1 },
    ] },
  },
  {
    title: "AI-Powered Scams and Deepfakes",
    description: "Verify convincing synthetic voice, video, and written requests before sharing data or authorizing actions.",
    category: "Emerging Threats",
    difficulty: "Intermediate",
    estimatedMinutes: 14,
    duration: 14,
    type: "article",
    lessons: [
      {
        title: "Understand synthetic impersonation",
        body: [
          "Generative tools can produce convincing text, cloned voices, or altered video. Familiar phrasing, a known face, or a recognizable voice should not be treated as proof that a request is authentic.",
          "Scams may combine synthetic media with real information gathered from public profiles or previous messages. Evaluate the requested action, its urgency, and whether it follows the normal approval process.",
        ],
        keyTakeaways: ["A familiar voice or image is not sufficient identity verification.", "Public information can make impersonation more convincing.", "Apply the same independent verification process to unusual requests."],
      },
      {
        title: "Verify high-impact requests",
        body: [
          "For money movement, credential changes, sensitive data, or urgent access, use a second trusted channel and established approval steps. Call a known number or start a fresh conversation in an approved directory rather than relying on a supplied link or callback number.",
          "Agree on a verification method for sensitive workflows where your organization supports one. Do not invent a personal secret or share authentication codes as a substitute for formal verification.",
        ],
        keyTakeaways: ["Use independent channels for sensitive requests.", "Follow approval and dual-control requirements.", "Never substitute one-time codes for identity verification."],
        realWorldExample: "A voice call that sounds like a manager asks for a confidential transfer. Pause and confirm through the established approval workflow and a known contact method.",
      },
      {
        title: "Report suspicious media safely",
        body: [
          "Do not repost suspected manipulated media or upload confidential recordings to unapproved analysis services. Preserve the original message or link and report the context, requested action, and any contact details to the security team.",
          "Detection tools can be wrong and media can be edited in ordinary ways. Let trained responders assess the evidence; your role is to verify the request and report what you observed.",
        ],
        keyTakeaways: ["Do not spread or upload sensitive media to unapproved tools.", "Preserve the original context and report the request.", "Avoid treating a detector result as definitive proof."],
      },
    ],
    knowledgeCheck: { questions: [
      { question: "A familiar-sounding voice requests an urgent confidential transfer. What is safest?", options: ["Act because the voice is recognizable", "Verify independently and follow the normal approval workflow", "Ask the caller for a one-time code", "Send a small transfer first"], correctAnswer: 1 },
      { question: "Why can an impersonation be convincing?", options: ["Synthetic media cannot be edited", "It can combine generated media with real public information", "It always comes from a known account", "It is automatically approved by security"], correctAnswer: 1 },
      { question: "What should you do with suspected manipulated work media?", options: ["Post it publicly for opinions", "Upload it to any analysis website", "Preserve context and report through approved channels", "Forward it to all colleagues"], correctAnswer: 2 },
      { question: "Should an AI detector result alone prove that media is authentic or fake?", options: ["Yes, always", "No; use approved verification and let responders assess evidence", "Only if the clip is short", "Only if the speaker is familiar"], correctAnswer: 1 },
    ] },
  },
];

module.exports = richTrainings;
