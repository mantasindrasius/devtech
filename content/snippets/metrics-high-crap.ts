// More policies; assume 0% coverage.
// C = 6; CRAP = 6² × 1³ + 6 = 42.
export function shipping(
  us: boolean, express: boolean,
  member: boolean, subtotalCents: number,
) {
  if (us) {
    if (express) return 1500;
    else {
      if (member) return 0;
      else {
        if (subtotalCents >= 5000) return 0;
        else return 500;
      }
    }
  } else {
    if (express) return 3000;
    else return 1500;
  }
}
