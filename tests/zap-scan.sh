# Sortora OWASP ZAP Scan Configuration
# Install: brew install zaproxy
# Quick scan: zap-cli quick-scan https://sortora.com
# Full scan: zap-cli active-scan https://sortora.com

# Automated scan script
# Run: bash tests/zap-scan.sh

#!/bin/bash
set -e

TARGET="https://sortora.com"
REPORT_DIR="./tests/reports"
mkdir -p $REPORT_DIR

echo "=== Sortora Security Scan ==="
echo "Target: $TARGET"
echo ""

# 1. Spider the site (discover pages)
echo "[1/4] Spidering site..."
zap-cli spider "$TARGET"
zap-cli spider "$TARGET/pricing.html"
zap-cli spider "$TARGET/signup.html"
zap-cli spider "$TARGET/dashboard.html"

# 2. AJAX spider (for JS-rendered content)
echo "[2/4] AJAX spidering..."
zap-cli ajax-spider "$TARGET"

# 3. Active scan (test for vulnerabilities)
echo "[3/4] Active scanning..."
zap-cli active-scan "$TARGET"

# 4. Generate report
echo "[4/4] Generating report..."
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
zap-cli report -o "$REPORT_DIR/zap-report-$TIMESTAMP.html" -f html

echo ""
echo "=== Scan Complete ==="
echo "Report: $REPORT_DIR/zap-report-$TIMESTAMP.html"
echo ""

# Check for high-severity alerts
HIGH=$(zap-cli alerts -l High | wc -l)
MEDIUM=$(zap-cli alerts -l Medium | wc -l)
echo "High severity: $HIGH"
echo "Medium severity: $MEDIUM"

if [ "$HIGH" -gt 0 ]; then
  echo "WARNING: High severity vulnerabilities found!"
  zap-cli alerts -l High
  exit 1
fi

echo "No high-severity issues found."
