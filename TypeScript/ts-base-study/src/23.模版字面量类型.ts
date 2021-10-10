// ====== 基础
type World = "word";
type Greeting = `hello ${World}`;
// "hello word"

type EmailLocaleIDs = "welcome_email" | "email_heading";
type FooterLocaleIDs = "footer_title" | "footer_sendoff";
type AllLocaleIDs = `${EmailLocaleIDs | FooterLocaleIDs}_id`;
// "welcome_email_id" | "email_heading_id" | "footer_title_id" | "footer_sendoff_id"

// ==== 操作固有字符串的类型

type S_1 = "word";
type T_1 = Uppercase<S_1>;
// "WORD"

type S_2 = "Word";
type T_2 = Lowercase<S_2>;
// "WORD"

type S_3 = "word";
type T_3 = Capitalize<S_3>;
// "Word"

type S_4 = "Word";
type T_4 = Uncapitalize<S_4>;
// "word"
