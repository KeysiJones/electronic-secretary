const express = require("express");
require("dotenv").config();
const PORT = process.env.PORT || 3001;
const BASE_URL = process.env.REACT_APP_BASE_URL
const BOT_API_KEY = process.env.BOT_API_KEY
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.get("/", function (req, res) {
  const text = `🏁🚩 Links das Aulas de QUINTA-FEIRA \n
  📲 Site com TODOS OS LINKS das Aulas 💡 👉 https://instituto-helper.netlify.app 👈\n
  📡 Site oficial com RECUPERAÇÕES 👉 https://instituto-porto-alegre.webnode.com 👈\n
  Link da Matrícula 👉 https://forms.gle/D3CYCXJe19PuftgG9 👈\n
  🕓 16h - 🧑‍🏫ALICERCES DA RESTAURAÇÃO👩‍🏫\nhttps://zoom.us/j/95927244033?pwd=TkZLeU1MY2d5eUpqeTJ5WUJTRHlVUT09\nSenha:1\n
  🕖 19h - 🧎‍♂️TÓPICOS ATUAIS DO EVANGELHO 🙋‍♂️🗣️\n🔛 https://zoom.us/j/95927244033?pwd=TkZLeU1MY2d5eUpqeTJ5WUJTRHlVUT09\nSenha: 1\n
  🕗 20h - FOUNDATIONS OF THE RESTAURATION (INGLÊS)  🇬🇧🇺🇸\nhttps://zoom.us/j/93337211696?pwd=dTVreXJLQXFzdVNrTUp0aVpZUzdJUT09\nSenha:1\n
  🕤 21h30 -💼 PRINCÍPIOS DE LIDERANÇA 🏆\nhttps://zoom.us/j/95927244033?pwd=TkZLeU1MY2d5eUpqeTJ5WUJTRHlVUT09\nSenha:1`;

  const dateMap = {
    0: "domingo",
    1: "segunda",
    2: "terca",
    3: "quarta",
    4: "quinta",
    5: "sexta",
    6: "sabado",
  };

  const today = new Date().getDay();

  axios
    .get(BASE_URL)
    .then((response) => {
      const todayMapper = {
        'segunda': 'SEGUNDA',
        'terca': 'TERÇA',
        'quarta': 'QUARTA',
        'quinta': 'QUINTA',
        'sexta': 'SEXTA',
        'sabado': 'SÁBADO',
        'domingo': 'DOMINGO'
      }

      const todayClasses = response.data[dateMap[today]];
      const friendlyToday = todayMapper[dateMap[today]]

      let message = `🏁🚩 Links das Aulas de ${friendlyToday} \n
    📲 Site com TODOS OS LINKS das Aulas 💡 👉 https://instituto-helper.netlify.app 👈\n
    📡 Site oficial com RECUPERAÇÕES 👉 https://instituto-porto-alegre.webnode.com 👈\n
    Link da Matrícula 👉 https://forms.gle/D3CYCXJe19PuftgG9 👈\n`;

      todayClasses.forEach((currentClass) => {
        message += `\n🕓 ${
          currentClass.horario
        } - ${currentClass.nome.toUpperCase()}\n${
          currentClass.link
        }\nSenha:1\n`;
      });

      const params = new URLSearchParams({ chat_id: "-641112367", text: message });

      axios
        .post(
          `https://api.telegram.org/bot${BOT_API_KEY}/sendMessage`,
          params.toString()
        )
        .then((res) => {
          console.log({ res });
        })
        .catch((error) => {
          console.error(error);
        });

      res.status(200).json({ mensagem: "Seja bem vindo meu amigo(a)" });
    });
});

app.listen(PORT, () => console.log("programa iniciou"));
