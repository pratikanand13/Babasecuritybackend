function extractIssues(data) {
    const patterns = [
        /missing-sri/g,
        /xss-deprecated-header/g,
        /http-missing-security-headers:cross-origin-opener-policy/g,
        /http-missing-security-headers:cross-origin-resource-policy/g,
        /http-missing-security-headers:permissions-policy/g,
        /http-missing-security-headers:x-permitted-cross-domain-policies/g,
        /http-missing-security-headers:referrer-policy/g,
        /http-missing-security-headers:clear-site-data/g,
        /http-missing-security-headers:cross-origin-embedder-policy/g,
    ];
    let results = [];
    patterns.forEach(pattern => {
        const match = data.match(pattern);
        if (match) {
            results.push(match[0]);
        } else {
            results.push("");
        }
    });
    return `{${results.join(",")}}`;
}

module.exports = extractIssues