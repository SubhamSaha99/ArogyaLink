import { MigrationInterface, QueryRunner } from 'typeorm';

export class InsertData1786077613166 implements MigrationInterface {
  name = 'InsertData1786077613166';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Indian States & UTs
    await queryRunner.query(`
      INSERT INTO state_master
      (state_name, state_code)
      VALUES
        ('Andhra Pradesh','AP'),
        ('Arunachal Pradesh','AR'),
        ('Assam','AS'),
        ('Bihar','BR'),
        ('Chhattisgarh','CG'),
        ('Goa','GA'),
        ('Gujarat','GJ'),
        ('Haryana','HR'),
        ('Himachal Pradesh','HP'),
        ('Jharkhand','JH'),
        ('Karnataka','KA'),
        ('Kerala','KL'),
        ('Madhya Pradesh','MP'),
        ('Maharashtra','MH'),
        ('Manipur','MN'),
        ('Meghalaya','ML'),
        ('Mizoram','MZ'),
        ('Nagaland','NL'),
        ('Odisha','OD'),
        ('Punjab','PB'),
        ('Rajasthan','RJ'),
        ('Sikkim','SK'),
        ('Tamil Nadu','TN'),
        ('Telangana','TS'),
        ('Tripura','TR'),
        ('Uttar Pradesh','UP'),
        ('Uttarakhand','UK'),
        ('West Bengal','WB'),
        ('Andaman and Nicobar Islands','AN'),
        ('Chandigarh','CH'),
        ('Dadra and Nagar Haveli and Daman and Diu','DH'),
        ('Delhi','DL'),
        ('Jammu and Kashmir','JK'),
        ('Ladakh','LA'),
        ('Lakshadweep','LD'),
        ('Puducherry','PY')
      ON CONFLICT (state_code) DO NOTHING;
    `);

