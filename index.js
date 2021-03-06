const express = require("express");
const cron = require("node-cron");
const axios = require("axios");
const DATE_MAP = require("./utils/constants");
const moment = require('moment-timezone');
require("dotenv").config();
const PORT = process.env.PORT || 3001;
const BASE_URL = process.env.REACT_APP_BASE_URL;
const BOT_API_KEY = process.env.BOT_API_KEY;
const app = express();
const bomURL = "https://book-of-mormon-api.vercel.app/random";

app.use(express.json());
app.use(express.static("public"));

app.get("/", function (req, res) {
  const weekDay = DATE_MAP[moment.tz('America/Sao_Paulo').toDate().getDay()];
  
  return res
    .status(200)
    .json({ message: `I am waking up !! I feel it in my bones !! \n\nDia da semana: ${weekDay}` });
});

try {
  cron.schedule(
    "30 8 * * *",
    async () => {
      console.log("Sending classes reminder message at 8:30am every day");
  
      try {
        sendClassesLinkMessage();
      } catch (error) {
        throw new Error("Error while sending telegram message");
      }
    },
    { timezone: "America/Sao_Paulo" }
  );
  
  cron.schedule(
    "0 9 * * *",
    async () => {
      console.log("Sending random b.o.m verse at 9am every day");
      try {
        sendRandomBOMVerse();
      } catch (error) {
        throw new Error(error);
      }
    },
    { timezone: "America/Sao_Paulo" }
  );
} catch (error) {
  throw error;
}

const sendTelegramMessage = async ({ message, chatId = "-641112367" }) => {
  const params = new URLSearchParams({
    chat_id: chatId,
    text: message,
  });

  const sentMessage = await axios.post(
    `https://api.telegram.org/bot${BOT_API_KEY}/sendMessage`,
    params.toString()
  );

  if (!sentMessage) {
    throw new Error("An error occurred while trying to send telegram message");
  }

  return sentMessage.data.result;
};

const createMessage = (classList, weekDay) => {
  const todayClasses = classList.data[weekDay];

  if (todayClasses) {
    const todayMapper = {
      segunda: "SEGUNDA",
      terca: "TERÇA",
      quarta: "QUARTA",
      quinta: "QUINTA",
      sexta: "SEXTA",
      sabado: "SÁBADO",
      domingo: "DOMINGO",
    };

    const friendlyToday = todayMapper[weekDay];

    let message = `🏁🚩 Links das Aulas de ${friendlyToday} \n
        📲 Site com TODOS OS LINKS das Aulas 💡 👉 https://instituto-helper.netlify.app 👈\n
        📡 Site oficial com RECUPERAÇÕES 👉 https://instituto-porto-alegre.webnode.com 👈\n
        Link da Matrícula 👉 https://forms.gle/D3CYCXJe19PuftgG9 👈\n`;

    todayClasses.forEach((currentClass) => {
      message += `\n🕓 ${
        currentClass.horario
      } - ${currentClass.nome.toUpperCase()}\n${currentClass.link}\nSenha:1\n`;
    });

    return message;
  }
};

app.post("/get-updates", async function (req, res) {
  try {
    const receivedMessage = req.body.message;
  
    if (receivedMessage) {
      const { first_name, id } = receivedMessage.chat;
    
      switch(receivedMessage.text) {
        case "/getlinks":
          await sendClassesLinkMessage({ chatId: id })
          break;
        case "/randomverse":
          await sendRandomBOMVerse({ chatId: id })
          break;
        case "/randomphrase": 
          await sendRandomPhrase()
          break;
        default:
          await sendTelegramMessage({message: `${first_name ? `${first_name}, ` : ""}por favor, use uma das opções disponíveis no menu.`, chatId: id})
      }    
    }
  } catch (error) {
    throw error;
  }

  return res.status(200).json({ message: "Trying to receive messages here !" });
});

const sendClassesLinkMessage = async (params = { chatId: "2031174613" }) => {
  const { chatId } = params; 
  const date = moment.tz('America/Sao_Paulo').toDate()
  const today = date.getDay();
  const weekDay = DATE_MAP[today];

  if (["domingo", "segunda"].includes(weekDay)) {
    const msg = `Hoje não temos aulas no Instituto, mas eu gostaria de desejar a você uma excelente semana ! 🚀🚀🚀🚀`;
    const sentMessage = await sendTelegramMessage({
      message: msg,
      chatId,
    });

    console.log(`Sent message was: ${sentMessage.text}`);
    return sentMessage;
  }

  const classList = await axios.get(BASE_URL);
  const message = createMessage(classList, weekDay);

  if (message) {
    const sentMessage = await sendTelegramMessage({
      message,
      chatId,
    });
    return sentMessage;
  } else {
    const sentMessage = await sendTelegramMessage({
      message: `Por alguma razão a mensagem das aulas do dia não foi enviada. \n\nDia da semana captado: ${weekDay}`,
      chatId: "2031174613",
    });

    return sentMessage
  }
};

const sendRandomBOMVerse = async (params = { chatId: "-641112367"}) => {
  const { chatId } = params;
  const { data } = await axios.get(bomURL);

  if (data) {
    const preparedMessage = `VERSE OF THE DAY: \n\n${data.text}\n\n- ${data.reference}`;
    const sentMessage = await sendTelegramMessage({
      message: preparedMessage,
      chatId
    });

    console.log(`Sent message: ${sentMessage.text}`);

    return sentMessage;
  }

  throw new Error("Error while sending random BOM verse");
}

const sendRandomPhrase = async (params = {chatId: "2031174613"}) => {
  const { chatId } = params;
  const { data } = await axios.get("https://positive-vibes-api.herokuapp.com/quotes/random");

  if (data) {
    const message = data.data;
    const sentMessage = await sendTelegramMessage({
      message,
      chatId
    })

    console.log(`Sent message: ${sentMessage.text}`);

    return sentMessage.text;
  }

  throw new Error("Error while sending random phrase");
}

app.listen(PORT, () => console.log("Program has started"));
