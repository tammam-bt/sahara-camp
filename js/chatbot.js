'use strict';

/* =========================================
   Sahara Camp — FAQ Chatbot
   Lightweight, non-AI, multilingual FAQ widget.
   UX: Quick-reply home → accordion questions.
   ========================================= */

const CHATBOT_FAQS = {
  en: {
    title: 'Sahara Camp',
    subtitle: 'Ask us anything',
    welcome: 'Hi! 👋 Welcome to Sahara Camp. How can we help you?',
    quickReplies: {
      book: '🏕️ Book a stay',
      contact: '📞 Contact us',
      questions: '❓ I have a question',
    },
    accordionTitle: 'Frequently Asked Questions',
    backLabel: '← Back',
    whatsappLabel: 'Chat on WhatsApp',
    whatsappText: 'Hi Sahara Camp, I have a question about...',
    faqs: [
      {
        q: 'Where is the camp located?',
        a: 'Sahara Camp is set in the Tembaine dunes, about 30 km northeast of Douz in southern Tunisia. We can arrange transfers from Douz or Tozeur on request.'
      },
      {
        q: 'What tent options do you offer?',
        a: 'We have two options: a Traditional Berber Tent (up to 2 guests, from €45/night) and a Luxury Glamping Tent (up to 4 guests, from €90/night). Both include comfortable beds, breakfast, and a private desert view.'
      },
      {
        q: 'What activities are available?',
        a: 'Camel trekking, 4×4 desert excursions, sandboarding, stargazing, sunrise hikes, and traditional Berber dinners under the stars.'
      },
      {
        q: 'How do I book?',
        a: 'Use the booking form on this page, or click the WhatsApp button to send us your dates and questions. We will confirm availability and your booking directly in WhatsApp.'
      },
      {
        q: 'What is included in the stay?',
        a: 'Your stay includes breakfast, comfortable bedding, electricity, and access to camp amenities. Transfers, activities, and dinner can be arranged as extras.'
      },
      {
        q: 'When is the best time to visit?',
        a: 'The best time is from October to April, when temperatures are pleasant for desert exploration. Summer visits are possible but very hot during the day.'
      },
      {
        q: 'Do you accept card payment?',
        a: 'We primarily accept cash on arrival or payment via mobile transfer. Details are confirmed during your WhatsApp booking.'
      }
    ]
  },
  fr: {
    title: 'Sahara Camp',
    subtitle: 'Posez-nous vos questions',
    welcome: 'Bonjour ! 👋 Bienvenue à Sahara Camp. Comment pouvons-nous vous aider ?',
    quickReplies: {
      book: '🏕️ Réserver',
      contact: '📞 Nous contacter',
      questions: '❓ J\'ai une question',
    },
    accordionTitle: 'Questions fréquentes',
    backLabel: '← Retour',
    whatsappLabel: 'Discuter sur WhatsApp',
    whatsappText: 'Bonjour Sahara Camp, j\'ai une question concernant...',
    faqs: [
      {
        q: 'Où se trouve le camp ?',
        a: 'Sahara Camp se situe dans les dunes de Tembaine, à environ 30 km au nord-est de Douz, dans le sud de la Tunisie. Des transferts depuis Douz ou Tozeur peuvent être organisés sur demande.'
      },
      {
        q: 'Quelles sont les options d\'hébergement ?',
        a: 'Nous proposons deux options : une tente berbère traditionnelle (jusqu\'à 2 personnes, à partir de 45 €/nuit) et une tente de glamping de luxe (jusqu\'à 4 personnes, à partir de 90 €/nuit). Les deux incluent des lits confortables, le petit-déjeuner et une vue privée sur le désert.'
      },
      {
        q: 'Quelles activités proposez-vous ?',
        a: 'Trek à dos de chameau, excursions en 4×4, sandboard, observation des étoiles, randonnée au lever du soleil et dîner berbère traditionnel sous les étoiles.'
      },
      {
        q: 'Comment réserver ?',
        a: 'Utilisez le formulaire de réservation sur cette page, ou cliquez sur le bouton WhatsApp pour nous envoyer vos dates et questions. Nous confirmerons les disponibilités et votre réservation directement sur WhatsApp.'
      },
      {
        q: 'Qu\'est-ce qui est inclus dans le séjour ?',
        a: 'Votre séjour inclut le petit-déjeuner, une literie confortable, l\'électricité et l\'accès aux équipements du camp. Les transferts, activités et dîners peuvent être organisés en supplément.'
      },
      {
        q: 'Quelle est la meilleure période pour visiter ?',
        a: 'La meilleure période s\'étend d\'octobre à avril, lorsque les températures sont agréables pour explorer le désert. L\'été est possible, mais très chaud en journée.'
      },
      {
        q: 'Acceptez-vous le paiement par carte ?',
        a: 'Nous acceptons principalement le paiement en espèces à l\'arrivée ou par transfert mobile. Les détails sont confirmés lors de votre réservation WhatsApp.'
      }
    ]
  },
  de: {
    title: 'Sahara Camp',
    subtitle: 'Fragen Sie uns',
    welcome: 'Hallo! 👋 Willkommen im Sahara Camp. Wie können wir Ihnen helfen?',
    quickReplies: {
      book: '🏕️ Buchen',
      contact: '📞 Kontakt',
      questions: '❓ Ich habe eine Frage',
    },
    accordionTitle: 'Häufig gestellte Fragen',
    backLabel: '← Zurück',
    whatsappLabel: 'Auf WhatsApp chatten',
    whatsappText: 'Hallo Sahara Camp, ich habe eine Frage zu...',
    faqs: [
      {
        q: 'Wo befindet sich das Camp?',
        a: 'Das Sahara Camp liegt in den Dünen von Tembaine, etwa 30 km nordöstlich von Douz im Süden Tunesiens. Auf Anfrage organisieren wir Transfers von Douz oder Tozeur.'
      },
      {
        q: 'Welche Unterkünfte bieten Sie an?',
        a: 'Wir bieten zwei Optionen: ein traditionelles Berberzelt (bis zu 2 Gäste, ab 45 €/Nacht) und ein Luxus-Glamping-Zelt (bis zu 4 Gäste, ab 90 €/Nacht). Beide bieten bequeme Betten, Frühstück und einen privaten Blick auf die Wüste.'
      },
      {
        q: 'Welche Aktivitäten sind verfügbar?',
        a: 'Kamel-Trekking, 4×4-Wüstenexkursionen, Sandboarding, Sternegucken, Sonnenaufgangswanderungen und traditionelles Berber-Dinner unter den Sternen.'
      },
      {
        q: 'Wie buche ich?',
        a: 'Nutzen Sie das Buchungsformular auf dieser Seite oder klicken Sie auf den WhatsApp-Button, um uns Ihre Daten und Fragen zu senden. Wir bestätigen Verfügbarkeit und Buchung direkt über WhatsApp.'
      },
      {
        q: 'Was ist im Aufenthalt enthalten?',
        a: 'Ihr Aufenthalt umfasst Frühstück, bequeme Bettwäsche, Strom und Zugang zu den Camp-Einrichtungen. Transfers, Aktivitäten und Dinner können als Extra organisiert werden.'
      },
      {
        q: 'Wann ist die beste Reisezeit?',
        a: 'Die beste Zeit ist von Oktober bis April, wenn die Temperaturen für Wüstenausflüge angenehm sind. Ein Sommerbesuch ist möglich, aber tagsüber sehr heiß.'
      },
      {
        q: 'Akzeptieren Sie Kartenzahlung?',
        a: 'Wir akzeptieren hauptsächlich Bargeld bei Anreise oder Zahlung per Mobiltransfer. Details werden während Ihrer WhatsApp-Buchung bestätigt.'
      }
    ]
  },
  ru: {
    title: 'Sahara Camp',
    subtitle: 'Задайте вопрос',
    welcome: 'Здравствуйте! 👋 Добро пожаловать в Sahara Camp. Чем мы можем помочь?',
    quickReplies: {
      book: '🏕️ Забронировать',
      contact: '📞 Связаться с нами',
      questions: '❓ У меня есть вопрос',
    },
    accordionTitle: 'Часто задаваемые вопросы',
    backLabel: '← Назад',
    whatsappLabel: 'Написать в WhatsApp',
    whatsappText: 'Здравствуйте, Sahara Camp, у меня вопрос о...',
    faqs: [
      {
        q: 'Где находится лагерь?',
        a: 'Sahara Camp расположен в дюнах Тембайна, примерно в 30 км к северо-востоку от Дуза на юге Туниса. По запросу мы организуем трансфер из Дуза или Тозёра.'
      },
      {
        q: 'Какие варианты размещения есть?',
        a: 'У нас два варианта: традиционная берберская палатка (до 2 гостей, от 45 €/ночь) и роскошная палатка для глэмпинга (до 4 гостей, от 90 €/ночь). В обеих есть удобные кровати, завтрак и вид на пустыню.'
      },
      {
        q: 'Какие активности доступны?',
        a: 'Прогулки на верблюдах, экскурсии на 4×4, сандбординг, наблюдение за звёздами, поход на рассвете и традиционный берберский ужин под звёздами.'
      },
      {
        q: 'Как забронировать?',
        a: 'Используйте форму бронирования на этой странице или нажмите кнопку WhatsApp, чтобы отправить нам даты и вопросы. Мы подтвердим наличие мест и бронирование прямо в WhatsApp.'
      },
      {
        q: 'Что включено в проживание?',
        a: 'В проживание включены завтрак, удобная постель, электричество и доступ к удобствам лагеря. Трансфер, активности и ужин могут быть организованы за доплату.'
      },
      {
        q: 'Когда лучше всего приезжать?',
        a: 'Лучшее время — с октября по апрель, когда температура комфортная для прогулок по пустыне. Летом тоже можно, но днём очень жарко.'
      },
      {
        q: 'Принимаете ли вы оплату картой?',
        a: 'Мы в основном принимаем наличные при заезде или мобильный перевод. Детали подтверждаются во время бронирования в WhatsApp.'
      }
    ]
  },
  ar: {
    title: 'مخيم الصحراء',
    subtitle: 'اسألنا أي شيء',
    welcome: 'مرحباً! 👋 أهلاً بك في مخيم الصحراء. كيف يمكننا مساعدتك؟',
    quickReplies: {
      book: '🏕️ احجز إقامة',
      contact: '📞 تواصل معنا',
      questions: '❓ لدي سؤال',
    },
    accordionTitle: 'الأسئلة الشائعة',
    backLabel: '← العودة',
    whatsappLabel: 'الدردشة على واتساب',
    whatsappText: 'مرحباً مخيم الصحراء، لدي سؤال حول...',
    faqs: [
      {
        q: 'أين يقع المخيم؟',
        a: 'يقع مخيم الصحراء في كثبان تمبين، على بعد حوالي 30 كم شمال شرق دوز في جنوب تونس. يمكننا تنظيم النقل من دوز أو توزر عند الطلب.'
      },
      {
        q: 'ما خيارات الإقامة المتاحة؟',
        a: 'لدينا خياران: خيمة بربرية تقليدية (حتى شخصين، من 45 يورو/ليلة) وخيمة تخييم فاخرة (حتى 4 أشخاص، من 90 يورو/ليلة). كلاهما يتضمن أسرّة مريحة، إفطار، وإطلالة خاصة على الصحراء.'
      },
      {
        q: 'ما الأنشطة المتاحة؟',
        a: 'ركوب الجمال، جولات الصحراء بسيارة 4×4، التزلج على الرمال، مشاهدة النجوم، مشي شروق الشمس، وعشاء بربري تقليدي تحت النجوم.'
      },
      {
        q: 'كيف أحجز؟',
        a: 'استخدم نموذج الحجز في هذه الصفحة، أو اضغط على زر واتساب لإرسال تواريخك وأسئلتك. سنتأكد من التوفر ونؤكد حجزك مباشرة على واتساب.'
      },
      {
        q: 'ما المشمول في الإقامة؟',
        a: 'تشمل إقامتك الإفطار، مفروشات مريحة، الكهرباء، والوصول إلى مرافق المخيم. يمكن تنظيم النقل والأنشطة والعشاء كإضافات.'
      },
      {
        q: 'ما أفضل وقت للزيارة؟',
        a: 'أفضل وقت من أكتوبر إلى أبريل، عندما تكون درجات الحرارة ممتعة لاستكشاف الصحراء. الزيارة صيفاً ممكنة لكن الحر شديد نهاراً.'
      },
      {
        q: 'هل تقبلون الدفع بالبطاقة؟',
        a: 'نقبل بشكل أساسي الدفع نقداً عند الوصول أو عبر التحويل المحمول. التفاصيل تؤكد أثناء حجزك على واتساب.'
      }
    ]
  }
};

