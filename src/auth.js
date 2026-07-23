import { supabase } from './supabaseClient.js';

// Cadastro padrão: a senha é criada na hora, e o Supabase manda um e-mail
// de confirmação com um link — a conta só fica utilizável depois que a
// pessoa clica nesse link (proteção contra e-mail forjado/errado).
//
// Cadastro em etapas (ver authSignupWizardHtml/handleSignupSubmit em
// main.js): telefone/endereço/cnpj vão em user_metadata do mesmo jeito que
// full_name/company_name já iam — handle_new_user (ver schema.sql) lê tudo
// isso ao criar a linha em profiles, então nada precisa de um UPDATE
// separado depois do signUp.
export async function signUp({
  email, password, fullName, companyName, captchaToken,
  phone = '', cnpj = '', cep = '', street = '', neighborhood = '', city = '', state = '', addressNumber = '', complement = '',
}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}${window.location.pathname}`,
      data: {
        full_name: fullName,
        company_name: companyName,
        phone,
        cnpj,
        cep,
        street,
        neighborhood,
        city,
        state,
        address_number: addressNumber,
        complement,
      },
      captchaToken,
    },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email, password, captchaToken) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password, options: { captchaToken } });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export function onAuthStateChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((event, session) => callback(event, session));
  return data.subscription;
}

// "Esqueci minha senha": manda um e-mail com um link que abre o app já
// autenticado num evento PASSWORD_RECOVERY (ver onAuthStateChange em
// main.js), sem exigir a senha atual — diferente de changePassword acima.
export async function requestPasswordReset(email, captchaToken) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}${window.location.pathname}`,
    captchaToken,
  });
  if (error) throw error;
}

export async function confirmPasswordReset(newPassword) {
  // needs_password_setup: false limpa a flag de quem veio de uma conta
  // criada sem senha (ver comentário em onAuthStateChange, main.js) —
  // inofensivo pra quem veio do "esqueci minha senha" de verdade, que nunca
  // teve essa flag setada.
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
    data: { needs_password_setup: false },
  });
  if (error) throw error;
}

// Exige a senha atual antes de trocar (evita que uma sessão aberta em outro
// lugar troque a senha sem o usuário confirmar quem ele é).
export async function changePassword(email, currentPassword, newPassword, captchaToken) {
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email,
    password: currentPassword,
    options: { captchaToken },
  });
  if (verifyError) throw new Error('Senha atual incorreta.');

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function updateEmail(newEmail) {
  const { error } = await supabase.auth.updateUser({ email: newEmail });
  if (error) throw error;
}
