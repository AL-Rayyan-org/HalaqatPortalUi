export default function getInitials(name: string, charCount: number = 1): string {
    if (charCount > 1) {
        const names = name.split(" ");
        if (names.length === 1) {
        return names[0].charAt(0).toUpperCase();
        }
        return names.map(name => name.charAt(0).toUpperCase()).join("");
    }
    else
        return name.charAt(0).toUpperCase();
}
