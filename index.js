const express = require("express");
require("dotenv").config();
const PORT = process.env.PORT || 3001;
const BASE_URL = process.env.REACT_APP_BASE_URL;
const BOT_API_KEY = process.env.BOT_API_KEY;
const axios = require("axios");
const DATE_MAP = require("./utils/constants");
const app = express();
app.use(express.json());
app.use(express.static("public"));

app.get("/", function(req, res){
  return res.status(200).json({message: "I am waking up !!"})
});

app.get("/send-classes-link", async function (req, res, next) {
  try {
    const date = new Date();
    const today = date.getDay();
    const weekDay = DATE_MAP[today];

    if (weekDay === "domingo" || "segunda") {
      const msg = `Hoje não temos aulas no Instituto, mas eu gostaria de desejar a você uma excelente semana ! 🚀🚀🚀🚀`;
      const sentMessage = await sendTelegramMessage(msg);

      return res
        .status(200)
        .json({ message: `Sent message was: ${sentMessage.text}` });
    }

    let response = "Error sending Telegram message";

    const classList = await axios.get(BASE_URL);
    const message = createMessage(classList, weekDay);

    if (message) {
      const returnedMessage = await sendTelegramMessage(message);
      if (returnedMessage) response = "Telegram message sent succesfully";
    }

    return res.status(200).json({ message: response });
  } catch (error) {
    next(error);
  }
});

const sendTelegramMessage = async (message) => {
  const params = new URLSearchParams({
    chat_id: "-641112367",
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
