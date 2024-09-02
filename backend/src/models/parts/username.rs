use nutype::nutype;

use crate::traits::SqlParamable;

#[nutype(
  sanitize(trim)
  validate(not_empty, max_len = 100)
)]
#[derive(AsRef, Deserialize, Serialize, Debug, Clone, Display)]
pub struct Username(String);

impl SqlParamable for Username {}
