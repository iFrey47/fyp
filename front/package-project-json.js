const projectData = [
  {
    title: "Job Seeking Portal",
    name: "Mah Jabeen, Shagufta Hameed",
    reg_no: "4191-FBAS/BSSE/F21-A, 4177-FBAS/BSSE/F21-A",
    supervisor: "Ms. Tehmina Mehboob",
  },
  {
    title: "Online Portfolio Builder (with AI)",
    name: "Muskaan Malik",
    reg_no: "4221-FBAS/BSSE/F21-A",
    supervisor: "Ms. Raheela Bibi",
  },
  {
    title: "Saheli",
    name: "Atiqa Din, Sundas Sultana",
    reg_no: "4219-FBAS/BSSE/F21-A, 4251-FBAS/BSSE/F21-A",
    supervisor: "Ms. Shaista Rashid",
  },
  {
    title: "School Management System",
    name: "Rabia Khan, Laralb Ulfat",
    reg_no: "4209-FBAS/BSSE/F21-A, 4175-FBAS/BSSE/F21-A",
    supervisor: "Ms. Salma Imtiaz",
  },
  {
    title: "FYP Management and Evaluation Platform",
    name: "Najum ul Sahar, Muneeba Bibi",
    reg_no: "4171/FBAS/BSSE/F21-A, 4217/FBAS/BSSE/F21-A",
    supervisor: "Dr. Salma Imtiaz",
  },
  {
    title: "Hunar Pakistan's First Local Marketplace",
    name: "Farwa Attaria, Jaweria Amir",
    reg_no: "4211/FBAS/BSSE/F21-A, 4195/FBAS/BSSE/F21-A",
    supervisor: "Ms. Tehmina Mehboob",
  },
  {
    title: "Case Flow System",
    name: "Areeha Zainab, Zukhruf Riaz",
    reg_no: "4225-FBAS/BSSE/F21-A, 4241-FBAS/BSSE/F21-A",
    supervisor: "Ms. Saba Taimouri",
  },
  {
    title: "Sky Adventure",
    name: "Haram Ijaz, Rubab Afzal",
    reg_no: "4253-FBAS/BSSE/F21-A, 4229-FBAS/BSSE/F21-A",
    supervisor: "Ms. Shaista Rashid",
  },
  {
    title: "CRAFTIFY- The DIY Marketplace",
    name: "Aila Mahmood, Eisha Inam",
    reg_no: "4213-FBAS/BSSE/F21-A, 4249-FBAS/BSSE/F21-A",
    supervisor: "Ms. Raheela Bibi",
  },
  {
    title: "Virtual Office Environment for Remote Workers",
    name: "Anna Najib, Noor Ul Ain",
    reg_no: "4207-FBAS/BSSE/F21-A, 4235-FBAS/BSSE/F21-A",
    supervisor: "Ms. Maryam Amin",
  },
  {
    title: "SHAHEEN CHEMIST AND GROCERS",
    name: "Bushra Arif, Rabail Jamshaid",
    reg_no: "4233-FBAS-BSSE-F21-A, 4198-FBAS-BSSE-F21-A",
    supervisor: "Dr. Salma Imtiaz",
  },
  {
    title: "EDUGAMES VERSION 2",
    name: "Muskan Younis, Sehar Fatima",
    reg_no: "4181/FBAS/BSSE/F21/A, 4173/FBAS/BSSE/F21/A",
    supervisor: "Ms. Talat Ambreen",
  },
  {
    title: "AR Furniture Placement",
    name: "Isma Abbas, Areeba Zafar",
    reg_no: "4239-FBAS-BSSE/F21-A, 4243-FBAS-BSSE/F21-A",
    supervisor: "Ms. Salma Imtiaz",
  },
  {
    title: "CARES (Comprehensive Anxiety Relief Expert System)",
    name: "Roumaisa Abbasi, Maryum Jamil",
    reg_no: "4223/FBAS/BSSE/F21-A, 4222/FBAS/BSSE/F21-A",
    supervisor: "Dr. Salma Imtiaz",
  },
  {
    title: "PAWMATE",
    name: "Alishba Waheed, Laiba Shabbir",
    reg_no: "4245-FBAS/BSSE/F21-A, 4183-FBAS/BSSE/F21-A",
    supervisor: "Ms. Raheela Bibi",
  },
  {
    title: "Quran Web App",
    name: "Nadia Mushtaq, Tanzeela Tariq",
    reg_no: "4200-FOC/BSSE/F21-B, 4178-FOC/BSSE/F21-B",
    supervisor: "Ms. Talat Ambreen",
  },
  {
    title: "ClueCraze Game",
    name: "Roobi Hayat, Inza Shahid",
    reg_no: "4212-FBAS/BSSE/F21-B, 4194-FBAS/BSSE/F21-B",
    supervisor: "Ms. Maryam Amin",
  },
  {
    title: "Quran Web App",
    name: "Mahnoor, Alisha Akhtar",
    reg_no: "4230-FOC/BSSE/F21-B, 4250-FOC/BSSE/F21-B",
    supervisor: "Ms. Talat Ambreen",
  },
  {
    title: "Decision support system",
    name: "Sidra Mehboob",
    reg_no: "4192-FOC/BSSE/F21/B",
    supervisor: "Ms. Shaista Rashid",
  },
  {
    title: "Legal Consultant System",
    name: "Malalka Azam, Iqra Shehzadi",
    reg_no: "4216-FOC/BSSE/F21/B, 4236-FOC/BSSE/F21/B",
    supervisor: "Ms. Saima Imtiaz",
  },
  {
    title: "Syn Meet",
    name: "Adeeba Waqar, Samiha Amir",
    reg_no: "4184-FOC/BSSE/F21B, 4248-FOC/BSSE/F21B",
    supervisor: "Ms. Saba Taimouri",
  },
  {
    title: "Women Security",
    name: "Saima, Asma Aimen",
    reg_no: "4208-FOC-BSSE-F21B, 4218-FOC-BSSE-F21B",
    supervisor: "Ms. Saba Taimouri",
  },
  {
    title: "SMART TRAVEL PLANNER",
    name: "Nimra Tahir",
    reg_no: "4214-FOC/BSSE/F21/B",
    supervisor: "Dr. Umara Zahid",
  },
  {
    title: "Decor Fusion",
    name: "Samia Sabir, AribahQaiser",
    reg_no: "4240-FBAS/BSSE/F21/B, 4190-FBAS/BSSE/F21/B",
    supervisor: "Ms. Maryam Amin",
  },
  {
    title: "SIGN LANGUAGE TRANSLATOR",
    name: "HABIBA SAEED",
    reg_no: "4188-FBAS/BSSE/F21/B",
    supervisor: "Dr. Umara Zahid",
  },
  {
    title: "FYP Navigator",
    name: "Mariam Zahra, Iqra Saleem",
    reg_no: "4061-FBAS/BSSE/F20, 4172-FBAS/BSSE/F21B",
    supervisor: "Dr. Umara Zahid",
  },
  {
    title: "HTP Auto Assess",
    name: "Adan Riaz Zeb",
    reg_no: "4234-FOC/BSSE/F21B",
    supervisor: "Ms. Saba Taimouri",
  },
  {
    title: "AI-Driven Mental Health Support System",
    name: "Laiba Javaid",
    reg_no: "4242-FOC/BSSE/F21B",
    supervisor: "Ms. Tehmina Mehboob",
  },
  {
    title: "ASPIRE: An Online Platform",
    name: "Aleeza Jabeen, Rabia Mahnoor",
    reg_no: "4185-FOC/BSSE/F21B, 4231-FOC/BSSE/F21B",
    supervisor: "Ms. Talat Ambreen",
  },
  {
    title:
      "Blockchain-based decentralized donation voting and tracking system for cancer and heart patients.",
    name: "Umm-e-Aiman, Hira Mubeen",
    reg_no: "4102-FOC/BSSE/F20, 4080-FOC/BSSE/F20",
    supervisor: "Dr. Umara Zahid",
  },
  {
    title: "Online Examination System",
    name: "Maryam Khurshid, Irsa Shoukar",
    reg_no: "4205-FOC/BSSE/F21A, 4205-FOC/BSSE/F21A",
    supervisor: "Ms. Tehmina Mehboob",
  },
  {
    title: "Smart Furnish",
    name: "Dua Satti, Sehrish Fatima",
    reg_no: "4215-FOC/BSSE/F21A, 4193-FOC/BSSE/F21A",
    supervisor: "Ms. Saima Imtiaz",
  },
  {
    title: "Ambulance Assistance (Android Based)",
    name: "Eman Mushtaq",
    reg_no: "3895-FBAS/BSCS/F18",
    supervisor: "Dr. Salma Imtiaz",
  },
  {
    title: "Spicy delight ltd(web based)",
    name: "Umaira Khan, Irum Munsif",
    reg_no: "3839-FBAS/BSCS/F18, 3841-FBAS/BSCS/F18",
    supervisor: "Dr. Salma Imtiaz",
  },
  {
    title: "Stay Human (3D game)",
    name: "Qurat u lain Siddique, Sojhla Maryam",
    reg_no: "3931-FBAS/BSCS/F18, 3875-FBAS/BSCS/F18",
    supervisor: "Dr. Salma Imtiaz",
  },
  {
    title: "Automated Attendance System based on Facial Recognition",
    name: "Momina Ahmed, Saba Malik",
    reg_no: "3645-FBAS/BSSE/F18, 3687-FBAS/BSSE/F18",
    supervisor: "Dr. Salma Imtiaz",
  },
  {
    title: "Kids Smart Education",
    name: "Azra Batool, Sana kausar",
    reg_no: "3866-FBAS/BSCS/F18, 3854-FBAS/BSCS/F18",
    supervisor: "Dr. Salma Imtiaz",
  },
  {
    title: "Let’s Eat",
    name: "Jawaria Bano, Atiqa Baig",
    reg_no: "326-FBAS/BSIT4/F18, 309-FBAS/BSIT4/F18",
    supervisor: "Dr. Salma Imtiaz",
  },
  {
    title: "Ganache bakers",
    name: "Zahra Tahir",
    reg_no: "3652-FBAS/BSSE/F18",
    supervisor: "Ms. Saima Iqbal",
  },
  {
    title: "Quiz Application “Quizzly”",
    name: "Zahra Shahid, Saiga Khan",
    reg_no: "3719-FBAS/BSSE/F18, 374- FBAS/BSSE/F18",
    supervisor: "Ms. Saima Iqbal",
  },
  {
    title: "Lawyer on a click",
    name: "Shumaila Pervez",
    reg_no: "3707-FBAS/BSSE/F18",
    supervisor: "Ms. Saima Iqbal",
  },
  {
    title: "Event detection system (desktop application system)",
    name: "Noor-ul-Huda, Hadia Naseem",
    reg_no: "3675-FBAS/BSSE/F18, 3654-FBAS/BSSE/F18",
    supervisor: "Ms. Shaista Rashid",
  },
  {
    title: "IIUI App",
    name: "Hifsa Aziz, Sabika",
    reg_no: "3709-FBAS/BSSE/F18, 3741-FBAS/BSSE/F18",
    supervisor: "Ms. Talat Ambreen",
  },
  {
    title: "Chaupar Lobby",
    name: "Tuba naz, Mehnaz Sikandar",
    reg_no: "3734-FBAS/BSSE/F18, 3682-FBAS/BSSE/F18",
    supervisor: "Ms. Talat Ambreen",
  },
  {
    title: "Himalaya Photo state and stationary store",
    name: "Aneeqa Bibi, Naghma Sabir",
    reg_no: "3721-FBAS/BSSE/F18, 3736-FBAS/BSSE/F18",
    supervisor: "Ms. Talat Ambreen",
  },
  {
    title: "Rated Restaurants",
    name: "Unzilla Sultan",
    reg_no: "292-FBAS/BSIT/F18",
    supervisor: "Dr. Salma Imtiaz",
  },
  {
    title: "Medi-Life Medicose Management System",
    name: "Shakeiba Kanwal",
    reg_no: "3960-FBAS/BSSE/F19",
    supervisor: "Ms. Talat Ambreen",
  },
  {
    title: "Scope Document for The Hope School System",
    name: "Hurmat un Nisa",
    reg_no: "3932-FBAS/BSSE/F19",
    supervisor: "Ms. Saima Imtiaz",
  },
  {
    title: "E-Commerce Website For Chohan Mall",
    name: "Rafia Aftab, Saleha Waheed",
    reg_no: "3700-FBAS/BSSE/F19, 3940-FBAS/BSSE/F19",
    supervisor: "",
  },
  {
    title: "Scope Document for Travel guide For Gilgit Baltistan",
    name: "Ayesha Naseem Khan",
    reg_no: "3730-FBAS/BSSE/F18",
    supervisor: "Ms. Talat Ambreen",
  },
  {
    title: "Arsafa Hospital Management System",
    name: "Afshan Noor",
    reg_no: "4041-FBAS/BSSE/F19",
    supervisor: "",
  },
  {
    title: "Event Management Application",
    name: "Aneesa Jahangir",
    reg_no: "3956-FBAS/BSSE/F19",
    supervisor: "",
  },
  {
    title: "Social Media Syndication",
    name: "Inshrah Rohab",
    reg_no: "3944-FBAS/BSSE/F19",
    supervisor: "",
  },
  {
    title: "Adore Beauty Salon",
    name: "Maryam Gul",
    reg_no: "4039-FBAS/BSSE/F19",
    supervisor: "Ms. Shaista Rashid",
  },
  {
    title: "Design Kia",
    name: "Laiba Ajmal",
    reg_no: "3955-FBAS/BSSE/F19",
    supervisor: "",
  },
  {
    title: "Craftsmen Builders, Real Estate app & website",
    name: "Laraib Fatima",
    reg_no: "3961-FBAS/BSSE/F19",
    supervisor: "",
  },
  {
    title: "Disaster Information Cell",
    name: "Rida Fatima",
    reg_no: "3962-FBAS/BSSE/F19",
    supervisor: "Ms. Saima Iqbal",
  },
  {
    title: "PMIS ( Plantation Drive)",
    name: "Ammara Hamid",
    reg_no: "3982-FBAS/BSSE/F19",
    supervisor: "",
  },
  {
    title: "Online Property Booking Application",
    name: "Ezza Kousar",
    reg_no: "3686-FBAS/BSSE/F18",
    supervisor: "",
  },
  {
    title: "Healthy Wealthy Game",
    name: "Samavia Qamar",
    reg_no: "3667-FBAS/BSSE/F18",
    supervisor: "",
  },
  {
    title: "Pneumonia- Detection in XRAY Scans",
    name: "Hifza Tahir",
    reg_no: "3972-FBAS/BSSE/F19",
    supervisor: "Ms. Saima Imtiaz",
  },
  {
    title: "Project Management Application",
    name: "Nimra Noor, Hifza Malik",
    reg_no: "3975-FBAS/BSSE/F19, 3968-FBAS/BSSE/F19",
    supervisor: "Dr. Salma Imtiaz",
  },
  {
    title: "EASYMINER Pro (EMP)",
    name: "Tasmia Amir, Rabiya Shakeel",
    reg_no: "3946-FBAS/BSSE/F19, 3935-FBAS/BSSE/F19",
    supervisor: "Dr. Salma Imtiaz",
  },
  {
    title: "ARSA_BY_SADIA",
    name: "Sibgha Younis",
    reg_no: "3931-FBAS/BSSE/F19",
    supervisor: "Ms. Saima Imtiaz",
  },
  {
    title: "Online Veterinary Appointment Web Portal",
    name: "Qudsia Qudoos",
    reg_no: "3984-FBAS/BSSE/F19",
    supervisor: "Ms. Saima Imtiaz",
  },
  {
    title: "Personnel Platform",
    name: "Isha Tariq",
    reg_no: "3973-FBAS/BSSE/F19",
    supervisor: "Ms. Saima Imtiaz",
  },
  {
    title: "Customer Relationship Management (CRM)",
    name: "Roseba Rubab",
    reg_no: "3945-FBAS/BSSE/F19",
    supervisor: "Ms. Saima Imtiaz",
  },
  {
    title: "UK College of English",
    name: "Irsa Ajmal",
    reg_no: "3951-FBAS/BSSE/F19",
    supervisor: "Ms. Saima Imtiaz",
  },
  {
    title: "Hotel Management System (White Palace)",
    name: "Fatima Zaheer",
    reg_no: "3943-FBAS/BSSE/F19",
    supervisor: "Ms. Shaista Rashid",
  },
  {
    title: "Home Bliss (Home Automation System)",
    name: "Aiza Noor",
    reg_no: "3963-FBAS/BSSE/F19",
    supervisor: "Ms. Saima Iqbal",
  },
  {
    title: "Digital Division Pakistan",
    name: "Aqua Suleman",
    reg_no: "3978-FBAS/BSSE/F19",
    supervisor: "Ms. Shaista Rashid",
  },
  {
    title: "Smart Mart",
    name: "Umaira Shaheen",
    reg_no: "3967-FBAS/BSSE/F19",
    supervisor: "Ms. Shaista Rashid",
  },
  {
    title: "The Gold Vault",
    name: "Eman Khurshid",
    reg_no: "3941-FBAS/BSSE/F19",
    supervisor: "Ms. Shaista Rashid",
  },
  {
    title: "Online hostel System",
    name: "Hajra batool",
    reg_no: "3688-FBAS/BSSE/F18",
    supervisor: "Ms. Talat Ambreen",
  },
];
export default projectData;
