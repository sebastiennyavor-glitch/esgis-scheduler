import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Professeur, Delegue } from '@/types';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  professeurs: Professeur[];
  delegues: Delegue[];
  planningTitle: string;
}

type RecipientType = 'professeurs' | 'delegues' | 'tous';

const WhatsAppModal = ({ isOpen, onClose, professeurs, delegues, planningTitle }: WhatsAppModalProps) => {
  const [recipientType, setRecipientType] = useState<RecipientType>('tous');

  const getRecipients = () => {
    const profsWithPhone = professeurs.filter(p => p.telephone?.trim());
    const deleguesWithPhone = delegues.filter(d => d.telephone?.trim());

    switch (recipientType) {
      case 'professeurs':
        return profsWithPhone.map(p => ({
          name: `${p.prenom} ${p.nom}`,
          phone: p.telephone,
          type: 'professeur' as const,
        }));
      case 'delegues':
        return deleguesWithPhone.map(d => ({
          name: `${d.prenom} ${d.nom}`,
          phone: d.telephone,
          type: 'delegue' as const,
        }));
      case 'tous':
        return [
          ...profsWithPhone.map(p => ({
            name: `${p.prenom} ${p.nom}`,
            phone: p.telephone,
            type: 'professeur' as const,
          })),
          ...deleguesWithPhone.map(d => ({
            name: `${d.prenom} ${d.nom}`,
            phone: d.telephone,
            type: 'delegue' as const,
          })),
        ];
    }
  };

  const recipients = getRecipients();

  const getPersonalizedMessage = (recipient: { name: string; type: 'professeur' | 'delegue' }) => {
    if (recipient.type === 'professeur') {
      return `Bonjour ${recipient.name}, le planning ${planningTitle} a été publié. Consultez vos séances ici : https://esgis-program.vercel.app — Votre mot de passe par défaut : prof@2026 (vous serez invité à le changer à la première connexion)`;
    }
    return `Bonjour ${recipient.name}, le planning ${planningTitle} a été publié. Consultez le planning de votre salle ici : https://esgis-program.vercel.app — Votre mot de passe par défaut : delegue@2026 (vous serez invité à le changer à la première connexion)`;
  };

  const sendWhatsApp = (recipient: { name: string; phone: string; type: 'professeur' | 'delegue' }) => {
    const encodedMessage = encodeURIComponent(getPersonalizedMessage(recipient));
    const whatsappUrl = `https://wa.me/${recipient.phone.replace(/\D/g, '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-xl border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h2 className="font-heading text-lg font-bold text-foreground">Envoyer via WhatsApp</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted transition">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-3 gap-3">
            {(['professeurs', 'delegues', 'tous'] as const).map(type => (
              <button
                key={type}
                onClick={() => setRecipientType(type)}
                className={`px-4 py-3 rounded-lg font-semibold text-sm transition ${
                  recipientType === type
                    ? 'gradient-esgis text-primary-foreground shadow'
                    : 'border border-border bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {type === 'professeurs' && `Professeurs (${recipients.filter(r => r.type === 'professeur').length})`}
                {type === 'delegues' && `Délégués (${recipients.filter(r => r.type === 'delegue').length})`}
                {type === 'tous' && `Tous (${recipients.length})`}
              </button>
            ))}
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Aperçu du message :</p>
            <p className="text-sm text-foreground italic">
              « Bonjour [Prénom Nom], le planning {planningTitle} a été publié. Consultez ... ici : https://esgis-program.vercel.app — Votre mot de passe : [selon le rôle] »
            </p>
          </div>

          {recipients.length === 0 ? (
            <div className="rounded-lg border border-border bg-muted/50 p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Aucun {recipientType === 'tous' ? 'destinataire' : recipientType} avec numéro de téléphone
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="bg-muted/50 px-4 py-3 border-b border-border">
                <p className="text-sm font-semibold text-foreground">{recipients.length} destinataire(s)</p>
              </div>
              <div className="divide-y divide-border max-h-80 overflow-y-auto">
                {recipients.map((recipient, idx) => (
                  <div key={idx} className="px-4 py-3 flex items-center justify-between hover:bg-muted/30 transition">
                    <div>
                      <p className="font-semibold text-sm text-foreground">{recipient.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground font-mono">{recipient.phone}</p>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${recipient.type === 'professeur' ? 'bg-primary/10 text-primary' : 'bg-accent text-accent-foreground'}`}>
                          {recipient.type === 'professeur' ? 'Prof' : 'Délégué'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => sendWhatsApp(recipient)}
                      className="rounded-lg bg-green-600 hover:bg-green-700 p-2 text-white transition"
                      title="Envoyer via WhatsApp"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4 border-t border-border">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-border px-4 py-2 font-semibold text-sm text-muted-foreground hover:bg-muted transition"
            >
              Fermer
            </button>
            <button
              onClick={() => {
                recipients.forEach(r => sendWhatsApp(r));
                onClose();
              }}
              disabled={recipients.length === 0}
              className="flex-1 rounded-lg gradient-esgis px-4 py-2 font-semibold text-sm text-primary-foreground shadow-esgis disabled:opacity-60 transition"
            >
              Envoyer à tous
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppModal;
