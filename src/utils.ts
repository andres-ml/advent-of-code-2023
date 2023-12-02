export const matchAllGroups = (regex: string, string: string) => [...string.matchAll(new RegExp(regex, 'g'))]

export const matchAll = (regex: string, string: string) => matchAllGroups(regex, string).map(match => match[0])