    await queryRunner.query(`
      INSERT INTO district_master
        (state_id, district_name, district_code)
      VALUES
        (1, 'Alluri Sitharama Raju', 'AP-001'),\n        (1, 'Anakapalli', 'AP-002'),\n        (1, 'Ananthapuramu', 'AP-003'),\n        (1, 'Annamayya', 'AP-004'),\n        (1, 'Bapatla', 'AP-005'),\n        (1, 'Chittoor', 'AP-006'),\n        (1, 'Dr. B.R. Ambedkar Konaseema', 'AP-007'),\n        (1, 'East Godavari', 'AP-008'),\n        (1, 'Eluru', 'AP-009'),\n        (1, 'Guntur', 'AP-010'),\n        (1, 'Kakinada', 'AP-011'),\n        (1, 'Krishna', 'AP-012'),\n        (1, 'Kurnool', 'AP-013'),\n        (1, 'Markapuram', 'AP-014'),\n        (1, 'Nandyal', 'AP-015'),\n        (1, 'Ntr', 'AP-016'),\n        (1, 'Palnadu', 'AP-017'),\n        (1, 'Parvathipuram Manyam', 'AP-018'),\n        (1, 'Polavaram', 'AP-019'),\n        (1, 'Prakasam', 'AP-020'),\n        (1, 'Sri Potti Sriramulu Nellore', 'AP-021'),\n        (1, 'Sri Sathya Sai', 'AP-022'),\n        (1, 'Srikakulam', 'AP-023'),\n        (1, 'Tirupati', 'AP-024'),\n        (1, 'Visakhapatnam', 'AP-025'),\n        (1, 'Vizianagaram', 'AP-026'),\n        (1, 'West Godavari', 'AP-027'),\n        (1, 'YSR Kadapa', 'AP-028'),\n        (2, 'Anjaw', 'AR-001'),\n        (2, 'Bichom', 'AR-002'),\n        (2, 'Changlang', 'AR-003'),\n        (2, 'Dibang Valley', 'AR-004'),\n        (2, 'East Kameng', 'AR-005'),\n        (2, 'East Siang', 'AR-006'),\n        (2, 'Kamle', 'AR-007'),\n        (2, 'Keyi Panyor', 'AR-008'),\n        (2, 'Kra Daadi', 'AR-009'),\n        (2, 'Kurung Kumey', 'AR-010'),\n        (2, 'Leparada', 'AR-011'),\n        (2, 'Lohit', 'AR-012'),\n        (2, 'Longding', 'AR-013'),\n        (2, 'Lower Dibang Valley', 'AR-014'),\n        (2, 'Lower Siang', 'AR-015'),\n        (2, 'Lower Subansiri', 'AR-016'),\n        (2, 'Namsai', 'AR-017'),\n        (2, 'Pakke Kessang', 'AR-018'),\n        (2, 'Papum Pare', 'AR-019'),\n        (2, 'Shi Yomi', 'AR-020'),\n        (2, 'Siang', 'AR-021'),\n        (2, 'Tawang', 'AR-022'),\n        (2, 'Tirap', 'AR-023'),\n        (2, 'Upper Siang', 'AR-024'),\n        (2, 'Upper Subansiri', 'AR-025'),\n        (2, 'West Kameng', 'AR-026'),\n        (2, 'West Siang', 'AR-027'),\n        (3, 'Bajali', 'AS-001'),\n        (3, 'Baksa', 'AS-002'),\n        (3, 'Barpeta', 'AS-003'),\n        (3, 'Biswanath', 'AS-004'),\n        (3, 'Bongaigaon', 'AS-005'),\n        (3, 'Cachar', 'AS-006'),\n        (3, 'Charaideo', 'AS-007'),\n        (3, 'Chirang', 'AS-008'),\n        (3, 'Darrang', 'AS-009'),\n        (3, 'Dhemaji', 'AS-010'),\n        (3, 'Dhubri', 'AS-011'),\n        (3, 'Dibrugarh', 'AS-012'),\n        (3, 'Dima Hasao', 'AS-013'),\n        (3, 'Goalpara', 'AS-014'),\n        (3, 'Golaghat', 'AS-015'),\n        (3, 'Hailakandi', 'AS-016'),\n        (3, 'Hojai', 'AS-017'),\n        (3, 'Jorhat', 'AS-018'),\n        (3, 'Kamrup', 'AS-019'),\n        (3, 'Kamrup Metropolitan', 'AS-020'),\n        (3, 'Karbi Anglong', 'AS-021'),\n        (3, 'Kokrajhar', 'AS-022'),\n        (3, 'Lakhimpur', 'AS-023'),\n        (3, 'Majuli', 'AS-024'),\n        (3, 'Morigaon', 'AS-025'),\n        (3, 'Nagaon', 'AS-026'),\n        (3, 'Nalbari', 'AS-027'),\n        (3, 'Sivasagar', 'AS-028'),\n        (3, 'Sonitpur', 'AS-029'),\n        (3, 'South Salmara-Mankachar', 'AS-030'),\n        (3, 'Tinsukia', 'AS-031'),\n        (3, 'Udalguri', 'AS-032'),\n        (3, 'West Karbi Anglong', 'AS-033'),\n        (3, 'Tamulpur', 'AS-034'),\n        (3, 'Sribhumi', 'AS-035'),\n        (4, 'Araria', 'BR-001'),\n        (4, 'Arwal', 'BR-002'),\n        (4, 'Aurangabad', 'BR-003'),\n        (4, 'Banka', 'BR-004'),\n        (4, 'Begusarai', 'BR-005'),\n        (4, 'Bhagalpur', 'BR-006'),\n        (4, 'Bhojpur', 'BR-007'),\n        (4, 'Buxar', 'BR-008'),\n        (4, 'Darbhanga', 'BR-009'),\n        (4, 'Gaya', 'BR-010'),\n        (4, 'Gopalganj', 'BR-011'),\n        (4, 'Jamui', 'BR-012'),\n        (4, 'Jehanabad', 'BR-013'),\n        (4, 'Kaimur (Bhabua)', 'BR-014'),\n        (4, 'Katihar', 'BR-015'),\n        (4, 'Khagaria', 'BR-016'),\n        (4, 'Kishanganj', 'BR-017'),\n        (4, 'Lakhisarai', 'BR-018'),\n        (4, 'Madhepura', 'BR-019'),\n        (4, 'Madhubani', 'BR-020'),\n        (4, 'Munger', 'BR-021'),\n        (4, 'Muzaffarpur', 'BR-022'),\n        (4, 'Nalanda', 'BR-023'),\n        (4, 'Nawada', 'BR-024'),\n        (4, 'Pashchim Champaran', 'BR-025'),\n        (4, 'Purba Champaran', 'BR-026'),\n        (4, 'Patna', 'BR-027'),\n        (4, 'Purnia', 'BR-028'),\n        (4, 'Rohtas', 'BR-029'),\n        (4, 'Saharsa', 'BR-030'),\n        (4, 'Samastipur', 'BR-031'),\n        (4, 'Saran', 'BR-032'),\n        (4, 'Sheikhpura', 'BR-033'),\n        (4, 'Sheohar', 'BR-034'),\n        (4, 'Sitamarhi', 'BR-035'),\n        (4, 'Siwan', 'BR-036'),\n        (4, 'Supaul', 'BR-037'),\n        (4, 'Vaishali', 'BR-038'),\n        (5, 'Balod', 'CG-001'),\n        (5, 'Balodabazar-Bhatapara', 'CG-002'),\n        (5, 'Balrampur-Ramanujganj', 'CG-003'),\n        (5, 'Bastar', 'CG-004'),\n        (5, 'Bemetara', 'CG-005'),\n        (5, 'Bijapur', 'CG-006'),\n        (5, 'Bilaspur', 'CG-007'),\n        (5, 'Dakshin Bastar Dantewada', 'CG-008'),\n        (5, 'Dhamtari', 'CG-009'),\n        (5, 'Durg', 'CG-010'),\n        (5, 'Gariyaband', 'CG-011'),\n        (5, 'Gaurela-Pendra-Marwahi', 'CG-012'),\n        (5, 'Janjgir-Champa', 'CG-013'),\n        (5, 'Jashpur', 'CG-014'),\n        (5, 'Kabeerdham', 'CG-015'),\n        (5, 'Khairagarh-Chhuikhadan-Gandai', 'CG-016'),\n        (5, 'Kondagaon', 'CG-017'),\n        (5, 'Korba', 'CG-018'),\n        (5, 'Korea', 'CG-019'),\n        (5, 'Mahasamund', 'CG-020'),\n        (5, 'Manendragarh-Chirmiri-Bharatpur(M C B)', 'CG-021'),\n        (5, 'Mohla-Manpur-Ambagarh Chouki', 'CG-022'),\n        (5, 'Mungeli', 'CG-023'),\n        (5, 'Narayanpur', 'CG-024'),\n        (5, 'Raigarh', 'CG-025'),\n        (5, 'Raipur', 'CG-026'),\n        (5, 'Rajnandgaon', 'CG-027'),\n        (5, 'Sakti', 'CG-028'),\n        (5, 'Sarangarh-Bilaigarh', 'CG-029'),\n        (5, 'Sukma', 'CG-030'),\n        (5, 'Surajpur', 'CG-031'),\n        (5, 'Surguja', 'CG-032'),\n        (5, 'Kabirdham', 'CG-033'),\n        (6, 'Kushavati', 'GA-001'),\n        (6, 'North Goa', 'GA-002'),\n        (6, 'South Goa', 'GA-003'),\n        (7, 'Ahmedabad', 'GJ-001'),\n        (7, 'Amreli', 'GJ-002'),\n        (7, 'Anand', 'GJ-003'),\n        (7, 'Arvalli', 'GJ-004'),\n        (7, 'Banas Kantha', 'GJ-005'),\n        (7, 'Bharuch', 'GJ-006'),\n        (7, 'Bhavnagar', 'GJ-007'),\n        (7, 'Botad', 'GJ-008'),\n        (7, 'Chhotaudepur', 'GJ-009'),\n        (7, 'Dahod', 'GJ-010'),\n        (7, 'Dangs', 'GJ-011'),\n        (7, 'Devbhumi Dwarka', 'GJ-012'),\n        (7, 'Gandhinagar', 'GJ-013'),\n        (7, 'Gir Somnath', 'GJ-014'),\n        (7, 'Jamnagar', 'GJ-015'),\n        (7, 'Junagadh', 'GJ-016'),\n        (7, 'Kachchh', 'GJ-017'),\n        (7, 'Kheda', 'GJ-018'),\n        (7, 'Mahesana', 'GJ-019'),\n        (7, 'Mahisagar', 'GJ-020'),\n        (7, 'Morbi', 'GJ-021'),\n        (7, 'Narmada', 'GJ-022'),\n        (7, 'Navsari', 'GJ-023'),\n        (7, 'Panch Mahals', 'GJ-024'),\n        (7, 'Patan', 'GJ-025'),\n        (7, 'Porbandar', 'GJ-026'),\n        (7, 'Rajkot', 'GJ-027'),\n        (7, 'Sabarkantha', 'GJ-028'),\n        (7, 'Surat', 'GJ-029'),\n        (7, 'Surendranagar', 'GJ-030'),\n        (7, 'Tapi', 'GJ-031'),\n        (7, 'Vadodara', 'GJ-032'),\n        (7, 'Valsad', 'GJ-033'),\n        (7, 'Vav-Tharad', 'GJ-034'),\n        (8, 'Ambala', 'HR-001'),\n        (8, 'Bhiwani', 'HR-002'),\n        (8, 'Charkhi Dadri', 'HR-003'),\n        (8, 'Faridabad', 'HR-004'),\n        (8, 'Fatehabad', 'HR-005'),\n        (8, 'Gurugram', 'HR-006'),\n        (8, 'Hansi', 'HR-007'),\n        (8, 'Hisar', 'HR-008'),\n        (8, 'Jhajjar', 'HR-009'),\n        (8, 'Jind', 'HR-010'),\n        (8, 'Kaithal', 'HR-011'),\n        (8, 'Karnal', 'HR-012'),\n        (8, 'Kurukshetra', 'HR-013'),\n        (8, 'Mahendragarh', 'HR-014'),\n        (8, 'Nuh', 'HR-015'),\n        (8, 'Palwal', 'HR-016'),\n        (8, 'Panchkula', 'HR-017'),\n        (8, 'Panipat', 'HR-018'),\n        (8, 'Rewari', 'HR-019'),\n        (8, 'Rohtak', 'HR-020'),\n        (8, 'Sirsa', 'HR-021'),\n        (8, 'Sonipat', 'HR-022'),\n        (8, 'Yamunanagar', 'HR-023'),\n        (9, 'Bilaspur', 'HP-001'),\n        (9, 'Chamba', 'HP-002'),\n        (9, 'Hamirpur', 'HP-003'),\n        (9, 'Kangra', 'HP-004'),\n        (9, 'Kinnaur', 'HP-005'),\n        (9, 'Kullu', 'HP-006'),\n        (9, 'Lahaul And Spiti', 'HP-007'),\n        (9, 'Mandi', 'HP-008'),\n        (9, 'Shimla', 'HP-009'),\n        (9, 'Sirmaur', 'HP-010'),\n        (9, 'Solan', 'HP-011'),\n        (9, 'Una', 'HP-012'),\n        (10, 'Bokaro', 'JH-001'),\n        (10, 'Chatra', 'JH-002'),\n        (10, 'Deoghar', 'JH-003'),\n        (10, 'Dhanbad', 'JH-004'),\n        (10, 'Dumka', 'JH-005'),\n        (10, 'East Singhbum', 'JH-006'),\n        (10, 'Garhwa', 'JH-007'),\n        (10, 'Giridih', 'JH-008'),\n        (10, 'Godda', 'JH-009'),\n        (10, 'Gumla', 'JH-010'),\n        (10, 'Hazaribagh', 'JH-011'),\n        (10, 'Jamtara', 'JH-012'),\n        (10, 'Khunti', 'JH-013'),\n        (10, 'Koderma', 'JH-014'),\n        (10, 'Latehar', 'JH-015'),\n        (10, 'Lohardaga', 'JH-016'),\n        (10, 'Pakur', 'JH-017'),\n        (10, 'Palamu', 'JH-018'),\n        (10, 'Ramgarh', 'JH-019'),\n        (10, 'Ranchi', 'JH-020'),\n        (10, 'Sahebganj', 'JH-021'),\n        (10, 'Saraikela Kharsawan', 'JH-022'),\n        (10, 'Simdega', 'JH-023'),\n        (10, 'West Singhbhum', 'JH-024'),\n        (11, 'Bagalkote', 'KA-001'),\n        (11, 'Ballari', 'KA-002'),\n        (11, 'Belagavi', 'KA-003'),\n        (11, 'Bengaluru Rural', 'KA-004'),\n        (11, 'Bengaluru South', 'KA-005'),\n        (11, 'Bengaluru Urban', 'KA-006'),\n        (11, 'Bidar', 'KA-007'),\n        (11, 'Chamarajanagar', 'KA-008'),\n        (11, 'Chikkaballapura', 'KA-009'),\n        (11, 'Chikkamagaluru', 'KA-010'),\n        (11, 'Chitradurga', 'KA-011'),\n        (11, 'Dakshina Kannada', 'KA-012'),\n        (11, 'Davanagere', 'KA-013'),\n        (11, 'Dharwad', 'KA-014'),\n        (11, 'Gadag', 'KA-015'),\n        (11, 'Hassan', 'KA-016'),\n        (11, 'Haveri', 'KA-017'),\n        (11, 'Kalaburagi', 'KA-018'),\n        (11, 'Kodagu', 'KA-019'),\n        (11, 'Kolar', 'KA-020'),\n        (11, 'Koppal', 'KA-021'),\n        (11, 'Mandya', 'KA-022'),\n        (11, 'Mysuru', 'KA-023'),\n        (11, 'Raichur', 'KA-024'),\n        (11, 'Shivamogga', 'KA-025'),\n        (11, 'Tumakuru', 'KA-026'),\n        (11, 'Udupi', 'KA-027'),\n        (11, 'Uttara Kannada', 'KA-028'),\n        (11, 'Vijayapura', 'KA-029'),\n        (11, 'Yadgir', 'KA-030'),\n        (11, 'Vijayanagara', 'KA-031'),\n        (12, 'Alappuzha', 'KL-001'),\n        (12, 'Ernakulam', 'KL-002'),\n        (12, 'Idukki', 'KL-003'),\n        (12, 'Kannur', 'KL-004'),\n        (12, 'Kasaragod', 'KL-005'),\n        (12, 'Kollam', 'KL-006'),\n        (12, 'Kottayam', 'KL-007'),\n        (12, 'Kozhikode', 'KL-008'),\n        (12, 'Malappuram', 'KL-009'),\n        (12, 'Palakkad', 'KL-010'),\n        (12, 'Pathanamthitta', 'KL-011'),\n        (12, 'Thiruvananthapuram', 'KL-012'),\n        (12, 'Thrissur', 'KL-013'),\n        (12, 'Wayanad', 'KL-014'),\n        (13, 'Agar-Malwa', 'MP-001'),\n        (13, 'Alirajpur', 'MP-002'),\n        (13, 'Anuppur', 'MP-003'),\n        (13, 'Ashoknagar', 'MP-004'),\n        (13, 'Balaghat', 'MP-005'),\n        (13, 'Barwani', 'MP-006'),\n        (13, 'Betul', 'MP-007'),\n        (13, 'Bhind', 'MP-008'),\n        (13, 'Bhopal', 'MP-009'),\n        (13, 'Burhanpur', 'MP-010'),\n        (13, 'Chhatarpur', 'MP-011'),\n        (13, 'Chhindwara', 'MP-012'),\n        (13, 'Damoh', 'MP-013'),\n        (13, 'Datia', 'MP-014'),\n        (13, 'Dewas', 'MP-015'),\n        (13, 'Dhar', 'MP-016'),\n        (13, 'Dindori', 'MP-017'),\n        (13, 'Guna', 'MP-018'),\n        (13, 'Gwalior', 'MP-019'),\n        (13, 'Harda', 'MP-020'),\n        (13, 'Indore', 'MP-021'),\n        (13, 'Jabalpur', 'MP-022'),\n        (13, 'Jhabua', 'MP-023'),\n        (13, 'Katni', 'MP-024'),\n        (13, 'Khandwa (East Nimar)', 'MP-025'),\n        (13, 'Khargone (West Nimar)', 'MP-026'),\n        (13, 'Mandla', 'MP-027'),\n        (13, 'Mandsaur', 'MP-028'),\n        (13, 'Maihar', 'MP-029'),\n        (13, 'Mauganj', 'MP-030'),\n        (13, 'Morena', 'MP-031'),\n        (13, 'Narmadapuram', 'MP-032'),\n        (13, 'Narsinghpur', 'MP-033'),\n        (13, 'Neemuch', 'MP-034'),\n        (13, 'Niwari', 'MP-035'),\n        (13, 'Panna', 'MP-036'),\n        (13, 'Raisen', 'MP-037'),\n        (13, 'Rajgarh', 'MP-038'),\n        (13, 'Ratlam', 'MP-039'),\n        (13, 'Rewa', 'MP-040'),\n        (13, 'Sagar', 'MP-041'),\n        (13, 'Satna', 'MP-042'),\n        (13, 'Sehore', 'MP-043'),\n        (13, 'Seoni', 'MP-044'),\n        (13, 'Shahdol', 'MP-045'),\n        (13, 'Shajapur', 'MP-046'),\n        (13, 'Sheopur', 'MP-047'),\n        (13, 'Shivpuri', 'MP-048'),\n        (13, 'Sidhi', 'MP-049'),\n        (13, 'Singrauli', 'MP-050'),\n        (13, 'Tikamgarh', 'MP-051'),\n        (13, 'Ujjain', 'MP-052'),\n        (13, 'Umaria', 'MP-053'),\n        (13, 'Vidisha', 'MP-054'),\n        (13, 'Pandhurna', 'MP-055'),\n        (14, 'Ahilyanagar', 'MH-001'),\n        (14, 'Akola', 'MH-002'),\n        (14, 'Amravati', 'MH-003'),\n        (14, 'Beed', 'MH-004'),\n        (14, 'Bhandara', 'MH-005'),\n        (14, 'Buldhana', 'MH-006'),\n        (14, 'Chandrapur', 'MH-007'),\n        (14, 'Chhatrapati Sambhajinagar', 'MH-008'),\n        (14, 'Dharashiv', 'MH-009'),\n        (14, 'Dhule', 'MH-010'),\n        (14, 'Gadchiroli', 'MH-011'),\n        (14, 'Gondia', 'MH-012'),\n        (14, 'Hingoli', 'MH-013'),\n        (14, 'Jalgaon', 'MH-014'),\n        (14, 'Jalna', 'MH-015'),\n        (14, 'Kolhapur', 'MH-016'),\n        (14, 'Latur', 'MH-017'),\n        (14, 'Mumbai', 'MH-018'),\n        (14, 'Mumbai Suburban', 'MH-019'),\n        (14, 'Nagpur', 'MH-020'),\n        (14, 'Nanded', 'MH-021'),\n        (14, 'Nandurbar', 'MH-022'),\n        (14, 'Nashik', 'MH-023'),\n        (14, 'Palghar', 'MH-024'),\n        (14, 'Parbhani', 'MH-025'),\n        (14, 'Pune', 'MH-026'),\n        (14, 'Raigad', 'MH-027'),\n        (14, 'Ratnagiri', 'MH-028'),\n        (14, 'Sangli', 'MH-029'),\n        (14, 'Satara', 'MH-030'),\n        (14, 'Sindhudurg', 'MH-031'),\n        (14, 'Solapur', 'MH-032'),\n        (14, 'Thane', 'MH-033'),\n        (14, 'Wardha', 'MH-034'),\n        (14, 'Washim', 'MH-035'),\n        (14, 'Yavatmal', 'MH-036'),\n        (15, 'Bishnupur', 'MN-001'),\n        (15, 'Chandel', 'MN-002'),\n        (15, 'Churachandpur', 'MN-003'),\n        (15, 'Imphal East', 'MN-004'),\n        (15, 'Imphal West', 'MN-005'),\n        (15, 'Jiribam', 'MN-006'),\n        (15, 'Kakching', 'MN-007'),\n        (15, 'Kamjong', 'MN-008'),\n        (15, 'Kangpokpi', 'MN-009'),\n        (15, 'Noney', 'MN-010'),\n        (15, 'Pherzawl', 'MN-011'),\n        (15, 'Senapati', 'MN-012'),\n        (15, 'Tamenglong', 'MN-013'),\n        (15, 'Tengnoupal', 'MN-014'),\n        (15, 'Thoubal', 'MN-015'),\n        (15, 'Ukhrul', 'MN-016'),\n        (16, 'East Garo Hills', 'ML-001'),\n        (16, 'East Jaintia Hills', 'ML-002'),\n        (16, 'East Khasi Hills', 'ML-003'),\n        (16, 'Eastern West Khasi Hills', 'ML-004'),\n        (16, 'North Garo Hills', 'ML-005'),\n        (16, 'Ri Bhoi', 'ML-006'),\n        (16, 'South Garo Hills', 'ML-007'),\n        (16, 'South West Garo Hills', 'ML-008'),\n        (16, 'South West Khasi Hills', 'ML-009'),\n        (16, 'West Garo Hills', 'ML-010'),\n        (16, 'West Jaintia Hills', 'ML-011'),\n        (16, 'West Khasi Hills', 'ML-012'),\n        (17, 'Aizawl', 'MZ-001'),\n        (17, 'Champhai', 'MZ-002'),\n        (17, 'Hnahthial', 'MZ-003'),\n        (17, 'Khawzawl', 'MZ-004'),\n        (17, 'Kolasib', 'MZ-005'),\n        (17, 'Lawngtlai', 'MZ-006'),\n        (17, 'Lunglei', 'MZ-007'),\n        (17, 'Mamit', 'MZ-008'),\n        (17, 'Saitual', 'MZ-009'),\n        (17, 'Serchhip', 'MZ-010'),\n        (17, 'Siaha', 'MZ-011'),\n        (18, 'Chumoukedima', 'NL-001'),\n        (18, 'Dimapur', 'NL-002'),\n        (18, 'Kiphire', 'NL-003'),\n        (18, 'Kohima', 'NL-004'),\n        (18, 'Longleng', 'NL-005'),\n        (18, 'Meluri', 'NL-006'),\n        (18, 'Mokokchung', 'NL-007'),\n        (18, 'Mon', 'NL-008'),\n        (18, 'Niuland', 'NL-009'),\n        (18, 'Noklak', 'NL-010'),\n        (18, 'Peren', 'NL-011'),\n        (18, 'Phek', 'NL-012'),\n        (18, 'Shamator', 'NL-013'),\n        (18, 'Tseminyu', 'NL-014'),\n        (18, 'Tuensang', 'NL-015'),\n        (18, 'Wokha', 'NL-016'),\n        (18, 'Zunheboto', 'NL-017'),\n        (19, 'Anugola', 'OD-001'),\n        (19, 'Balangir', 'OD-002'),\n        (19, 'Baleshwar', 'OD-003'),\n        (19, 'Baragada', 'OD-004'),\n        (19, 'Bhadrak', 'OD-005'),\n        (19, 'Boudh', 'OD-006'),\n        (19, 'Debagada', 'OD-007'),\n        (19, 'Dhenkanal', 'OD-008'),\n        (19, 'Gajapati', 'OD-009'),\n        (19, 'Ganjam', 'OD-010'),\n        (19, 'Jagatsinghapur', 'OD-011'),\n        (19, 'Jajpur', 'OD-012'),\n        (19, 'Jharsuguda', 'OD-013'),\n        (19, 'Kalahandi', 'OD-014'),\n        (19, 'Kandhamala', 'OD-015'),\n        (19, 'Kataka', 'OD-016'),\n        (19, 'Kendrapada', 'OD-017'),\n        (19, 'Kendujhar', 'OD-018'),\n        (19, 'Khordha', 'OD-019'),\n        (19, 'Koraput', 'OD-020'),\n        (19, 'Malkangiri', 'OD-021'),\n        (19, 'Mayurbhanj', 'OD-022'),\n        (19, 'Nabarangpur', 'OD-023'),\n        (19, 'Nayagada', 'OD-024'),\n        (19, 'Nuapada', 'OD-025'),\n        (19, 'Puri', 'OD-026'),\n        (19, 'Rayagada', 'OD-027'),\n        (19, 'Sambalpur', 'OD-028'),\n        (19, 'Subarnapur', 'OD-029'),\n        (19, 'Sundargarh', 'OD-030'),\n        (20, 'Amritsar', 'PB-001'),\n        (20, 'Barnala', 'PB-002'),\n        (20, 'Bathinda', 'PB-003'),\n        (20, 'Faridkot', 'PB-004'),\n        (20, 'Fatehgarh Sahib', 'PB-005'),\n        (20, 'Fazilka', 'PB-006'),\n        (20, 'Ferozepur', 'PB-007'),\n        (20, 'Gurdaspur', 'PB-008'),\n        (20, 'Hoshiarpur', 'PB-009'),\n        (20, 'Jalandhar', 'PB-010'),\n        (20, 'Kapurthala', 'PB-011'),\n        (20, 'Ludhiana', 'PB-012'),\n        (20, 'Malerkotla', 'PB-013'),\n        (20, 'Mansa', 'PB-014'),\n        (20, 'Moga', 'PB-015'),\n        (20, 'Pathankot', 'PB-016'),\n        (20, 'Patiala', 'PB-017'),\n        (20, 'Rupnagar', 'PB-018'),\n        (20, 'S.A.S Nagar', 'PB-019'),\n        (20, 'Sangrur', 'PB-020'),\n        (20, 'Shahid Bhagat Singh Nagar', 'PB-021'),\n        (20, 'Sri Muktsar Sahib', 'PB-022'),\n        (20, 'Tarn Taran', 'PB-023'),\n        (21, 'Ajmer', 'RJ-001'),\n        (21, 'Alwar', 'RJ-002'),\n        (21, 'Balotra', 'RJ-003'),\n        (21, 'Banswara', 'RJ-004'),\n        (21, 'Baran', 'RJ-005'),\n        (21, 'Barmer', 'RJ-006'),\n        (21, 'Beawar', 'RJ-007'),\n        (21, 'Bharatpur', 'RJ-008'),\n        (21, 'Bhilwara', 'RJ-009'),\n        (21, 'Bikaner', 'RJ-010'),\n        (21, 'Bundi', 'RJ-011'),\n        (21, 'Chittorgarh', 'RJ-012'),\n        (21, 'Churu', 'RJ-013'),\n        (21, 'Dausa', 'RJ-014'),\n        (21, 'Deeg', 'RJ-015'),\n        (21, 'Dholpur', 'RJ-016'),\n        (21, 'Didwana-Kuchaman', 'RJ-017'),\n        (21, 'Dungarpur', 'RJ-018'),\n        (21, 'Ganganagar', 'RJ-019'),\n        (21, 'Hanumangarh', 'RJ-020'),\n        (21, 'Jaipur', 'RJ-021'),\n        (21, 'Jaisalmer', 'RJ-022'),\n        (21, 'Jalore', 'RJ-023'),\n        (21, 'Jhalawar', 'RJ-024'),\n        (21, 'Jhunjhunu', 'RJ-025'),\n        (21, 'Jodhpur', 'RJ-026'),\n        (21, 'Karauli', 'RJ-027'),\n        (21, 'Khairthal-Tijara', 'RJ-028'),\n        (21, 'Kota', 'RJ-029'),\n        (21, 'Nagaur', 'RJ-030'),\n        (21, 'Pali', 'RJ-031'),\n        (21, 'Phalodi', 'RJ-032'),\n        (21, 'Pratapgarh', 'RJ-033'),\n        (21, 'Rajsamand', 'RJ-034'),\n        (21, 'Salumbar', 'RJ-035'),\n        (21, 'Sawai Madhopur', 'RJ-036'),\n        (21, 'Sikar', 'RJ-037'),\n        (21, 'Sirohi', 'RJ-038'),\n        (21, 'Tonk', 'RJ-039'),\n        (21, 'Udaipur', 'RJ-040'),\n        (21, 'Sri Ganganagar', 'RJ-041'),\n        (22, 'Gangtok', 'SK-001'),\n        (22, 'Gyalshing', 'SK-002'),\n        (22, 'Mangan', 'SK-003'),\n        (22, 'Namchi', 'SK-004'),\n        (22, 'Pakyong', 'SK-005'),\n        (22, 'Soreng', 'SK-006'),\n        (23, 'Ariyalur', 'TN-001'),\n        (23, 'Chengalpattu', 'TN-002'),\n        (23, 'Chennai', 'TN-003'),\n        (23, 'Coimbatore', 'TN-004'),\n        (23, 'Cuddalore', 'TN-005'),\n        (23, 'Dharmapuri', 'TN-006'),\n        (23, 'Dindigul', 'TN-007'),\n        (23, 'Erode', 'TN-008'),\n        (23, 'Kallakurichi', 'TN-009'),\n        (23, 'Kancheepuram', 'TN-010'),\n        (23, 'Kanniyakumari', 'TN-011'),\n        (23, 'Karur', 'TN-012'),\n        (23, 'Krishnagiri', 'TN-013'),\n        (23, 'Madurai', 'TN-014'),\n        (23, 'Mayiladuthurai', 'TN-015'),\n        (23, 'Nagapattinam', 'TN-016'),\n        (23, 'Namakkal', 'TN-017'),\n        (23, 'Perambalur', 'TN-018'),\n        (23, 'Pudukkottai', 'TN-019'),\n        (23, 'Ramanathapuram', 'TN-020'),\n        (23, 'Ranipet', 'TN-021'),\n        (23, 'Salem', 'TN-022'),\n        (23, 'Sivaganga', 'TN-023'),\n        (23, 'Tenkasi', 'TN-024'),\n        (23, 'Thanjavur', 'TN-025'),\n        (23, 'The Nilgiris', 'TN-026'),\n        (23, 'Theni', 'TN-027'),\n        (23, 'Thoothukudi', 'TN-028'),\n        (23, 'Tiruchirappalli', 'TN-029'),\n        (23, 'Tirunelveli', 'TN-030'),\n        (23, 'Tirupathur', 'TN-031'),\n        (23, 'Tiruppur', 'TN-032'),\n        (23, 'Tiruvallur', 'TN-033'),\n        (23, 'Tiruvannamalai', 'TN-034'),\n        (23, 'Tiruvarur', 'TN-035'),\n        (23, 'Vellore', 'TN-036'),\n        (23, 'Viluppuram', 'TN-037'),\n        (23, 'Virudhunagar', 'TN-038'),\n        (24, 'Adilabad', 'TS-001'),\n        (24, 'Bhadradri Kothagudem', 'TS-002'),\n        (24, 'Hanumakonda', 'TS-003'),\n        (24, 'Hyderabad', 'TS-004'),\n        (24, 'Jagitial', 'TS-005'),\n        (24, 'Jangoan', 'TS-006'),\n        (24, 'Jayashankar Bhupalapally', 'TS-007'),\n        (24, 'Jogulamba Gadwal', 'TS-008'),\n        (24, 'Kamareddy', 'TS-009'),\n        (24, 'Karimnagar', 'TS-010'),\n        (24, 'Khammam', 'TS-011'),\n        (24, 'Kumuram Bheem Asifabad', 'TS-012'),\n        (24, 'Mahabubabad', 'TS-013'),\n        (24, 'Mahabubnagar', 'TS-014'),\n        (24, 'Mancherial', 'TS-015'),\n        (24, 'Medak', 'TS-016'),\n        (24, 'Medchal Malkajgiri', 'TS-017'),\n        (24, 'Mulugu', 'TS-018'),\n        (24, 'Nagarkurnool', 'TS-019'),\n        (24, 'Nalgonda', 'TS-020'),\n        (24, 'Narayanpet', 'TS-021'),\n        (24, 'Nirmal', 'TS-022'),\n        (24, 'Nizamabad', 'TS-023'),\n        (24, 'Peddapalli', 'TS-024'),\n        (24, 'Rajanna Sircilla', 'TS-025'),\n        (24, 'Rangareddy', 'TS-026'),\n        (24, 'Sangareddy', 'TS-027'),\n        (24, 'Siddipet', 'TS-028'),\n        (24, 'Suryapet', 'TS-029'),\n        (24, 'Vikarabad', 'TS-030'),\n        (24, 'Wanaparthy', 'TS-031'),\n        (24, 'Warangal', 'TS-032'),\n        (24, 'Yadadri Bhuvanagiri', 'TS-033'),\n        (25, 'Dhalai', 'TR-001'),\n        (25, 'Gomati', 'TR-002'),\n        (25, 'Khowai', 'TR-003'),\n        (25, 'North Tripura', 'TR-004'),\n        (25, 'Sepahijala', 'TR-005'),\n        (25, 'South Tripura', 'TR-006'),\n        (25, 'Unakoti', 'TR-007'),\n        (25, 'West Tripura', 'TR-008'),\n        (26, 'Agra', 'UP-001'),\n        (26, 'Aligarh', 'UP-002'),\n        (26, 'Ambedkar Nagar', 'UP-003'),\n        (26, 'Amethi', 'UP-004'),\n        (26, 'Amroha', 'UP-005'),\n        (26, 'Auraiya', 'UP-006'),\n        (26, 'Ayodhya', 'UP-007'),\n        (26, 'Azamgarh', 'UP-008'),\n        (26, 'Baghpat', 'UP-009'),\n        (26, 'Bahraich', 'UP-010'),\n        (26, 'Ballia', 'UP-011'),\n        (26, 'Balrampur', 'UP-012'),\n        (26, 'Banda', 'UP-013'),\n        (26, 'Bara Banki', 'UP-014'),\n        (26, 'Bareilly', 'UP-015'),\n        (26, 'Basti', 'UP-016'),\n        (26, 'Bhadohi', 'UP-017'),\n        (26, 'Bijnor', 'UP-018'),\n        (26, 'Budaun', 'UP-019'),\n        (26, 'Bulandshahr', 'UP-020'),\n        (26, 'Chandauli', 'UP-021'),\n        (26, 'Chitrakoot', 'UP-022'),\n        (26, 'Deoria', 'UP-023'),\n        (26, 'Etah', 'UP-024'),\n        (26, 'Etawah', 'UP-025'),\n        (26, 'Farrukhabad', 'UP-026'),\n        (26, 'Fatehpur', 'UP-027'),\n        (26, 'Firozabad', 'UP-028'),\n        (26, 'Gautam Buddha Nagar', 'UP-029'),\n        (26, 'Ghaziabad', 'UP-030'),\n        (26, 'Ghazipur', 'UP-031'),\n        (26, 'Gonda', 'UP-032'),\n        (26, 'Gorakhpur', 'UP-033'),\n        (26, 'Hamirpur', 'UP-034'),\n        (26, 'Hapur', 'UP-035'),\n        (26, 'Hardoi', 'UP-036'),\n        (26, 'Hathras', 'UP-037'),\n        (26, 'Jalaun', 'UP-038'),\n        (26, 'Jaunpur', 'UP-039'),\n        (26, 'Jhansi', 'UP-040'),\n        (26, 'Kannauj', 'UP-041'),\n        (26, 'Kanpur Dehat', 'UP-042'),\n        (26, 'Kanpur Nagar', 'UP-043'),\n        (26, 'Kasganj', 'UP-044'),\n        (26, 'Kaushambi', 'UP-045'),\n        (26, 'Kheri', 'UP-046'),\n        (26, 'Kushinagar', 'UP-047'),\n        (26, 'Lalitpur', 'UP-048'),\n        (26, 'Lucknow', 'UP-049'),\n        (26, 'Maharajganj', 'UP-050'),\n        (26, 'Mahoba', 'UP-051'),\n        (26, 'Mainpuri', 'UP-052'),\n        (26, 'Mathura', 'UP-053'),\n        (26, 'Mau', 'UP-054'),\n        (26, 'Meerut', 'UP-055'),\n        (26, 'Mirzapur', 'UP-056'),\n        (26, 'Moradabad', 'UP-057'),\n        (26, 'Muzaffarnagar', 'UP-058'),\n        (26, 'Pilibhit', 'UP-059'),\n        (26, 'Pratapgarh', 'UP-060'),\n        (26, 'Prayagraj', 'UP-061'),\n        (26, 'Raebareli', 'UP-062'),\n        (26, 'Rampur', 'UP-063'),\n        (26, 'Saharanpur', 'UP-064'),\n        (26, 'Sambhal', 'UP-065'),\n        (26, 'Sant Kabir Nagar', 'UP-066'),\n        (26, 'Shahjahanpur', 'UP-067'),\n        (26, 'Shamli', 'UP-068'),\n        (26, 'Shrawasti', 'UP-069'),\n        (26, 'Siddharthnagar', 'UP-070'),\n        (26, 'Sitapur', 'UP-071'),\n        (26, 'Sonbhadra', 'UP-072'),\n        (26, 'Sultanpur', 'UP-073'),\n        (26, 'Unnao', 'UP-074'),\n        (26, 'Varanasi', 'UP-075'),\n        (27, 'Almora', 'UK-001'),\n        (27, 'Bageshwar', 'UK-002'),\n        (27, 'Chamoli', 'UK-003'),\n        (27, 'Champawat', 'UK-004'),\n        (27, 'Dehradun', 'UK-005'),\n        (27, 'Haridwar', 'UK-006'),\n        (27, 'Nainital', 'UK-007'),\n        (27, 'Pauri Garhwal', 'UK-008'),\n        (27, 'Pithoragarh', 'UK-009'),\n        (27, 'Rudraprayag', 'UK-010'),\n        (27, 'Tehri Garhwal', 'UK-011'),\n        (27, 'Udham Singh Nagar', 'UK-012'),\n        (27, 'Uttarkashi', 'UK-013'),\n        (28, 'Alipurduar', 'WB-001'),\n        (28, 'Bankura', 'WB-002'),\n        (28, 'Birbhum', 'WB-003'),\n        (28, 'Cooch Behar', 'WB-004'),\n        (28, 'Dakshin Dinajpur', 'WB-005'),\n        (28, 'Darjeeling', 'WB-006'),\n        (28, 'Hooghly', 'WB-007'),\n        (28, 'Howrah', 'WB-008'),\n        (28, 'Jalpaiguri', 'WB-009'),\n        (28, 'Jhargram', 'WB-010'),\n        (28, 'Kalimpong', 'WB-011'),\n        (28, 'Kolkata', 'WB-012'),\n        (28, 'Malda', 'WB-013'),\n        (28, 'Murshidabad', 'WB-014'),\n        (28, 'Nadia', 'WB-015'),\n        (28, 'North 24 Parganas', 'WB-016'),\n        (28, 'Paschim Bardhaman', 'WB-017'),\n        (28, 'Paschim Medinipur', 'WB-018'),\n        (28, 'Purba Bardhaman', 'WB-019'),\n        (28, 'Purba Medinipur', 'WB-020'),\n        (28, 'Purulia', 'WB-021'),\n        (28, 'South 24 Parganas', 'WB-022'),\n        (28, 'Uttar Dinajpur', 'WB-023'),\n        (29, 'Nicobars', 'AN-001'),\n        (29, 'North And Middle Andaman', 'AN-002'),\n        (29, 'South Andamans', 'AN-003'),\n        (30, 'Chandigarh', 'CH-001'),\n        (31, 'Dadra And Nagar Haveli', 'DH-001'),\n        (31, 'Daman', 'DH-002'),\n        (31, 'Diu', 'DH-003'),\n        (32, 'Central', 'DL-001'),\n        (32, 'Central North', 'DL-002'),\n        (32, 'East', 'DL-003'),\n        (32, 'New Delhi', 'DL-004'),\n        (32, 'North', 'DL-005'),\n        (32, 'North East', 'DL-006'),\n        (32, 'North West', 'DL-007'),\n        (32, 'Old Delhi', 'DL-008'),\n        (32, 'Outer North', 'DL-009'),\n        (32, 'South', 'DL-010'),\n        (32, 'South East', 'DL-011'),\n        (32, 'South West', 'DL-012'),\n        (32, 'West', 'DL-013'),\n        (33, 'Anantnag', 'JK-001'),\n        (33, 'Bandipora', 'JK-002'),\n        (33, 'Baramulla', 'JK-003'),\n        (33, 'Budgam', 'JK-004'),\n        (33, 'Doda', 'JK-005'),\n        (33, 'Ganderbal', 'JK-006'),\n        (33, 'Jammu', 'JK-007'),\n        (33, 'Kathua', 'JK-008'),\n        (33, 'Kishtwar', 'JK-009'),\n        (33, 'Kulgam', 'JK-010'),\n        (33, 'Kupwara', 'JK-011'),\n        (33, 'Poonch', 'JK-012'),\n        (33, 'Pulwama', 'JK-013'),\n        (33, 'Rajouri', 'JK-014'),\n        (33, 'Ramban', 'JK-015'),\n        (33, 'Reasi', 'JK-016'),\n        (33, 'Samba', 'JK-017'),\n        (33, 'Shopian', 'JK-018'),\n        (33, 'Srinagar', 'JK-019'),\n        (33, 'Udhampur', 'JK-020'),\n        (34, 'Kargil', 'LA-001'),\n        (34, 'Leh Ladakh', 'LA-002'),\n        (35, 'Lakshadweep', 'LD-001'),\n        (36, 'Karaikal', 'PY-001'),\n        (36, 'Puducherry', 'PY-002')
      ON CONFLICT (district_code) DO NOTHING;
    `);

