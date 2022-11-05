import React from 'react';
import chunks from 'array.chunk'
import Translate from '@docusaurus/Translate';
import reactStringReplace from 'react-string-replace'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

const SampleTrList  = [
  "%firstname% %lastname% (%telephone%), sitenize üye oldu.",
  "Vermiş olduğunuz %productname%, %productmodel%, %productquantity% adet siparişiniz alınmıştır.",
  "Yeni bir sipariş geldi. (%orderid%,%productname%,%productmodel%,%productquantity%)",
  "%firstname% %lastname% (%telephone%) müşteriniz %reason% sebebiyle siparişini iptal etti.",
  "%order_id% nolu siparişinizin durumu kargoya verildi olarak değiştirildi.",
  "%order_id% nolu siparişiniz işleme alındı.",
  "%order_id% nolu siparişiniz iptal edildi.",
  "%order_id% nolu siparişiniz tamamlandı.",
  "%order_id% nolu siparişinizin iade işlemi tamamlandı."
]

const SampleEnList  = [
  "%firstname% %lastname% (%telephone%), sitenize üye oldu.",
  "Vermiş ürün %productname%, %productquantity% adet siparişiniz alınmıştır.",
  "Yeni bir sipariş geldi. (%orderid%,%productname%,%productmodel%,%productquantity%)",
  "%firstname% %lastname% (%telephone%) müşteriniz %nedeni% seçeneği siparişini iptal etti.",
  "%order_id% nolu sipariş durumunuzu kargoya giydirilmiş olarak kullanın.",
  "%order_id% nolu siparişiniz işlendi.",
  "%order_id% nolu siparişiniz iptal edildi.",
  "%order_id% nolu siparişiniz tamamlandı.",
  "%order_id% nolu siparişinizin iade işlemi doldurulur."
]

function SMS({body}) {

  const message = reactStringReplace(
    body,
    /(\%.*?\%)/gm,
    (match, i) => <span key={`sms-${i}`} className="badge badge--cta">{match}</span>
  );

  return (
    <div className="col col--4 margin-top--md">
      <div className="card card-samples">
        <div className="card__body">
          <p>{message}</p>
        </div>
      </div>
    </div>
  );
}

export default function Samples() {
  const {i18n} = useDocusaurusContext();
  let rows     = chunks(i18n.currentLocale === 'en' ? SampleEnList : SampleTrList, 3)

  const samples = rows.map((cols, idx) => {
    let row = cols.map((body, idx) => {
      return <SMS key={`sms-${idx}`} body={body} />
    })

    return <div key={`row-${idx}`} className="row">{row}</div>
  })

  return (
    <section className="samples padding-top--lg padding-bottom--lg">
      <div className="container">
				<h5 className="welcome-title">
					<Translate>Neler Yapabilirsiniz?</Translate>
				</h5>
        {samples}
      </div>
    </section>
  );
}
