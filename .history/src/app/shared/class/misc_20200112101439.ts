export class Misc {
  // adding leading zeroes
  pad(n: number) {
    return n < 10 ? '0' + n : n;
  }

  mergeDateTime(date: any, time: any) {
    const year = date.getFullYear();
    const month = this.pad(date.getMonth() + 1);
    const day = this.pad(date.getDate());
    const datePicked = year + '-' + month + '-' + day;
    return new Date(datePicked + 'T' + time);
  }
}