    // Registration Councils
    await queryRunner.query(`
      INSERT INTO registration_council_master
      (council_name, council_code)
      VALUES
        ('National Medical Commission', 'NMC'),
        ('West Bengal Medical Council', 'WBMC'),
        ('Gujarat Medical Council', 'GMC'),
        ('Karnataka Medical Council', 'KMC'),
        ('Tamil Nadu Medical Council', 'TNMC'),
        ('Maharashtra Medical Council', 'MMC')
      ON CONFLICT (council_code) DO NOTHING;
    `);

    // DEPARTMENT MASTER

    await queryRunner.query(`
      INSERT INTO department_master (
        department_name,
        department_code
      )
      VALUES
        ('General Medicine', 'GENERAL_MEDICINE'),
        ('Cardiology', 'CARDIOLOGY'),
        ('Orthopedics', 'ORTHOPEDICS'),
        ('Pediatrics', 'PEDIATRICS'),
        ('Neurology', 'NEUROLOGY'),
        ('Dermatology', 'DERMATOLOGY'),
        ('Gynecology & Obstetrics', 'GYNECOLOGY_OBSTETRICS'),
        ('Emergency & Trauma', 'EMERGENCY_TRAUMA'),
        ('Anesthesiology', 'ANESTHESIOLOGY'),
        ('Radiology', 'RADIOLOGY')
      ON CONFLICT (department_code) DO NOTHING;
    `);

