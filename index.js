const playwright = require('playwright');

// Require the necessary discord.js classes
const { Client, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// When the client is ready, run this code (only once)
client.once('ready', () => {
    console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    switch (commandName) {
        case "ping":
            await interaction.reply('Pong!');
            break;
        case "server":
            await interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);
            break;
        case "user":
            await interaction.reply(`Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`);
            break;
        case "blindtest":
            await interaction.reply(`wallah attends ca arrive`);
            await interaction.followUp(await scrapeLyrics());
            break;
        default:
            console.log("????")
    }
});

// Login to Discord with your client's token
client.login(token);

// await msg = scrapeLyrics()
// console.log(msg)

const scrapeLyrics = async () => {
    const browser = await playwright.firefox.launch();
    const page = await browser.newPage();
    await page.goto('https://kworb.net/spotify/country/fr_daily.html');

    var rows = page.locator('tbody td[class="text mp"]');
    var titleArtist = await rows.allTextContents();
    const maxTitle = Object.keys(titleArtist).length
    function randomIntFromInterval(min, max) { // min and max included 
        return Math.floor(Math.random() * (max - min + 1) + min)
    }
    const rndInt = randomIntFromInterval(0, maxTitle)
    // Random title + artist between the max number of title in the array
    // Removing all accents
    titleArtist = titleArtist[rndInt].normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    // remove double space dash from middle
    titleArtist = titleArtist.replace(/\s-\s/g, '-').toLowerCase();
    // replace all space per dash for genius direct lyrics search
    titleArtist = titleArtist.replace(/\s+/g, '-').toLowerCase();

    const geniusURL = "https://www.genius.com/" + titleArtist + "-lyrics";
    console.debug("ID=" + rndInt + " URL=" + geniusURL + '\n')

    const page2 = await browser.newPage();
    await page2.goto(geniusURL);


    rows = page2.locator('div[data-lyrics-container="true"]')

    const lyrics = await rows.allTextContents();
    await browser.close();
    console.debug(lyrics[0])
    if (lyrics[0] != "") {
        var refrain = lyrics[0].split(/(?<=\[Refrain.*?\])(.*)(?=\[)/)
        // PAS DE GESTION D'ESPACE ATM CAR RECUPERATION DEGUEU DU TEXT (On a pas les backspace imo faut jouer sur l'innertext)
        // console.debug("\n  *******************REFRAIN**************** = " + refrain[1])
    }
    return refrain[1];

    // console.log(geniusURL)
    // END
}
