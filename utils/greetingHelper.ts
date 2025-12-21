
import { User } from "../types";

export type ThemeType = 'spring' | 'summer' | 'autumn' | 'winter' | 'christmas' | 'halloween' | 'birthday';

export const getPersonalizedGreeting = (user: User) => {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();
  const hour = now.getHours();

  // 1. Check Birthday
  if (user.birthday) {
    const bday = new Date(user.birthday);
    if (bday.getMonth() === now.getMonth() && bday.getDate() === now.getDate()) {
      return {
        text: `Happy Birthday, ${user.name}! 🎂`,
        subtext: "Today is your special day. Let's make it productive!",
        icon: "party",
        theme: 'birthday' as ThemeType
      };
    }
  }

  // 2. Check Specific Holiday Overrides
  if (month === 12 && day >= 15 && day <= 26) {
    return { text: "Merry Christmas! 🎄", subtext: "Wishing you joy and peace.", icon: "holiday", theme: 'christmas' as ThemeType };
  }
  if (month === 10 && day >= 25 && day <= 31) {
    return { text: "Happy Halloween! 🎃", subtext: "Spooky productivity await!", icon: "holiday", theme: 'halloween' as ThemeType };
  }
  if (month === 1 && day === 1) {
    return { text: "Happy New Year! ✨", subtext: "New year, new accomplishments!", icon: "holiday", theme: 'winter' as ThemeType };
  }

  // 3. Seasonal Logic
  let season: ThemeType = 'winter';
  if (month >= 3 && month <= 5) season = 'spring';
  else if (month >= 6 && month <= 8) season = 'summer';
  else if (month >= 9 && month <= 11) season = 'autumn';

  // 4. Time of Day Greeting
  let timeGreeting = "Good Evening";
  if (hour < 12) timeGreeting = "Good Morning";
  else if (hour < 17) timeGreeting = "Good Afternoon";

  return {
    text: `${timeGreeting}, ${user.name}`,
    subtext: "Time to conquer your missions!",
    icon: hour < 12 ? "sun" : (hour < 18 ? "sunset" : "moon"),
    theme: season
  };
};
