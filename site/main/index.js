function FrontendSlider() {
    const slides = [
        {id:1, image: "../images/slide_1.png",  title:"FraBo Jewelry", link:"../frontend/frabo/index.html",
            desc: [<i>Курсовой проект.</i>, 
                "\n\nДля написания страницы использованы препроцессор SCSS, модуль flex, медиа-запрос @media и css-правила @font-face, @keyframes, JS-библиотека JQuery: \n• SCSS: удобнее классического CSS;\n• Flex, @media: Адаптивный дизайн, мобильная версия;\n• @font-face: подключение шрифтов (Montserrat, Playfair_Display);\n• @keyframes: создание анимации пульсирующего текста\n• JQuery: реализация бургер-меню в мобильной версии."], },
        {id:2, image: "../images/slide_2.png", title:"Breyta", link:"../frontend/breyta/index.html", 
            desc: [<i>Лендинг.</i>,
                "\n\nДля написания страницы использованы препроцессор SCSS, переменные, модули flex, grid, медиа-запрос @media и css-правила @font-face, @keyframes: \n• Переменные: для динамичного дизайна;\n• Flex, grid @keyframes: анимация\n• @font-face: подключение шрифтов (Tartuffo, Inter)"],},
        {id:3, image: "../images/slide_1.png", title:"Example 3", desc: "Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text "},
    ];
    const [index, setIndex] = React.useState(0);
    const next = () => {
        document.querySelector('.active-link').style.opacity = '0';
        document.querySelector('.description').style.opacity = '0';
        document.querySelector('.previous').style.transform = 'translatex(-100%)';
        document.querySelector('.next').style.transform = 'translatex(0%)';
        document.querySelector('.previous').style.opacity = '0';
        document.querySelector('.next').style.opacity = '0';
        setTimeout(() => {
            document.querySelector('.previous').style.transform = 'translatex(-55%)';
            document.querySelector('.next').style.transform = 'translatex(55%)';
        }, 300)
        setTimeout(() => {
            setIndex((i) => (i+1) % slides.length);
            document.querySelector('.active-link').style.opacity = '1';
            document.querySelector('.description').style.opacity = '1';
            document.querySelector('.previous').style.opacity = '60%';
            document.querySelector('.next').style.opacity = '60%';
        }, 600);
    };
    const prev = () => {
        document.querySelector('.active-link').style.opacity = '0';
        document.querySelector('.description').style.opacity = '0';
        document.querySelector('.previous').style.transform = 'translatex(0%)';
        document.querySelector('.next').style.transform = 'translatex(100%)';
        document.querySelector('.previous').style.opacity = '0';
        document.querySelector('.next').style.opacity = '0';
        setTimeout(() => {
            document.querySelector('.previous').style.transform = 'translatex(-55%)';
            document.querySelector('.next').style.transform = 'translatex(55%)';
        }, 300)
        setTimeout(() => {
            setIndex((i) => (i-1 + slides.length) % slides.length);
            document.querySelector('.active-link').style.opacity = '1';
            document.querySelector('.description').style.opacity = '1';
            document.querySelector('.previous').style.opacity = '60%';
            document.querySelector('.next').style.opacity = '60%';
        }, 600);
    }; 
    const prevIndex = (index - 1 + slides.length) % slides.length;
    const nextIndex = (index + 1) % slides.length;
    return(
        <div className ="slider">
            <div className = "slide">
                <div className="slide-show">
                    <span>
                        <img src= {slides[prevIndex].image} className = "slide-img previous" />
                        <span className="previous" onClick = {prev}><img src="../images/left arrow.svg"/></span>
                    </span>
                    <span className="active-link"> 
                        <a href={slides[index].link}>
                            <img src= {slides[index].image} className = "slide-img" />
                        </a>
                    </span>
                    <span id="rightSlide">
                        <img src= {slides[nextIndex].image} className = "slide-img next" />
                        <span className="next" onClick = {next}><img src="../images/right arrow.svg"/></span>
                    </span>
                </div>
                <div className="indicators">
                    <span /* set class name for the active slide*/ ></span>   <span></span>   <span></span>
                </div>
                <div className="description target" id="">
                    <h2>{slides[index].title}</h2>
                    <p>{slides[index].desc}</p>
                </div>
            </div>
        </div>
    );
}

