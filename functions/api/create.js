export async function onRequestPost({request}) {

  let form        = await request.json()
  const signupRsp = await createAccount(form)

  if(signupRsp.status === 500) {
    return errorRsp(['Please try later.'])
  }

  let signup = await signupRsp.json()
  let errors = parseSignupResponse(signup);

  if(errors.length > 0) {
    return errorRsp(errors)
  }

  let isEmailValid = form.email.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );

  if(! isEmailValid) {
    return errorRsp(['Email adresinizi doğrulayamadık.'])
  }

  const emailRsp = await sendEmail(form)
  if(! emailRsp.ok) {
    return errorRsp(['Epostayı gönderemedik, lütfen tekrar deneyin.'])
  }

  return new Response(JSON.stringify({
    success: true,
  }), {
    status: 200,
    headers: {
      "content-type": "application/json"
    },
  })
}

function parseSignupResponse(response) {
  let falseFlag      = "Already member, if you forget password, try to recover."
  let errorContainer = [];

  for(const err in response.data?.error) {
    if(err.includes('is_')) {
      continue
    }

    if(response.data?.error[err] === falseFlag) {
      continue
    }

    errorContainer.push(response.data.error[err]);
  }

  return errorContainer
}

function errorRsp(errors) {
  return new Response(JSON.stringify({
    success: false,
    errNo: 422,
    errors: errors
  }), {
    status: 422,
    header: {
      "content-type": "application/json"
    }
  })
}

async function createAccount(form) {

  return fetch('https://app.ilet.io/api/panel/signup', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      aggrement: true,
      gsm: form.gsm,
      name_surname: form.name_surname,
      password: form.password,
      ref: "opencartsms.com",
      type:	"kurumsal"
    })
  })
}

async function sendEmail(form) {

  let trContent = `
    Merhaba,
    <br />
    <br />
    Opencart v2 sürümü için yapılmış eklentiyi indirmek için <a href="https://www.opencartsms.com/opencart_v2.zip">tıklayınız.</a>
    <br />
    Opencart v3 sürümü için yapılmış eklentiyi indirmek için <a href="https://www.opencartsms.com/opencart_v3.0.zip">tıklayınız.</a>
    <br />
    <br />
    <ul>
      <li>Eklentiyi yüklemek için vqmod yüklü olmalıdır,(<a href="https://github.com/vqmod/vqmod">İndirmek için tıklayın</a>)</li>
      <li>FTP ile sitenizin dosyalarınızın bulunduğu sunucuya bağlanın</li>
      <li>Şu anki dosyalarınızın yedeğini alın</li>
      <li>Zipini açtığınız dosyanın içinde iki klasor mevcuttur ilk defa kurulum yapıyorsanız yeni_kurulum klasorunu, eğer daha önceden eklentiyi kullanıyorsanız yükseltme klasoründeki dosyaları sunucunuza yükleyin.</li>
      <li>Yönetim panelinizden (Eklentiler->Moduller sayfasından) İleti Merkezi Sms Center eklentisini kurun</li>
      <li>Yönetim panelinizden (Eklentiler->Moduller sayfasından) İleti Merkezi Sms Center eklentisini düzenleye tıklayın</li>
      <li>Modül sayfasındaki ayarları yaparak kullanıma başlayabilirsiniz.</li>
    </ul>
    <br />
    <br />
    Kurulum aşamasında herhangi bir problem yaşarsanız, bizimle <b>0212-543-4210</b> veya
    <b>
      <a href="mailto:destek@emarka.com.tr">
        destek@emarka.com.tr
      </a>
    </b> iletişime geçebilirsiniz.
  `

  let enContent = `
    Hi,
    <br />
    <br />
    Click <a href="https://www.opencartsms.com/opencart_v2.zip">to download the plugin made for Opencart v2 version.</a>
    <br />
    Click <a href="https://www.opencartsms.com/opencart_v3.0.zip">to download the plugin made for Opencart v3 version.</a>
    <br />
    <br />
    <ul>
      <li>To install the plugin, vqmod must be installed,(<a href="https://github.com/vqmod/vqmod">Click to download</a>)</li>
      <li>Connect to the server where your site's files are located with FTP</li>
      <li>Take a backup of your current files</li>
      <li>There are two folders in the file you unzipped. If you are installing for the first time, upload the new_install folder, if you are using the plugin before, upload the files in the upgrade folder to your server.</li>
      <li>Install Ileti Merkezi Sms Center plugin from your administration panel (Plugins->Moduller page)</li>
      <li>Click on Edit Ileti Merkezi Sms Center plugin from your administration panel (Plugins->Moduller page)</li>
      <li>You can start using the settings on the module page.</li>
    </ul>
    <br />
    <br />
    If you have any problems during installation, contact us at <b>0212-543-4210</b> or
    <b>
      <a href="mailto:support@emarka.com.tr">
        support@emarka.com.tr
      </a>
    </b> you can contact us.
  `

  let trSubject = 'Opencart SMS Eklenti Kurulum Bilgileri'
  let enSubject = 'Opencart SMS Addon Setup Information'

  return fetch(new Request('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: form.email, name: form.name_surname }],
          },
        ],
        from: {
          email: 'no-reply@opencartsms.com',
          name: 'Opencart SMS',
        },
        subject: form.lang === 'tr' ? trSubject : enSubject,
        content: [
          {
            type: 'text/html',
            value: form.lang === 'tr' ? trContent : enContent,
          },
        ],
      }),
  }))
}