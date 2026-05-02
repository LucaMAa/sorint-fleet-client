import { Btn } from '../../components/ui'

interface Props { onClose: () => void }

export function RegistrationSuccessPopup({ onClose }: Props) {
  return (
    <div className="reg-popup-overlay" onClick={onClose}>
      <div className="reg-popup" onClick={e => e.stopPropagation()}>
        <div className="reg-popup-icon">✉️</div>
        <h2 className="reg-popup-title">Richiesta inviata!</h2>
        <p className="reg-popup-body">
          La tua richiesta di accesso è stata ricevuta.<br />
          Un amministratore la esaminerà a breve.<br />
          <strong>Riceverai accesso non appena verrà approvata.</strong>
        </p>
        <Btn onClick={onClose} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
          Capito, grazie!
        </Btn>
      </div>
    </div>
  )
}
