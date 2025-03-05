export class StudentSearch {
  private searchName: string;
  private searchEmail: string;
  private searchDOB: { from: string; to: string };

  constructor() {
    this.searchName = '';
    this.searchEmail = '';
    this.searchDOB = { from: '', to: '' };
  }

  set name(name: string) {
    this.searchName = name;
  }

  set email(email: string) {
    this.searchEmail = email;
  }

  set dob(range: { from: string; to: string }) {
    this.searchDOB = range;
  }

  get name(): string {
    return this.searchName;
  }

  get email(): string {
    return this.searchEmail;
  }

  get dob(): { from: string; to: string } {
    return this.searchDOB;
  }
}