    // DESIGNATION MASTER

    await queryRunner.query(`
      INSERT INTO designation_master (
        designation_name,
        designation_code
      )
      VALUES
        ('Consultant', 'CONSULTANT'),
        ('Senior Consultant', 'SENIOR_CONSULTANT'),
        ('Visiting Specialist', 'VISITING_SPECIALIST'),
        ('Resident Medical Officer', 'RESIDENT_MEDICAL_OFFICER'),
        ('Department Head', 'DEPARTMENT_HEAD')
      ON CONFLICT (designation_code) DO NOTHING;
    `);

    // CONSULTATION SCOPE MASTER

    await queryRunner.query(`
      INSERT INTO consultation_scope_master (
        scope_name,
        scope_code
      )
      VALUES
        ('OPD & IPD Services', 'OPD_IPD'),
        ('OPD Consultations Only', 'OPD_ONLY'),
        ('IPD & Surgery Consultations', 'IPD_SURGERIES'),
        ('Teleconsultation & Remote', 'TELECONSULTATION'),
        ('On-Call Emergency Specialist', 'ON_CALL_EMERGENCY')
      ON CONFLICT (scope_code) DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM state_master
      WHERE state_code IN
      (
        'AP','AR','AS','BR','CG','GA','GJ','HR','HP','JH','KA','KL','MP',
        'MH','MN','ML','MZ','NL','OD','PB','RJ','SK','TN','TS','TR','UP',
        'UK','WB','AN','CH','DH','DL','JK','LA','LD','PY'
      );
    `);

