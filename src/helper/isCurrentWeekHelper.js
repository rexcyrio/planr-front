import { getMondayKey } from "../store/slices/timeSlice";

export default function isCurrentWeek(mondayKey) {
  const currentMondayKey = getMondayKey(new Date());

  for (let i = 0; i < 3; i++) {
    if (mondayKey[i] !== currentMondayKey[i]) {
      return false;
    }
  }
  
  return true;
}
