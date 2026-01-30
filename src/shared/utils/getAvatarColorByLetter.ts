export function getAvatarColorByLetter(letter: string) {
  const colorClasses = [
    "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-50",
    "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-50",
    "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-50",
    "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-50",
    "bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-50",
    "bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-50",
    "bg-lime-100 dark:bg-lime-950 text-lime-700 dark:text-lime-50",
    "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-50",
    "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-50",
    "bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-50",
    "bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-50",
  ];
  const index = letter.charCodeAt(0) % colorClasses.length;
  return colorClasses[index];
}