    await queryRunner.query(`
      DELETE FROM district_master
      WHERE district_code ~ '^(AP|AR|AS|BR|CG|GA|GJ|HR|HP|JH|KA|KL|MP|MH|MN|ML|MZ|NL|OD|PB|RJ|SK|TN|TS|TR|UP|UK|WB|AN|CH|DH|DL|JK|LA|LD|PY)-[0-9]{3}$';
    `);

     await queryRunner.query(`
      DELETE FROM registration_council_master
      WHERE council_code IN
      ('NMC','WBMC','GMC','KMC','TNMC','MMC');
    `);

    // CONSULTATION SCOPE MASTER

    await queryRunner.query(`
      DELETE FROM consultation_scope_master
      WHERE scope_code IN (
        'OPD_IPD',
        'OPD_ONLY',
        'IPD_SURGERIES',
        'TELECONSULTATION',
        'ON_CALL_EMERGENCY'
      );
    `);

    // DESIGNATION MASTER

    await queryRunner.query(`
      DELETE FROM designation_master
      WHERE designation_code IN (
        'CONSULTANT',
        'SENIOR_CONSULTANT',
        'VISITING_SPECIALIST',
        'RESIDENT_MEDICAL_OFFICER',
        'DEPARTMENT_HEAD'
      );
    `);

    // DEPARTMENT MASTER
    await queryRunner.query(`
      DELETE FROM department_master
      WHERE department_code IN (
        'GENERAL_MEDICINE',
        'CARDIOLOGY',
        'ORTHOPEDICS',
        'PEDIATRICS',
        'NEUROLOGY',
        'DERMATOLOGY',
        'GYNECOLOGY_OBSTETRICS',
        'EMERGENCY_TRAUMA',
        'ANESTHESIOLOGY',
        'RADIOLOGY'
      );
    `);
  }
}
