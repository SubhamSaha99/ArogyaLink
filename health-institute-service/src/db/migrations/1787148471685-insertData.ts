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
  }
}
