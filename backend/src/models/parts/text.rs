use nutype::nutype;

use crate::traits::SqlParamable;

#[nutype(
  sanitize(trim)
  validate(not_empty)
)]
#[derive(AsRef, Deserialize, Serialize, Debug, Clone, Display)]
pub struct Text(String);

impl SqlParamable for Text {}