function DesignSlider (){
    const slides = [
        {id:1, image: "../images/slide_1.png",  title:"FraBo Jewelry", link:"../frontend/frabo/index.html",
            desc: [<i>Курсовой проект.</i>, 
                "\n\n"]},
        {id:2, image: "../images/slide_1.png", title:"Example 2", desc: "Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text "},
        {id:3, image: "../images/slide_1.png", title:"Example 3", desc: "Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text Text "},
    ];
    const [index, setIndex] = React.useState(0);
    const next = () => {
        document.querySelector('.active-link').style.opacity = '0';
        document.querySelector('.description').style.opacity = '0';
        document.querySelector('.previous').style.transform = 'translatex(-100%)';
        document.querySelector('.next').style.transform = 'translatex(0%)';
        document.querySelector('.previous').style.opacity = '0';
        document.querySelector('.next').style.opacity = '0';
        setTimeout(() => {
            document.querySelector('.previous').style.transform = 'translatex(-55%)';
            document.querySelector('.next').style.transform = 'translatex(55%)';
        }, 300)
        setTimeout(() => {
            setIndex((i) => (i+1) % slides.length);
            document.querySelector('.active-link').style.opacity = '1';
            document.querySelector('.description').style.opacity = '1';
            document.querySelector('.previous').style.opacity = '60%';
            document.querySelector('.next').style.opacity = '60%';
        }, 600);
    };
    const prev = () => {
        document.querySelector('.active-link').style.opacity = '0';
        document.querySelector('.description').style.opacity = '0';
        document.querySelector('.previous').style.transform = 'translatex(0%)';
        document.querySelector('.next').style.transform = 'translatex(100%)';
        document.querySelector('.previous').style.opacity = '0';
        document.querySelector('.next').style.opacity = '0';
        setTimeout(() => {
            document.querySelector('.previous').style.transform = 'translatex(-55%)';
            document.querySelector('.next').style.transform = 'translatex(55%)';
        }, 300)
        setTimeout(() => {
            setIndex((i) => (i-1 + slides.length) % slides.length);
            document.querySelector('.active-link').style.opacity = '1';
            document.querySelector('.description').style.opacity = '1';
            document.querySelector('.previous').style.opacity = '60%';
            document.querySelector('.next').style.opacity = '60%';
        }, 600);
    }; 
    const prevIndex = (index - 1 + slides.length) % slides.length;
    const nextIndex = (index + 1) % slides.length;
    return(
        <div className ="slider">
            <div className = "slide">
                <div className="slide-show">
                    <span>
                        <img src= {slides[prevIndex].image} className = "slide-img previous" />
                        <span className="previous" onClick = {prev}><img src="../images/left arrow.svg"/></span>
                    </span>
                    <span className="active-link"> 
                        <a href={slides[index].link}>
                            <img src= {slides[index].image} className = "slide-img" />
                        </a>
                    </span>
                    <span id="rightSlide">
                        <img src= {slides[nextIndex].image} className = "slide-img next" />
                        <span className="next" onClick = {next}><img src="../images/right arrow.svg"/></span>
                    </span>
                </div>
                <div className="indicators">
                    <span /* set class name for the active slide*/ ></span>   <span></span>   <span></span>
                </div>
                <div className="lower-block">
                    <div className="switch-box">
                        <div className="site active">
                            <div></div>
                            <h3 id="switchToSite">Сайты</h3>
                        </div>
                        <div className="presentation">
                            <div></div>
                            <h3 id="switchToPres" onClick={changeTopic}>Презентации</h3>
                        </div>
                    </div>
                    <div className="description target" id="">
                        <h2>{slides[index].title}</h2>
                        <p>{slides[index].desc}</p>
                    </div>
                </div>
            </div>
        </div>
    );

}

