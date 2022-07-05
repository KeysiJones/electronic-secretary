const express = require("express");
require("dotenv").config();
const PORT = process.env.PORT || 3001;
const BASE_URL = process.env.REACT_APP_BASE_URL;
const BOT_API_KEY = process.env.BOT_API_KEY;
const axios = require("axios");
const DATE_MAP = require("./utils/constants");
const app = express();
const cron = require("node-cron");
const bomURL = "https://book-of-mormon-api.vercel.app/random";
app.use(express.json());
app.use(express.static("public"));

app.get("/", function (req, res) {
  return res.status(200).json({ message: "I am waking up !!" });
});

cron.schedule(
  "0 8 * * *",
  async () => {
    console.log("Sending telegram message at 8am every day");

    try {
      const date = new Date();
      const today = date.getDay();
      const weekDay = DATE_MAP[today];

      if (weekDay === "domingo" || "segunda") {
        const msg = `Hoje não temos aulas no Instituto, mas eu gostaria de desejar a você uma excelente semana ! 🚀🚀🚀🚀`;
        const sentMessage = await sendTelegramMessage({message: msg, chatId: "2031174613"});

        console.log(`Sent message was: ${sentMessage.text}`);
      }

      const classList = await axios.get(BASE_URL);
      const message = createMessage(classList, weekDay);

      if (message) {
        await sendTelegramMessage(message);
      }
    } catch (error) {
      throw new Error("Error while sending telegram message");
    }
  },
  { timezone: "America/Sao_Paulo" }
);

cron.schedule(
  "30 22 * * *",
  async () => {
    const { data } = await axios.get(bomURL);

    if (data) {
      const preparedMessage = `VERSE OF THE DAY: \n\n${data.text}\n\n- ${data.reference}`;
      const sentMessage = await sendTelegramMessage({
        message: preparedMessage,
      });

      console.log(`Sent message: ${sentMessage}`);
    }
  },
  { timezone: "America/Sao_Paulo" }
);

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

app.listen(PORT, () => console.log("Program has started"));
