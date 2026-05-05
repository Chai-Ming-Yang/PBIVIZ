class ConciseReporter {
    onTestResult(test, testResult) {
        // Extract the name of the top-level 'describe' block to use as the heading.
        // If it doesn't exist, fallback to 'Test Suite'.
        const suiteName = testResult.testResults[0]?.ancestorTitles[0] || 'Test Suite';
        
        // Print a line break, a visual divider, and the suite name in Cyan/Bold
        console.log(`\n\x1b[1m\x1b[36m=== ${suiteName} ===\x1b[0m`);

        testResult.testResults.forEach(result => {
            // Added a slight indentation (two spaces) for visual hierarchy
            if (result.status === 'passed') {
                console.log(`  \x1b[32m√\x1b[0m ${result.title}`);
            } else if (result.status === 'failed') {
                console.log(`  \x1b[31m×\x1b[0m ${result.title}`);
            }
            
            // Wipe out the individual verbose error logs
            result.failureMessages = [];
        });
        
        // Wipe out the aggregated file-level error log
        testResult.failureMessage = '';
    }
}
module.exports = ConciseReporter;