function Presentations (){
    const slides = [
        {id:1, pres: "../design/Брендбук_FraBo.pdf", image: "../images/frabo_design.png", title:"FraBo Jewelry", link:"../frontend/frabo/index.html",
            desc: [<i>Хакатон МТБанк.</i>, "\n\n", <i>БПК; банковское приложение.</i>,
            "\n\n", <i>Проект:</i>, "концепция зарплатной карты; редизайн мобильного приложения для банка\n",
            <i>Клиент:</i>, "молодёжь 18 — 26 лет\n",
            <i>Формат</i>, "командная работа\n",
            <i>Моя роль:</i>, "UX/UI-дизайнер (исследования, интерфейс Fin-трекера, пизуальная часть карты, презентация); экономист (конкурентный анализ, расчёт доходности проекта)\n",
            <i>Цели:</i>, "разработать концепцию и дизайн зарплатной карты, разработать UX структуру и прототип модернизированного приложения банка, соответствующего требованию.\n",
            <i>Срок:</i>, "2 дня\n\n",
        
            "Молодая аудитория часто не ведёт бюджет системно и теряет интерес к стандартным банковским приложениям, не стараясь сильно разбираться в интерфейсе. Зумерам нужно получать всё прямо здесь и прямо сейчас, особенно если это касается денежных вопросов. Мы решили объединить фин. контроль с небольшой долей игрового подхода, чтобы сформировать позитивные привычки: жить без ожиданий, копить на мечту, радоваться мелочам.\n\n",
            
            <i>UX</i>, "\n\nОбновление дизайна сайта в данном случае подразумевает новую вкладку в рамках существующей структуры интерфейса.\n",
            "Исследования (конкурентный анализ) и расчёты потенциального дохода показали, что оптимальным вариантом будет добавить новую вкладку «Fin-трекер» в приложении банка. Ссылка открывает окно, где можно выбрать 1 из 3 секций: анализ (стоит по умолчанию), накопления или миссии.\n",
            "• Во вкладке «Анализ» реализованы столбчатая и круговая диаграммы с данными за месяц, неделю, и категоризацией трат.  Каждой категории за определённый период соответствует собственный цвет. Подобное решение облегчает визуальное восприятие информации, отслеживание и распределение собственных трат.\n",
            "• Вкладка «Накопления» позволяет отправить деньги в «копилку». На интерфейсе отображаются нынешний остаток на счёте, остаток на счёте после вычета накоплений и остаток на счёте накоплений. Также существует возможность вести учёт собственных поставленных финансовых целей. Принятые решения позволяют чётче отслеживать собственные цели, видеть и действительно сохранять отложенную сумму. Исчезает необходимость «держать цифры в голове» или оформлять безвозвратные вклады: деньги в любой момент можно проверить и вернуть. Также повышает доходность с реализации пакетов через ставку размещения.\n",
            "• Во вкладке «Миссии» появляются ежемесячные задания, составленные совместно с партнёрскими сетями. В качестве призов доступны манички (бонусная валюта банка) и значки. Реализована система уровней. Каждому уровню соответствует свой уникальный дизайн «виртуального дерева». При достижении последнего уровня открывается доступ к дизайнам карт пакета «Роскошный максимум». Геймификация делает финансовые задачи более интересным, может формировать полезные финансовые привычки (например, задача «Сохрани n BYN за месяц» / «Оплати коммуналку до n-го числа»), увеличивать лояльность и удержание клиентов\n\n"
        ]},
        {id:2, pres: "../design/Хакатон_МТБанк.pdf", image: "../images/mtbank_design.png", title:"«Моя первая зарплатная карта»", 
            desc: [<i>Хакатон МТБанк</i>,
                "\n\n"]},
        
    ];
    const [index, setIndex] = React.useState(0);
    const next = () => {
        document.querySelector('.active-link').style.opacity = '0';
        document.querySelector('.description').style.opacity = '0';
        document.querySelector('.previous').style.transform = 'translatex(-100%)';
        document.querySelector('.next').style.transform = 'translatex(0%)';
        document.querySelector('.previous').style.opacity = '0';
        document.querySelector('.next').style.opacity = '0';
        setTimeout(() => {
            document.querySelector('.previous').style.transform = 'translatex(-55%)';
            document.querySelector('.next').style.transform = 'translatex(55%)';
        }, 300)
        setTimeout(() => {
            setIndex((i) => (i+1) % slides.length);
            document.querySelector('.active-link').style.opacity = '1';
            document.querySelector('.description').style.opacity = '1';
            document.querySelector('.previous').style.opacity = '60%';
            document.querySelector('.next').style.opacity = '60%';
        }, 600);
    };
    const prev = () => {
        document.querySelector('.active-link').style.opacity = '0';
        document.querySelector('.description').style.opacity = '0';
        document.querySelector('.previous').style.transform = 'translatex(0%)';
        document.querySelector('.next').style.transform = 'translatex(100%)';
        document.querySelector('.previous').style.opacity = '0';
        document.querySelector('.next').style.opacity = '0';
        setTimeout(() => {
            document.querySelector('.previous').style.transform = 'translatex(-55%)';
            document.querySelector('.next').style.transform = 'translatex(55%)';
        }, 300)
        setTimeout(() => {
            setIndex((i) => (i-1 + slides.length) % slides.length);
            document.querySelector('.active-link').style.opacity = '1';
            document.querySelector('.description').style.opacity = '1';
            document.querySelector('.previous').style.opacity = '60%';
            document.querySelector('.next').style.opacity = '60%';
        }, 600);
    }; 
    const prevIndex = (index - 1 + slides.length) % slides.length;
    const nextIndex = (index + 1) % slides.length;
    return(
        <div className ="slider">
            <div className = "slide">
                <div className="slide-show">
                    <span>
                        <img src= {slides[prevIndex].image} className = "slide-img previous" />
                        <span className="previous" onClick = {prev}><img src="../images/left arrow.svg"/></span>
                    </span>
                    <span className="active-link"> 
                        <embed src= {slides[index].pres} type="application/pdf" />
                    </span>
                    <span id="rightSlide">
                        <img src= {slides[nextIndex].image} className = "slide-img next" />
                        <span className="next" onClick = {next}><img src="../images/right arrow.svg"/></span>
                    </span>
                </div>
                <div className="indicators">
                    <span /* set class name for the active slide*/ ></span>   <span></span>   <span></span>
                </div>
                <div className="lower-block">
                    <div className="switch-box">
                        <div className="site" id="site">
                            <div></div>
                            <h3 id="switchToSite" onClick={changeTopic}>Сайты</h3>
                        </div>
                        <div className="presentation active">
                            <div></div>
                            <h3 id="switchToPres">Презентации</h3>
                        </div>
                    </div>
                    <div className="description target" id="">
                        <h2>{slides[index].title}</h2>
                        <p>{slides[index].desc}</p>
                    </div>
                </div>
            </div>
        </div>
    );

}

function MainContent(){
    const [topic, setTopic] = React.useState("Frontend");

    React.useEffect(() => {
        const handler = (e) => setTopic(e.detail);
        window.addEventListener("topicChanged", handler);
        return () => window.removeEventListener("topicChanged", handler);
    }, []);

    const content = {
        Frontend: <FrontendSlider />,
        Design: <DesignSlider />,
        Сайты: <DesignSlider />,
        Презентации: <Presentations />,
        Economics: (<p>Economics.</p>),
    };

    return <>{content[topic]}</>
}

ReactDOM.createRoot(document.getElementById('main-content')).render(<MainContent />);
            