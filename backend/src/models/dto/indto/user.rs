use std::marker::PhantomData;

use secrecy::{ExposeSecret, Secret};
use serde::Deserialize;

use crate::models::parts::{DisplayName, Username};
use validator::ValidationError;

#[derive(Debug)]
pub struct PasswordChecked;

#[derive(Debug)]
pub struct PasswordUnchecked;

#[derive(Deserialize, Clone, Debug)]
pub struct UserInDTO<T> {
    pub display_name: DisplayName,
    pub username: Username,
    pub password: Secret<String>,
    pub password_again: Secret<String>,
    #[serde(skip_serializing, default)]
    ph: PhantomData<T>,
}

impl<T> UserInDTO<T> {
    #[must_use]
    pub fn new(
        display_name: DisplayName,
        username: Username,
        password: String,
        password_again: String,
    ) -> UserInDTO<PasswordUnchecked> {
        UserInDTO::<PasswordUnchecked> {
            display_name,
            username,
            password: Secret::new(password),
            password_again: Secret::new(password_again),
            ph: PhantomData,
        }
    }
}

impl UserInDTO<PasswordUnchecked> {
    pub fn check_passwords(self) -> Result<UserInDTO<PasswordChecked>, ValidationError> {
        let cs = self.password.expose_secret().chars();

        let l = self.password.expose_secret().len();

        if !(8..=100).contains(&l) {
            return Err(ValidationError::new(
                "Your password must be beetween 8 and 100 characters long.",
            ));
        }

        if !self
            .password
            .expose_secret()
            .eq(self.password_again.expose_secret())
        {
            return Err(ValidationError::new("Your passwords must match."));
        }

        if !cs.clone().any(|c| c.is_ascii_digit())
            || !cs.clone().any(char::is_uppercase)
            || !cs.clone().any(char::is_lowercase)
            || !cs.clone().any(|c| !c.is_alphanumeric())
        {
            return Err(ValidationError::new("In the password you must have at least a lowercase letter, an uppercase letter and one number and a special character."));
        }

        Ok(UserInDTO::<PasswordChecked> {
            display_name: self.display_name,
            username: self.username,
            password: self.password,
            password_again: self.password_again,
            ph: PhantomData,
        })
    }
}