// WHATSAPP_NUMBER is declared at the top level of js/booking.js (loaded
// before this file). Reuse it when available; fall back to the literal so
// the chatbot still works if this file is ever loaded standalone.
const CHATBOT_WHATSAPP =
  (typeof WHATSAPP_NUMBER !== 'undefined') ? WHATSAPP_NUMBER : '21693290920';

/* =========================================
   Chatbot Component
   ========================================= */
const Chatbot = {
  currentLang: 'en',
  container: null,
  body: null,

  getLang() {
    let lang = window.currentLang || 'en';
    try {
      if (!lang || !CHATBOT_FAQS[lang]) {
        lang = localStorage.getItem('lang') || 'en';
      }
    } catch (_) {
      lang = 'en';
    }
    return CHATBOT_FAQS[lang] ? lang : 'en';
  },

  getData() {
    return CHATBOT_FAQS[this.currentLang] || CHATBOT_FAQS.en;
  },

  init() {
    this.container = document.getElementById('chatbot-widget');
    this.body      = document.getElementById('chatbot-body');
    if (!this.container || !this.body) return;

    this.currentLang = this.getLang();
    const data = this.getData();

    const titleEl    = document.getElementById('chatbot-title');
    const subtitleEl = document.getElementById('chatbot-subtitle');
    if (titleEl)    titleEl.textContent    = data.title;
    if (subtitleEl) subtitleEl.textContent = data.subtitle;

    // Re-render when language changes
    document.addEventListener('click', (e) => {
      const langBtn = e.target.closest('[data-lang]');
      if (langBtn) {
        setTimeout(() => {
          this.currentLang = this.getLang();
          const d = this.getData();
          const t = document.getElementById('chatbot-title');
          const s = document.getElementById('chatbot-subtitle');
          if (t) t.textContent = d.title;
          if (s) s.textContent = d.subtitle;
          this.renderHome();
        }, 50);
      }
    });

    this.renderHome();
  },

  renderHome() {
    const data = this.getData();
    this.body.innerHTML = `
      <div class="chatbot__welcome">
        <div class="chatbot__avatar" aria-hidden="true">🏕️</div>
        <p class="chatbot__bubble">${escapeHtml(data.welcome)}</p>
      </div>
      <div class="chatbot__quick-replies">
        <button class="chatbot__quick-reply" type="button" data-action="book">
          ${escapeHtml(data.quickReplies.book)}
        </button>
        <button class="chatbot__quick-reply" type="button" data-action="contact">
          ${escapeHtml(data.quickReplies.contact)}
        </button>
        <button class="chatbot__quick-reply" type="button" data-action="questions">
          ${escapeHtml(data.quickReplies.questions)}
        </button>
      </div>
    `;

    this.body.querySelectorAll('.chatbot__quick-reply').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (action === 'book') {
          const booking = document.getElementById('booking');
          if (booking) {
            this.container.classList.remove('chatbot--open');
            booking.scrollIntoView({ behavior: 'smooth' });
          }
        } else if (action === 'contact') {
          window.open(`https://wa.me/${CHATBOT_WHATSAPP}`, '_blank');
        } else if (action === 'questions') {
          this.renderAccordion();
        }
      });
    });
  },

  renderAccordion() {
    const data = this.getData();
    this.body.innerHTML = `
      <div class="chatbot__accordion-head">
        <button class="chatbot__back" type="button">
          ${escapeHtml(data.backLabel)}
        </button>
        <span class="chatbot__accordion-title">${escapeHtml(data.accordionTitle)}</span>
      </div>
      <div class="chatbot__accordion" role="list">
        ${data.faqs.map((f, i) => `
          <div class="chatbot__accordion-item" data-index="${i}" role="listitem">
            <button class="chatbot__accordion-trigger" type="button" aria-expanded="false">
              <span class="chatbot__accordion-q">${escapeHtml(f.q)}</span>
              <span class="chatbot__accordion-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
              </span>
            </button>
            <div class="chatbot__accordion-panel">
              <p class="chatbot__accordion-a">${escapeHtml(f.a)}</p>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="chatbot__footer">
        <a class="chatbot__whatsapp" href="https://wa.me/${CHATBOT_WHATSAPP}?text=${encodeURIComponent(data.whatsappText)}" target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          ${escapeHtml(data.whatsappLabel)}
        </a>
      </div>
    `;

    // Back button
    const backBtn = this.body.querySelector('.chatbot__back');
    if (backBtn) backBtn.addEventListener('click', () => this.renderHome());

    // Accordion toggle
    this.body.querySelectorAll('.chatbot__accordion-trigger').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const item = trigger.parentElement;
        const isOpen = item.classList.contains('chatbot__accordion-item--open');

        // Close all others
        this.body.querySelectorAll('.chatbot__accordion-item--open').forEach(other => {
          other.classList.remove('chatbot__accordion-item--open');
          const t = other.querySelector('.chatbot__accordion-trigger');
          if (t) t.setAttribute('aria-expanded', 'false');
        });

        // Toggle this one
        if (!isOpen) {
          item.classList.add('chatbot__accordion-item--open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* =========================================
   Init
   ========================================= */
function initChatbot() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Chatbot.init());
  } else {
    Chatbot.init();
  }
}

initChatbot();
