/*global require*/
/*global process*/
/*global console*/

var fs = require("fs"),
    i = 0,
    pages = [], // add pages that have querystrings attached to them to the pages array ( example: 'blog/query-string', 'blog/dynamic-content' )
    xml = "<?xml version='1.0' encoding='UTF-8'?>" + "\r\n" + "<urlset xmlns='http://www.sitemaps.org/schemas/sitemap/0.9'>" + "\r\n",
    site = "change-to-your-sitename.com",
    ext = true,
    readline = require("readline"),
    rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

// asks the name of the site will default to change-to-your-sitename.com if no data given
rl.question("What is your site name? (example: your-site-name.com)", function(answer) {
    "use strict";
    if (answer) {
        site = answer;
    }
    // asks if you would like to include file extensions defaults to yes
    rl.question("Would you like to include file extensions? (example: .html) [y/n]", function(answer2) {
        if (answer2) {
            if (answer2.toLowerCase() !== "y") {
                ext = false;
            }
        }
        // specifies directory
        fs.readdir("./", function (err, list) {
            if (err) throw err;
            // adds found files to pages array
            for (i = 0; i < list.length; i++) {
                if (list[i].indexOf(".html") !== -1 || list[i].indexOf(".php") !== -1) {
                    if (list[i] !== "404.html" && list[i] !== "404.php") {
                        if (list[i] === "index.html" || list[i] === "index.php") {
                            pages.push("");
                        } else {
                            pages.push(list[i]);
                        }
                    }
                }
            }
            // begins formating each file into xml for sitemap
            for (i = 0; i < pages.length; i++) {
                var mtdate = new Date(fs.statSync("./" + pages[i]).mtime),
                    currentDate = mtdate.getFullYear() + "-";
                if (Number(mtdate.getMonth() + 1) < 10) {
                    currentDate += "0";
                }
                currentDate += mtdate.getMonth() + 1 + "-";
                if (Number(mtdate.getDate()) < 10) {
                    currentDate += "0";
                }
                currentDate += mtdate.getDate();
                var page = pages[i];
                if (!ext) {
                    page = page.replace(".html", "");
                    page = page.replace(".php", "");
                }
                xml += "\t" + "<url>" + "\r\n\t\t" + "<loc>http://" + site + "/" + page + "</loc>" + "\r\n";
                xml += "\t\t" + "<lastmod>" + currentDate + "</lastmod>" + "\r\n";
                xml += "\t\t" + "<changefreq>weekly</changefreq>" + "\r\n";
                var priority = parseFloat(0.5);
                if (pages[i] === "") {
                    priority = parseFloat(1.0);
                }
                xml += "\t\t" + "<priority>" + priority.toFixed(1) + "</priority>" + "\r\n\t" + "</url>" + "\r\n";
            }
            xml += "</urlset>";
            // creates sitemap.xml
            fs.writeFile("sitemap.xml", xml, function (err) {
                if (err) throw err;
                console.log("sitemap.xml has been saved!");
            });
            // begins formating for robots.txt
            var robots = "User-agent: *" + "\r\n";
            robots += "Allow: *" + "\r\n";
            robots += "Sitemap: http://" + site + "/sitemap.xml";
            // creates robots.txt
            fs.writeFile("robots.txt", robots, function (err) {
                if (err) throw err;
                console.log("robots.txt has been saved!");
            });
        });
        // closes question prompt
        rl.close();
    });
});