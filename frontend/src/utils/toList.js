// Backend list kabhi seedha array deta hai, kabhi { content: [...] }. Dono handle karta hai.
export const toList = (res) => {
    const d = res.data.data;
    return Array.isArray(d) ? d : d?.content ?? [];
};