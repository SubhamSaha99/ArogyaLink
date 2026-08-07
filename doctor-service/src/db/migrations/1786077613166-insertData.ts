import { MigrationInterface, QueryRunner } from 'typeorm';

export class InsertData1786077613166 implements MigrationInterface {
  name = 'InsertData1786077613166';

  public async up(queryRunner: QueryRunner): Promise<void> {
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

    // Qualifications
    await queryRunner.query(`
      INSERT INTO qualification_master
      (qualification_name, qualification_code)
      VALUES
        ('MBBS', 'MBBS'),
        ('MD', 'MD'),
        ('MS', 'MS'),
        ('DM', 'DM'),
        ('MCh', 'MCH'),
        ('DNB', 'DNB'),
        ('BDS', 'BDS'),
        ('MDS', 'MDS'),
        ('BAMS', 'BAMS'),
        ('BHMS', 'BHMS')
      ON CONFLICT (qualification_code) DO NOTHING;
    `);

    // Specializations
    await queryRunner.query(`
      INSERT INTO specialization_master
      (specialization_name, specialization_code)
      VALUES
        ('General Medicine', 'GENMED'),
        ('Cardiology', 'CARD'),
        ('Neurology', 'NEURO'),
        ('Orthopaedics', 'ORTHO'),
        ('Pediatrics', 'PED'),
        ('Dermatology', 'DERM'),
        ('ENT', 'ENT'),
        ('Ophthalmology', 'OPHTH'),
        ('Psychiatry', 'PSY'),
        ('Radiology', 'RAD')
      ON CONFLICT (specialization_code) DO NOTHING;
    `);

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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM specialization_master
      WHERE specialization_code IN
      ('GENMED','CARD','NEURO','ORTHO','PED','DERM','ENT','OPHTH','PSY','RAD');
    `);

    await queryRunner.query(`
      DELETE FROM qualification_master
      WHERE qualification_code IN
      ('MBBS','MD','MS','DM','MCH','DNB','BDS','MDS','BAMS','BHMS');
    `);

    await queryRunner.query(`
      DELETE FROM registration_council_master
      WHERE council_code IN
      ('NMC','WBMC','GMC','KMC','TNMC','MMC');
    `);

    await queryRunner.query(`
      DELETE FROM state_master
      WHERE state_code IN
      (
        'AP','AR','AS','BR','CG','GA','GJ','HR','HP','JH','KA','KL','MP',
        'MH','MN','ML','MZ','NL','OD','PB','RJ','SK','TN','TS','TR','UP',
        'UK','WB','AN','CH','DH','DL','JK','LA','LD','PY'
      );
    `);
  }
}
