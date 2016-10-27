#!/bin/sh

osascript >/dev/null <<END
tell application "Terminal"
    do script "cd \"`pwd`\";npm run watch"
end tell
END

osascript >/dev/null <<END
tell application "Terminal"
    do script "cd \"`pwd`\";npm run watch-test"
end tell
END

osascript >/dev/null <<END
tell application "Terminal"
    do script "cd \"`pwd`\";npm run test"
end tell
END

exit 0